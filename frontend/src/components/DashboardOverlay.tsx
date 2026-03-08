import { Activity, ShieldAlert, Package, Navigation, Zap, Wind, Sun } from 'lucide-react';

export default function DashboardOverlay({ hideRightPanels = false }: { hideRightPanels?: boolean }) {
    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 p-6 font-sans">
            {/* Top Bar Area */}
            <div className={`absolute top-6 right-6 flex justify-end items-start pointer-events-none gap-6 transition-all duration-300 ${hideRightPanels ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>

                {/* Right Panel: Weather & Env */}
                <div className="pointer-events-auto bg-white/40 backdrop-blur-2xl border border-white/50 p-4 rounded-3xl flex gap-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] text-slate-800">
                    <div className="flex flex-col items-center gap-1 px-2">
                        <Sun size={18} className="text-amber-500 drop-shadow-sm" />
                        <span className="text-[10px] text-slate-600 font-bold uppercase">清晰</span>
                        <span className="text-sm font-black drop-shadow-sm">26°C</span>
                    </div>
                    <div className="w-px bg-slate-300/60"></div>
                    <div className="flex flex-col items-center gap-1 px-2">
                        <Wind size={18} className="text-sky-500 drop-shadow-sm" />
                        <span className="text-[10px] text-slate-600 font-bold uppercase">风速</span>
                        <span className="text-sm font-black drop-shadow-sm">3m/s</span>
                    </div>
                    <div className="w-px bg-slate-300/60"></div>
                    <div className="flex flex-col items-center gap-1 px-2">
                        <Zap size={18} className="text-emerald-500 drop-shadow-sm" />
                        <span className="text-[10px] text-slate-600 font-bold uppercase">遥测</span>
                        <span className="text-sm font-black drop-shadow-sm">9ms</span>
                    </div>
                </div>
            </div>

            {/* Left Bottom Panel: Primary Info Window */}
            <div className="absolute bottom-10 left-6 pointer-events-auto bg-white/40 backdrop-blur-2xl border border-white/50 px-7 py-6 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] min-w-[360px] flex flex-col gap-6 overflow-hidden">
                {/* 微弱的暗色垫底渐变，增强文字对比度 */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 to-transparent pointer-events-none"></div>

                {/* Header */}
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-1">
                        <h1 className="text-xl font-bold tracking-wide text-slate-800" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
                            城市低空物流网络
                        </h1>
                        <div className="flex items-center gap-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                            <span className="text-[10px] text-emerald-700 font-bold tracking-wider">ONLINE</span>
                        </div>
                    </div>
                    <p className="text-slate-600 text-xs font-medium tracking-wider" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.8)' }}>
                        深圳南山运营控制中心
                    </p>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-slate-300 via-slate-200 to-transparent relative z-10"></div>

                {/* Metrics */}
                <div className="flex flex-col gap-5 relative z-10">
                    <div className="flex flex-col gap-1.5 group">
                        <span className="text-slate-600 text-[11px] font-bold flex items-center gap-2 tracking-wide uppercase">
                            <Navigation size={14} className="text-blue-600" /> 活跃无人机阵列
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span id="dashboard-active-drones" className="text-slate-800 text-3xl font-black tracking-tight drop-shadow-sm">0</span>
                            <span className="text-slate-500 text-xs font-bold">架次</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 group">
                        <span className="text-slate-600 text-[11px] font-bold flex items-center gap-2 tracking-wide uppercase">
                            <Package size={14} className="text-indigo-600" /> 今日累计起飞
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span id="dashboard-cumulative-flights" className="text-slate-800 text-3xl font-black tracking-tight drop-shadow-sm">0</span>
                            <span className="text-slate-500 text-xs font-bold">架次</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 group">
                        <span className="text-slate-600 text-[11px] font-bold flex items-center gap-2 tracking-wide uppercase">
                            <Activity size={14} className="text-rose-600" /> 当前空域负载率
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-200/80 rounded-full overflow-hidden shadow-inner border border-slate-300/50">
                                <div id="dashboard-airspace-bar" className="h-full w-[0%] bg-gradient-to-r from-rose-400 to-rose-500 rounded-full shadow-sm transition-all duration-300 ease-out"></div>
                            </div>
                            <span id="dashboard-airspace-load" className="text-slate-800 text-lg font-black drop-shadow-sm w-12 text-right">0%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Right Panel: Event Logs */}
            <div className={`absolute bottom-6 right-6 pointer-events-auto w-[380px] transition-all duration-300 ${hideRightPanels ? 'opacity-0 translate-x-4 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
                <div className="bg-white/40 backdrop-blur-2xl border border-white/50 p-6 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent pointer-events-none"></div>

                    <h3 className="relative z-10 text-xs font-black text-slate-700 tracking-wider mb-5 flex items-center gap-2" style={{ textShadow: '0 1px 1px rgba(255,255,255,0.8)' }}>
                        <ShieldAlert size={16} className="text-rose-500" />
                        安全事件预警
                    </h3>

                    <div className="flex flex-col gap-4 relative z-10">
                        <div className="relative overflow-hidden bg-white/60 border border-white/80 rounded-2xl p-4 hover:bg-white/80 transition-colors cursor-pointer group shadow-sm">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-rose-400 to-rose-500 rounded-l-2xl"></div>
                            <div className="flex justify-between items-center mb-2 pl-3">
                                <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full shadow-sm">区域告警</span>
                                <span className="text-[10px] text-slate-500 font-bold">1分钟前</span>
                            </div>
                            <p className="text-sm text-slate-700 font-bold leading-relaxed pl-3 tracking-wide">航线偏离预警：某设备接近深圳南山医院限制空域边界。</p>
                        </div>

                        <div className="relative overflow-hidden bg-white/60 border border-white/80 rounded-2xl p-4 hover:bg-white/80 transition-colors cursor-pointer group shadow-sm">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-500 rounded-l-2xl"></div>
                            <div className="flex justify-between items-center mb-2 pl-3">
                                <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full shadow-sm">环境提示</span>
                                <span className="text-[10px] text-slate-500 font-bold">5分钟前</span>
                            </div>
                            <p className="text-sm text-slate-700 font-bold leading-relaxed pl-3 tracking-wide">气象雷达显示，总部枢纽站C区出现中度风切变，建议拉大调度间距。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
