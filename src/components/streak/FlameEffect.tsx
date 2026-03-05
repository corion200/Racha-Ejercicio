"use client";

import { useEffect, useRef, useCallback } from "react";
import { LevelInfo } from "@/utils/levelSystem";

interface FlameEffectProps {
  levelInfo: LevelInfo;
  isActive?: boolean;
  isPressed?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
}

export function FlameEffect({ levelInfo, isActive = true, isPressed = false }: FlameEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  const { flameIntensity, flameColors, glowColor } = levelInfo;

  const createParticle = useCallback((centerX: number, centerY: number, baseRadius: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const distance = baseRadius * 0.5 + Math.random() * baseRadius * 0.3;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance * 0.7;
    
    // Scale based on flame intensity (1-10)
    const intensityScale = 0.5 + (flameIntensity / 10) * 1.5;
    
    return {
      x,
      y,
      vx: (Math.random() - 0.5) * 2 * intensityScale,
      vy: -Math.random() * 4 * intensityScale - 2,
      life: 0,
      maxLife: 30 + Math.random() * 40 * (flameIntensity / 5),
      size: (3 + Math.random() * 8) * intensityScale,
      color: flameColors[Math.floor(Math.random() * flameColors.length)],
      opacity: 0.6 + Math.random() * 0.4,
    };
  }, [flameColors, flameIntensity]);

  const updateParticles = useCallback((centerX: number, centerY: number, baseRadius: number) => {
    const particles = particlesRef.current;
    
    // Add new particles based on intensity
    const particlesToAdd = Math.floor(flameIntensity * (isPressed ? 3 : 1));
    for (let i = 0; i < particlesToAdd; i++) {
      if (particles.length < 150 * (flameIntensity / 5)) {
        particles.push(createParticle(centerX, centerY, baseRadius));
      }
    }

    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      
      // Slow down as particle rises
      p.vy *= 0.98;
      p.vx *= 0.99;
      
      // Fade out
      const lifeRatio = p.life / p.maxLife;
      p.opacity = (1 - lifeRatio) * 0.8;
      p.size *= 0.995;

      // Remove dead particles
      if (p.life >= p.maxLife || p.size < 0.5) {
        particles.splice(i, 1);
      }
    }
  }, [flameIntensity, isPressed, createParticle]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size
    );
    
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(0.5, particle.color + "80");
    gradient.addColorStop(1, "transparent");
    
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resizeCanvas = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      if (!isActive) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 + 20;
      const baseRadius = Math.min(width, height) * 0.25;

      updateParticles(centerX, centerY, baseRadius);

      // Draw glow effect at base
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY + 30, 0,
        centerX, centerY + 30, baseRadius * 1.5
      );
      glowGradient.addColorStop(0, glowColor);
      glowGradient.addColorStop(0.5, glowColor.replace(/[\d.]+\)$/, "0.3)"));
      glowGradient.addColorStop(1, "transparent");
      
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw particles
      for (const particle of particlesRef.current) {
        drawParticle(ctx, particle);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, updateParticles, drawParticle, glowColor]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: "100%",
        height: "100%",
        filter: isPressed ? "brightness(1.3)" : "brightness(1)",
      }}
    />
  );
}

// Alternative CSS-based flame for lower intensity levels
export function CSSFlameEffect({ levelInfo, isActive = true }: { levelInfo: LevelInfo; isActive?: boolean }) {
  const { flameIntensity, flameColors, glowColor } = levelInfo;
  
  // Generate flame elements based on intensity
  const flameCount = Math.min(12, Math.max(4, flameIntensity * 2));
  const flames = Array.from({ length: flameCount }, (_, i) => i);
  
  const glowWidth = 60 + flameIntensity * 10;
  const glowHeight = 60 + flameIntensity * 10;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {/* Glow layer */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-all duration-300"
        style={{
          width: glowWidth + "%",
          height: glowHeight + "%",
          background: "radial-gradient(circle, " + glowColor + " 0%, transparent 70%)",
          opacity: isActive ? 0.8 : 0.3,
        }}
      />
      
      {/* Flame particles */}
      {flames.map((i) => {
        const angle = (i / flameCount) * 360;
        const delay = (i / flameCount) * 2;
        const size = 8 + flameIntensity * 3;
        const flameDistance = 30 + flameIntensity * 5;
        const colorIndex = i % flameColors.length;
        
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 animate-flame"
          >
            <div
              className="rounded-full blur-sm animate-flame-particle"
              style={{
                width: size,
                height: size * 1.5,
                background: "radial-gradient(ellipse, " + flameColors[colorIndex] + " 0%, transparent 70%)",
                transform: "rotate(" + angle + "deg) translateY(-" + flameDistance + "px)",
                animationDelay: delay + "s",
                opacity: isActive ? 0.9 : 0.3,
              }}
            />
          </div>
        );
      })}
      
      {/* Inner glow ring */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse-glow"
        style={{
          width: "70%",
          height: "70%",
          border: "2px solid " + flameColors[0],
          opacity: isActive ? 0.5 : 0.2,
          boxShadow: "0 0 20px " + glowColor + ", inset 0 0 20px " + glowColor,
        }}
      />
    </div>
  );
}
