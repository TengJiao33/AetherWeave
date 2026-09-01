import { useEffect, useRef, memo } from 'react';
import { useEnvironment } from '../contexts/EnvironmentContext';

const WeatherOverlay = memo(function WeatherOverlay() {
    const { weather, windSpeed } = useEnvironment();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // 【Bug 修复】用 ref 存储 animationFrameId，避免清理时捕获闭包旧值导致残留动画
    const animFrameIdRef = useRef<number>(0);
    /**
     * 【性能优化 P0-D】将 windSpeed 存入 ref，动画帧内读取最新值。
     * 仅 weather 变化时重建粒子系统，风速滑块拖动不再触发
     * 整个 Canvas 粒子系统的销毁 → 重建。
     */
    const windSpeedRef = useRef(windSpeed);
    windSpeedRef.current = windSpeed;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: any[] = [];
        const w = (canvas.width = window.innerWidth);
        const h = (canvas.height = window.innerHeight);

        const createParticles = () => {
            particles = [];
            let count = 0;
            if (weather === 'rainy') count = 400;
            else if (weather === 'snowy') count = 150;
            else if (weather === 'hailing') count = 100;
            else if (weather === 'cloudy') count = 8;

            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    l: Math.random() * 25 + 15,
                    v: Math.random() * 5 + 8,
                    r: weather === 'cloudy' ? Math.random() * 250 + 200 : Math.random() * 3 + 1,
                    o: weather === 'cloudy' ? Math.random() * 0.2 + 0.15 : Math.random() * 0.5 + 0.3,
                    speed: Math.random() * 0.4 + 0.1
                });
            }
        };

        // 晴天：只绘制一次静态渐变，不持续 RAF
        if (weather === 'sunny') {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const gradient = ctx.createRadialGradient(w * 0.8, h * 0.1, 0, w * 0.8, h * 0.1, 400);
            gradient.addColorStop(0, 'rgba(255, 230, 150, 0.15)');
            gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.05)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, w, h);

            const handleResize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                const rw = canvas.width;
                const rh = canvas.height;
                const g = ctx.createRadialGradient(rw * 0.8, rh * 0.1, 0, rw * 0.8, rh * 0.1, 400);
                g.addColorStop(0, 'rgba(255, 230, 150, 0.15)');
                g.addColorStop(0.5, 'rgba(255, 200, 100, 0.05)');
                g.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, rw, rh);
            };
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }

        // 非晴天：隔帧渲染（~30fps），减少与 deck.gl 抢 CPU
        let frameSkip = false;

        const draw = () => {
            // 隔帧渲染：每两帧只绘制一帧
            frameSkip = !frameSkip;
            if (frameSkip) {
                animFrameIdRef.current = requestAnimationFrame(draw);
                return;
            }

            // 【P0-D】从 ref 读取最新风速值，而非闭包捕获
            const ws = windSpeedRef.current;

            ctx.clearRect(0, 0, w, h);
            
            if (weather === 'cloudy') {
                // Dynamic drifting clouds with richer appearance
                // 【性能优化 P0-5】原生 for 循环替代 forEach，消除热路径闭包开销
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    // Create a subtle cloud gradient
                    const cloudGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
                    cloudGrad.addColorStop(0, `rgba(180, 190, 210, ${p.o * 1.5})`); // Center is thicker
                    cloudGrad.addColorStop(0.6, `rgba(200, 210, 230, ${p.o})`);
                    cloudGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
                    
                    ctx.fillStyle = cloudGrad;
                    ctx.beginPath();
                    // Multi-layer cloud shape
                    ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Add a secondary blob for volume
                    ctx.beginPath();
                    ctx.ellipse(p.x + p.r * 0.3, p.y - p.r * 0.1, p.r * 0.6, p.r * 0.4, 0, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Move based on wind (double step to compensate for halved frame rate)
                    p.x += (p.speed + ws * 0.1) * 2;
                    if (p.x > w + p.r) {
                        p.x = -p.r;
                        p.y = Math.random() * h;
                    }
                }
            } else if (weather === 'rainy') {
                // Heavy rain
                ctx.strokeStyle = 'rgba(100, 140, 200, 0.7)'; // Darker, more visible
                ctx.lineWidth = 1.5;
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    const tilt = ws * 3;
                    ctx.lineTo(p.x + tilt, p.y + p.l * 1.5);
                    ctx.stroke();
                    p.y += p.v * 1.8 * 2;
                    p.x += tilt / 2 * 2;
                    if (p.y > h) { p.y = -p.l * 1.5; p.x = Math.random() * (w + tilt) - tilt; }
                }
            } else if (weather === 'snowy') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                    p.y += p.v * 0.4 * 2;
                    p.x += (Math.sin(p.y / 50 + p.x) * 1.5 + (ws * 0.3)) * 2;
                    if (p.y > h) { p.y = -p.r; p.x = Math.random() * w; }
                }
            } else if (weather === 'hailing') {
                ctx.fillStyle = 'rgba(230, 240, 255, 0.8)';
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r + 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    p.y += p.v * 2 * 2;
                    p.x += ws * 0.5 * 2;
                    if (p.y > h) { p.y = -p.r; p.x = Math.random() * w; }
                }
            }

            animFrameIdRef.current = requestAnimationFrame(draw);
        };

        createParticles();
        draw();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            createParticles();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, [weather]); // 【P0-D】移除 windSpeed 依赖，仅 weather 变化时重建

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 pointer-events-none z-[5]" 
            style={{ mixBlendMode: 'screen' }}
        />
    );
});

export default WeatherOverlay;
