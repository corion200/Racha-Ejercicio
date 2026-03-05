"use client";

import { useState, useCallback } from "react";
import { ChevronUp } from "lucide-react";
import { LevelInfo } from "@/utils/levelSystem";
import { FlameEffect } from "./FlameEffect";
import { cn } from "@/lib/utils";

interface StreakButtonProps {
  levelInfo: LevelInfo;
  streakCount: number;
  canClickToday: boolean;
  onIncrement: () => boolean;
  disabled?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export function StreakButton({
  levelInfo,
  streakCount,
  canClickToday,
  onIncrement,
  disabled = false,
}: StreakButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [scale, setScale] = useState(1);

  const { primaryColor, secondaryColor, glowColor, flameIntensity, flameColors } = levelInfo;

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const count = 20 + flameIntensity * 5;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 5 + Math.random() * 10;
      
      newParticles.push({
        id: Date.now() + i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        color: flameColors[Math.floor(Math.random() * flameColors.length)],
        size: 4 + Math.random() * 8,
      });
    }

    setParticles(newParticles);

    // Clear particles after animation
    setTimeout(() => {
      setParticles([]);
    }, 1000);
  }, [flameColors, flameIntensity]);

  const handleClick = useCallback(() => {
    if (!canClickToday || disabled) return;

    const success = onIncrement();
    if (success) {
      setIsPressed(true);
      setShowCelebration(true);
      setScale(1.2);
      
      createParticles();

      // Reset animations
      setTimeout(() => {
        setIsPressed(false);
        setScale(1);
      }, 200);

      setTimeout(() => {
        setShowCelebration(false);
      }, 1500);
    }
  }, [canClickToday, disabled, onIncrement, createParticles]);

  const isDisabled = !canClickToday || disabled;

  return (
    <div className="relative flex items-center justify-center">
      {/* Flame effect container */}
      <div className="absolute w-[280px] h-[280px] -z-10">
        <FlameEffect
          levelInfo={levelInfo}
          isActive={!isDisabled}
          isPressed={isPressed}
        />
      </div>

      {/* Particles container */}
      {particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full animate-particle-burst"
              style={{
                left: "50%",
                top: "50%",
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                "--tx": `${particle.vx * 10}px`,
                "--ty": `${particle.vy * 10}px`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Main button */}
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={cn(
          "relative w-36 h-36 rounded-full flex flex-col items-center justify-center",
          "transition-all duration-200 ease-out select-none",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-white/30",
          "active:scale-95",
          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
        style={{
          transform: `scale(${scale})`,
          background: isDisabled
            ? "linear-gradient(145deg, #374151, #1F2937)"
            : `linear-gradient(145deg, ${primaryColor}, ${secondaryColor})`,
          boxShadow: isDisabled
            ? "inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)"
            : `0 0 30px ${glowColor}, 0 0 60px ${glowColor.replace(/[\d.]+\)$/, "0.3)")}, inset 0 2px 4px rgba(255,255,255,0.2)`,
        }}
        aria-label={canClickToday ? "Incrementar racha" : "Ya completaste hoy"}
      >
        {/* Inner glow ring */}
        <div
          className={cn(
            "absolute inset-2 rounded-full transition-opacity duration-200",
            isDisabled ? "opacity-20" : "opacity-60"
          )}
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
          }}
        />

        {/* Button content */}
        <ChevronUp
          className={cn(
            "w-16 h-16 transition-all duration-200",
            isDisabled ? "text-gray-400" : "text-white"
          )}
          style={{
            filter: isDisabled ? "none" : `drop-shadow(0 0 10px ${primaryColor})`,
          }}
        />
        
        {/* Streak count */}
        <span
          className={cn(
            "text-2xl font-bold transition-all duration-200",
            isDisabled ? "text-gray-400" : "text-white"
          )}
          style={{
            textShadow: isDisabled ? "none" : `0 0 20px ${primaryColor}`,
          }}
        >
          {streakCount}
        </span>

        {/* Disabled overlay */}
        {isDisabled && (
          <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-300 text-center px-2">
              ✓ Listo
            </span>
          </div>
        )}
      </button>

      {/* Celebration ring */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 rounded-full animate-celebration-ring"
            style={{
              border: `3px solid ${primaryColor}`,
              boxShadow: `0 0 20px ${glowColor}`,
            }}
          />
          <div
            className="absolute inset-0 rounded-full animate-celebration-ring animation-delay-200"
            style={{
              border: `2px solid ${secondaryColor}`,
              boxShadow: `0 0 15px ${glowColor}`,
            }}
          />
        </div>
      )}

      {/* Pulse rings for active state */}
      {!isDisabled && !showCelebration && (
        <>
          <div
            className="absolute w-36 h-36 rounded-full animate-ping-slow pointer-events-none"
            style={{
              border: `2px solid ${primaryColor}`,
              opacity: 0.3,
            }}
          />
          <div
            className="absolute w-36 h-36 rounded-full animate-ping-slow animation-delay-1000 pointer-events-none"
            style={{
              border: `1px solid ${secondaryColor}`,
              opacity: 0.2,
            }}
          />
        </>
      )}
    </div>
  );
}
