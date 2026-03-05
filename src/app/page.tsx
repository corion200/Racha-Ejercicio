"use client";

import { useState, useEffect } from "react";
import { Flame, Trophy, Calendar, ChevronRight } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";
import { 
  getLevelInfo, 
  getProgressToNextLevel, 
  getDaysUntilNextLevel,
  getMotivationalMessage 
} from "@/utils/levelSystem";
import { StreakButton } from "@/components/streak/StreakButton";
import { cn } from "@/lib/utils";

export default function Home() {
  const { 
    streakCount, 
    hasClickedToday, 
    isLoading, 
    canClickToday,
    incrementStreak 
  } = useStreak();
  
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const [animateCount, setAnimateCount] = useState(false);

  const levelInfo = getLevelInfo(streakCount);
  const progress = getProgressToNextLevel(streakCount);
  const daysUntilNext = getDaysUntilNextLevel(streakCount);

  // Update motivational message
  useEffect(() => {
    setMotivationalMessage(getMotivationalMessage(streakCount, hasClickedToday));
  }, [streakCount, hasClickedToday]);

  // Animate count on change
  useEffect(() => {
    setAnimateCount(true);
    const timer = setTimeout(() => setAnimateCount(false), 500);
    return () => clearTimeout(timer);
  }, [streakCount]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col overflow-hidden">
      {/* Background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent_50%)]" />
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 pt-8 pb-4 px-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <Flame 
              className="w-6 h-6" 
              style={{ color: levelInfo.primaryColor }}
            />
            <span 
              className="text-lg font-semibold"
              style={{ color: levelInfo.primaryColor }}
            >
              Racha
            </span>
          </div>
          <div 
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{ 
              background: `linear-gradient(135deg, ${levelInfo.primaryColor}30, ${levelInfo.secondaryColor}30)`,
              color: levelInfo.primaryColor,
              border: `1px solid ${levelInfo.primaryColor}40`
            }}
          >
            <Trophy className="w-4 h-4 mr-1" />
            Nivel {levelInfo.level}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        {/* Level badge */}
        <div 
          className="mb-6 px-6 py-2 rounded-full text-center"
          style={{
            background: `linear-gradient(135deg, ${levelInfo.primaryColor}20, ${levelInfo.secondaryColor}20)`,
            border: `1px solid ${levelInfo.primaryColor}40`,
          }}
        >
          <span 
            className="text-sm font-medium"
            style={{ color: levelInfo.primaryColor }}
          >
            {levelInfo.name}
          </span>
        </div>

        {/* Streak counter */}
        <div className="mb-8 text-center">
          <div 
            className={cn(
              "text-7xl font-black transition-all duration-300",
              animateCount && "animate-bounce-subtle"
            )}
            style={{ 
              color: levelInfo.primaryColor,
              textShadow: `0 0 40px ${levelInfo.glowColor}, 0 0 80px ${levelInfo.glowColor.replace(/[\d.]+\)$/, "0.4)")}`
            }}
          >
            {streakCount}
          </div>
          <div className="text-gray-400 text-lg mt-1">
            {streakCount === 1 ? "día" : "días"} de racha
          </div>
        </div>

        {/* Main button */}
        <div className="mb-8">
          <StreakButton
            levelInfo={levelInfo}
            streakCount={streakCount}
            canClickToday={canClickToday}
            onIncrement={incrementStreak}
          />
        </div>

        {/* Status message */}
        <div className="text-center mb-8 max-w-xs">
          {hasClickedToday ? (
            <div className="space-y-2">
              <div 
                className="text-xl font-bold"
                style={{ color: levelInfo.primaryColor }}
              >
                ¡Día completado!
              </div>
              <div className="text-gray-400 text-sm">
                Vuelve mañana para continuar tu racha
              </div>
            </div>
          ) : (
            <div 
              className="text-lg font-medium"
              style={{ color: levelInfo.primaryColor }}
            >
              {motivationalMessage}
            </div>
          )}
        </div>

        {/* Progress to next level */}
        {levelInfo.level < 11 && (
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Siguiente nivel</span>
              <span>{daysUntilNext} días más</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress.percentage}%`,
                  background: `linear-gradient(90deg, ${levelInfo.primaryColor}, ${levelInfo.secondaryColor})`,
                  boxShadow: `0 0 10px ${levelInfo.glowColor}`,
                }}
              />
            </div>
            <div className="text-center text-xs text-gray-500">
              Nivel {levelInfo.level + 1}: {getLevelInfo(progress.target).name}
            </div>
          </div>
        )}

        {/* Max level indicator */}
        {levelInfo.level === 11 && (
          <div 
            className="text-center py-3 px-6 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${levelInfo.primaryColor}30, ${levelInfo.secondaryColor}30)`,
              border: `1px solid ${levelInfo.primaryColor}50`,
            }}
          >
            <span 
              className="text-sm font-bold"
              style={{ color: levelInfo.primaryColor }}
            >
              🏆 NIVEL MÁXIMO ALCANZADO 🏆
            </span>
          </div>
        )}
      </main>

      {/* Footer info */}
      <footer className="relative z-10 pb-8 px-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div 
              className="p-4 rounded-xl text-center"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Calendar className="w-5 h-5 mx-auto mb-2 text-gray-400" />
              <div className="text-2xl font-bold text-white">{streakCount}</div>
              <div className="text-xs text-gray-400">Días totales</div>
            </div>
            <div 
              className="p-4 rounded-xl text-center"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Trophy className="w-5 h-5 mx-auto mb-2 text-gray-400" />
              <div className="text-2xl font-bold text-white">{levelInfo.level}</div>
              <div className="text-xs text-gray-400">Nivel actual</div>
            </div>
          </div>

          {/* Level progress preview */}
          <div 
            className="p-4 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
              <span>Progreso de niveles</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="flex gap-1.5">
              {Array.from({ length: 11 }).map((_, i) => {
                const lvl = i + 1;
                const isCompleted = lvl <= levelInfo.level;
                const isCurrent = lvl === levelInfo.level;
                
                return (
                  <div
                    key={lvl}
                    className={cn(
                      "flex-1 h-2 rounded-full transition-all duration-300",
                      isCurrent && "animate-pulse"
                    )}
                    style={{
                      background: isCompleted 
                        ? getLevelInfo(lvl === 1 ? 0 : (lvl - 1) * 50).primaryColor 
                        : "rgba(255,255,255,0.1)",
                      boxShadow: isCurrent ? `0 0 8px ${levelInfo.glowColor}` : "none",
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
