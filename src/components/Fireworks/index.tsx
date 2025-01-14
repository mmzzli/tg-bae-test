import React, { useEffect, useRef } from 'react';

interface Config {
  launchInterval: number;  // 发射间隔
  fadeSpeed: number;       // 粒子消散速度
}

interface FireworksAnimationProps {
  duration?: number;        // 动画持续时间（毫秒）
  onComplete?: () => void;  // 动画结束回调
}

const CONFIG: Config = {
  launchInterval: 100,  // 发射间隔（更自然）
  fadeSpeed: 0.05,      // 粒子消散速度（加快消散）
};

class Rocket {
  x: number;
  y: number;
  speed: number;
  targetY: number;
  color: string;
  exploded: boolean;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = canvasHeight;
    this.speed = 7 + Math.random() * 3;
    this.targetY = canvasHeight * 0.25 + Math.random() * 100;
    this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    this.exploded = false;
  }

  update(particles: Particle[]) {
    this.y -= this.speed;
    if (this.y <= this.targetY && !this.exploded) {
      this.explode(particles);
      this.exploded = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  explode(particles: Particle[]) {
    const particleCount = 60 + Math.random() * 40;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(this.x, this.y, this.color));
    }
  }
}

class Particle {
  x: number;
  y: number;
  speed: number;
  angle: number;
  gravity: number;
  friction: number;
  alpha: number;
  decay: number;
  color: string;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.speed = Math.random() * 4 + 1;
    this.angle = Math.random() * Math.PI * 2;
    this.gravity = 0.1;       // 加强重力
    this.friction = 0.96;     // 降低摩擦力
    this.alpha = 1;
    this.decay = Math.random() * CONFIG.fadeSpeed + 0.02;  // 加速粒子消散
    this.color = color;
  }

  update() {
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha = Math.max(0, this.alpha - this.decay);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

const FireworksAnimation: React.FC<FireworksAnimationProps> = ({ duration = 5000, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const rockets: Rocket[] = [];
  const particles: Particle[] = [];
  const startTime = useRef<number>(0);
  const isStopped = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    startTime.current = performance.now();

    const launchRocket = () => {
      if (isStopped.current) return;
      rockets.push(new Rocket(canvas.width, canvas.height));
    };

    const animate = () => {
      const elapsedTime = performance.now() - startTime.current;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';  // 背景更快消失
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 更新和绘制火箭
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        rocket.update(particles);
        rocket.draw(ctx);
        if (rocket.exploded) rockets.splice(i, 1);
      }

      // 更新和绘制粒子
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        if (particle.alpha <= 0.01) {
          particles.splice(i, 1);
        } else {
          particle.draw(ctx);
        }
      }

      // 超过持续时间后停止发射新烟花
      if (elapsedTime >= duration) {
        isStopped.current = true;
      }

      // 判断所有烟花和粒子是否已结束
      if (isStopped.current && rockets.length === 0 && particles.length === 0) {
        cancelAnimationFrame(animationFrameRef.current!);
        onComplete?.();  // 动画结束回调
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const interval = setInterval(launchRocket, CONFIG.launchInterval);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(interval);
      cancelAnimationFrame(animationFrameRef.current!);
    };
  }, [duration, onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', backgroundColor: '#000' }} />
    </div>
  );
};

export default FireworksAnimation;
