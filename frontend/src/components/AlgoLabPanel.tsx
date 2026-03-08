/**
 * AlgoLabPanel.tsx — 飞行轨迹算法调试面板
 *
 * 功能：
 *  1. 批量生成：输入数量 → POST /api/batch → 前端吐出新轨迹
 *  2. 选点生成：点击地图上两个 demand POI → POST /api/single → 实时渲染
 *  3. 状态展示：生成条数、违规段、耗时
 *
 * 通过 Props 通知父组件 (MapContainer) 刷新轨迹数据。
 */
import { useState, useCallback, useEffect } from 'react';

// ─── 类型定义 ───────────────────────────────────────────────────────────────
interface AlgoLabPanelProps {
    city: string;
    /** 当轨迹 JSON 写入完成后调用，触发父组件重新加载 */
    onTrajectoriesUpdated: () => void;
    /** 当前"待选起点/终点"模式：null=不在选点, 'from'=等待起点, 'to'=等待终点 */
    pickMode: 'from' | 'to' | null;
    setPickMode: (m: 'from' | 'to' | null) => void;
    pickedFrom: { lat: number; lon: number; id: string; name: string } | null;
    pickedTo: { lat: number; lon: number; id: string; name: string } | null;
    onClearPick: () => void;
    onToggle?: (open: boolean) => void;
}

interface GenResult {
    ok: boolean;
    generated?: number;
    total_violations?: number;
    elapsed_s?: number;
    flight_id?: string;
    dist_m?: number;
    nfz_violations?: number;
    error?: string;
}

// ─── 组件 ───────────────────────────────────────────────────────────────────
export default function AlgoLabPanel({
    city,
    onTrajectoriesUpdated,
    pickMode,
    setPickMode,
    pickedFrom,
    pickedTo,
    onClearPick,
    onToggle,
}: AlgoLabPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(v => {
            const next = !v;
            onToggle?.(next);
            return next;
        });
    };
    const [batchN, setBatchN] = useState(30);
    const [batchSeed, setBatchSeed] = useState(42);
    const [minDist, setMinDist] = useState(400);
    const [maxDist, setMaxDist] = useState(8000);
    const [isLoading, setIsLoading] = useState(false);
    const [lastResult, setLastResult] = useState<GenResult | null>(null);
    const [serverOk, setServerOk] = useState<boolean | null>(null);

    // ── 检查 Flask 服务是否在线 ─────────────────────────────────────────
    const checkServer = useCallback(async () => {
        try {
            const r = await fetch('/api/status', { signal: AbortSignal.timeout(2000) });
            setServerOk(r.ok);
        } catch {
            setServerOk(false);
        }
    }, []);

    useEffect(() => {
        checkServer();
        const id = setInterval(checkServer, 8000);
        return () => clearInterval(id);
    }, [checkServer]);

    // ── 批量生成 ───────────────────────────────────────────────────────────
    const handleBatchGenerate = useCallback(async () => {
        setIsLoading(true);
        setLastResult(null);
        try {
            const r = await fetch('/api/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ city, n: batchN, min_dist: minDist, max_dist: maxDist, seed: batchSeed }),
            });
            const data: GenResult = await r.json();
            setLastResult(data);
            if (data.ok) {
                // 短暂延迟让文件系统写入完成，再通知父组件刷新
                setTimeout(onTrajectoriesUpdated, 300);
            }
        } catch (e: any) {
            setLastResult({ ok: false, error: e.message });
        } finally {
            setIsLoading(false);
        }
    }, [city, batchN, minDist, maxDist, batchSeed, onTrajectoriesUpdated]);

    // ── 单条生成 ───────────────────────────────────────────────────────────
    const handleSingleGenerate = useCallback(async () => {
        if (!pickedFrom || !pickedTo) return;
        setIsLoading(true);
        setLastResult(null);
        try {
            const r = await fetch('/api/single', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    city,
                    from_lat: pickedFrom.lat,
                    from_lon: pickedFrom.lon,
                    from_id: pickedFrom.id,
                    to_lat: pickedTo.lat,
                    to_lon: pickedTo.lon,
                    to_id: pickedTo.id,
                    append: false,
                }),
            });
            const data: GenResult = await r.json();
            setLastResult(data);
            if (data.ok) {
                onClearPick();
                setTimeout(onTrajectoriesUpdated, 300);
            }
        } catch (e: any) {
            setLastResult({ ok: false, error: e.message });
        } finally {
            setIsLoading(false);
        }
    }, [city, pickedFrom, pickedTo, onTrajectoriesUpdated, onClearPick]);

    // ─── UI ────────────────────────────────────────────────────────────────
    return (
        <>
            {/* 浮动触发按钮 */}
            <button
                id="algo-lab-toggle"
                onClick={handleToggle}
                className={`absolute top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isOpen ? 'right-[380px] opacity-0 pointer-events-none' : 'right-4 opacity-100 hover:scale-110'}`}
                style={{
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(255,255,255,0.6)',
                    color: '#4f46e5',
                }}
                title="算法调试面板"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
            </button>

            {/* 抽屉面板 */}
            {isOpen && (
                <div
                    id="algo-lab-panel"
                    className="absolute top-0 right-0 z-20 h-full w-[360px] flex flex-col bg-white/40 backdrop-blur-2xl border-l border-white/50 shadow-[-8px_0_32px_0_rgba(31,38,135,0.15)] text-slate-800"
                >
                    {/* 标题栏 */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-300/50">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${serverOk === null ? 'bg-yellow-400 animate-pulse' : serverOk ? 'bg-emerald-400' : 'bg-red-500 animate-pulse'}`} />
                            <span className="text-slate-800 font-bold text-sm tracking-wide">算法调试面板</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-indigo-600 font-mono font-bold mr-1">{city}</span>
                            <button onClick={() => { setIsOpen(false); onToggle?.(false); }} className="text-slate-400 hover:text-slate-700 transition-colors bg-white/50 p-1 rounded-full hover:bg-white/80">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* 服务离线提示 */}
                    {serverOk === false && (
                        <div className="mx-4 mt-3 px-3 py-2 rounded-lg text-xs text-amber-300 font-mono"
                            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
                            ⚠ Flask 服务未启动<br />
                            <span className="opacity-70">python trajectory_lab/server.py</span>
                        </div>
                    )}

                    {/* 内容区（可滚动） */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5">

                        {/* ── 区块 1：批量生成 ───────────────────────── */}
                        <section>
                            <h3 className="text-xs font-black text-indigo-600 tracking-widest uppercase mb-3">⚡ 批量随机生成</h3>
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-600">轨迹条数</label>
                                    <input
                                        id="batch-n-input"
                                        type="number" min={1} max={2000} value={batchN}
                                        onChange={e => setBatchN(Number(e.target.value))}
                                        className="w-20 bg-white/60 text-slate-800 text-xs text-right rounded-lg px-2 py-1.5 border border-white/80 focus:border-indigo-400 outline-none shadow-sm font-mono"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-600">随机种子</label>
                                    <input
                                        id="batch-seed-input"
                                        type="number" value={batchSeed}
                                        onChange={e => setBatchSeed(Number(e.target.value))}
                                        className="w-20 bg-white/60 text-slate-800 text-xs text-right rounded-lg px-2 py-1.5 border border-white/80 focus:border-indigo-400 outline-none shadow-sm font-mono"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-600">最短距离 (m)</label>
                                    <input
                                        id="batch-mindist-input"
                                        type="number" step={100} value={minDist}
                                        onChange={e => setMinDist(Number(e.target.value))}
                                        className="w-20 bg-white/60 text-slate-800 text-xs text-right rounded-lg px-2 py-1.5 border border-white/80 focus:border-indigo-400 outline-none shadow-sm font-mono"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-600">最长距离 (m)</label>
                                    <input
                                        id="batch-maxdist-input"
                                        type="number" step={500} value={maxDist}
                                        onChange={e => setMaxDist(Number(e.target.value))}
                                        className="w-20 bg-white/60 text-slate-800 text-xs text-right rounded-lg px-2 py-1.5 border border-white/80 focus:border-indigo-400 outline-none shadow-sm font-mono"
                                    />
                                </div>
                            </div>
                            <button
                                id="batch-generate-btn"
                                onClick={handleBatchGenerate}
                                disabled={isLoading || serverOk === false}
                                className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-40"
                                style={{
                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                    color: '#fff',
                                    boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                                }}
                            >
                                {isLoading ? '生成中...' : `生成 ${batchN} 条轨迹`}
                            </button>
                        </section>

                        {/* 分隔线 */}
                        <div className="border-t border-slate-300/50" />

                        {/* ── 区块 2：选点生成 ───────────────────────── */}
                        <section>
                            <h3 className="text-xs font-black text-cyan-600 tracking-widest uppercase mb-3">🎯 指定两点生成</h3>
                            <p className="text-xs text-slate-600 mb-3 leading-relaxed font-medium">
                                点击下方按钮后，在地图上点击一个 demand POI（绿色圆点）作为起点/终点。
                            </p>

                            {/* 起点 */}
                            <div className="flex items-center gap-2 mb-2">
                                <button
                                    id="pick-from-btn"
                                    onClick={() => setPickMode(pickMode === 'from' ? null : 'from')}
                                    disabled={isLoading}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${pickMode === 'from'
                                        ? 'bg-emerald-500 text-white animate-pulse'
                                        : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-white/80'
                                        }`}
                                >
                                    {pickMode === 'from' ? '📍 点击地图选起点...' : '选起点'}
                                </button>
                                {pickedFrom && (
                                    <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1.5 text-xs text-emerald-700 font-bold truncate shadow-sm">
                                        {pickedFrom.name || `(${pickedFrom.lat.toFixed(4)},${pickedFrom.lon.toFixed(4)})`}
                                    </div>
                                )}
                            </div>

                            {/* 终点 */}
                            <div className="flex items-center gap-2 mb-3">
                                <button
                                    id="pick-to-btn"
                                    onClick={() => setPickMode(pickMode === 'to' ? null : 'to')}
                                    disabled={isLoading}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${pickMode === 'to'
                                        ? 'bg-rose-500 text-white animate-pulse'
                                        : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-white/80'
                                        }`}
                                >
                                    {pickMode === 'to' ? '📍 点击地图选终点...' : '选终点'}
                                </button>
                                {pickedTo && (
                                    <div className="flex-1 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1.5 text-xs text-rose-700 font-bold truncate shadow-sm">
                                        {pickedTo.name || `(${pickedTo.lat.toFixed(4)},${pickedTo.lon.toFixed(4)})`}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    id="single-generate-btn"
                                    onClick={handleSingleGenerate}
                                    disabled={isLoading || !pickedFrom || !pickedTo || serverOk === false}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-40 shadow-sm"
                                    style={{
                                        background: pickedFrom && pickedTo ? 'linear-gradient(135deg,#06b6d4,#3b82f6)' : '#e2e8f0',
                                        color: pickedFrom && pickedTo ? '#fff' : '#64748b',
                                        boxShadow: pickedFrom && pickedTo ? '0 4px 16px rgba(6,182,212,0.3)' : 'none',
                                    }}
                                >
                                    {isLoading ? '生成中...' : '生成单条'}
                                </button>
                                {(pickedFrom || pickedTo) && (
                                    <button
                                        onClick={onClearPick}
                                        className="px-3 py-2.5 rounded-xl text-xs text-slate-600 font-bold bg-white/60 border border-white/80 hover:bg-white/80 transition-all shadow-sm"
                                    >
                                        清空
                                    </button>
                                )}
                            </div>
                        </section>

                        {/* ── 区块 3：上次结果 ───────────────────────── */}
                        {lastResult && (
                            <>
                                <div className="border-t border-slate-300/50" />
                                <section>
                                    <h3 className="text-xs font-black text-slate-500 tracking-widest uppercase mb-2">上次生成结果</h3>
                                    {lastResult.ok ? (
                                        <div className="space-y-1.5 text-xs font-mono font-bold">
                                            {lastResult.generated !== undefined && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">轨迹条数</span>
                                                    <span className="text-emerald-600">{lastResult.generated}</span>
                                                </div>
                                            )}
                                            {lastResult.flight_id && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">航班 ID</span>
                                                    <span className="text-indigo-600 truncate max-w-[140px]">{lastResult.flight_id}</span>
                                                </div>
                                            )}
                                            {lastResult.dist_m !== undefined && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">飞行距离</span>
                                                    <span className="text-slate-700">{(lastResult.dist_m / 1000).toFixed(2)} km</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">禁飞区违规段</span>
                                                <span className={lastResult.total_violations || lastResult.nfz_violations
                                                    ? 'text-amber-600' : 'text-emerald-600'}>
                                                    {lastResult.total_violations ?? lastResult.nfz_violations ?? 0}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">耗时</span>
                                                <span className="text-slate-700">{lastResult.elapsed_s}s</span>
                                            </div>
                                            <div className="mt-2 text-xs text-slate-500 italic font-sans">
                                                违规段非零属正常（直线占位版），待绕行算法迭代。
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 shadow-sm font-bold">
                                            ❌ {lastResult.error}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}
                    </div>

                    {/* 底部说明 */}
                    <div className="px-4 py-3 border-t border-slate-300/50 text-xs text-slate-500 font-bold tracking-wide">
                        trajectory_lab / planner v0 · 直线占位
                    </div>
                </div>
            )}
        </>
    );
}
