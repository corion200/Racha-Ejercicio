// Level system with dynamic colors based on streak days

export interface LevelInfo {
  level: number;
  name: string;
  minDays: number;
  maxDays: number;
  primaryColor: string;
  secondaryColor: string;
  glowColor: string;
  flameIntensity: number; // 1-10
  flameColors: string[];
}

export const LEVELS: LevelInfo[] = [
  {
    level: 1,
    name: "Novato",
    minDays: 0,
    maxDays: 7,
    primaryColor: "#6B7280", // Gray
    secondaryColor: "#4B5563",
    glowColor: "rgba(107, 114, 128, 0.5)",
    flameIntensity: 1,
    flameColors: ["#4B5563", "#6B7280", "#9CA3AF"]
  },
  {
    level: 2,
    name: "Principiante",
    minDays: 8,
    maxDays: 14,
    primaryColor: "#9CA3AF", // Bright gray
    secondaryColor: "#6B7280",
    glowColor: "rgba(156, 163, 175, 0.6)",
    flameIntensity: 2,
    flameColors: ["#6B7280", "#9CA3AF", "#D1D5DB"]
  },
  {
    level: 3,
    name: "Entusiasta",
    minDays: 15,
    maxDays: 29,
    primaryColor: "#FB923C", // Light orange
    secondaryColor: "#F97316",
    glowColor: "rgba(251, 146, 60, 0.6)",
    flameIntensity: 3,
    flameColors: ["#F97316", "#FB923C", "#FDBA74"]
  },
  {
    level: 4,
    name: "Constante",
    minDays: 30,
    maxDays: 59,
    primaryColor: "#FBBF24", // Golden yellow
    secondaryColor: "#F59E0B",
    glowColor: "rgba(251, 191, 36, 0.7)",
    flameIntensity: 4,
    flameColors: ["#F59E0B", "#FBBF24", "#FDE68A"]
  },
  {
    level: 5,
    name: "Dedicado",
    minDays: 60,
    maxDays: 99,
    primaryColor: "#F97316", // Intense orange
    secondaryColor: "#EA580C",
    glowColor: "rgba(249, 115, 22, 0.7)",
    flameIntensity: 5,
    flameColors: ["#EA580C", "#F97316", "#FDBA74", "#FED7AA"]
  },
  {
    level: 6,
    name: "Guerrero",
    minDays: 100,
    maxDays: 149,
    primaryColor: "#EF4444", // Red
    secondaryColor: "#DC2626",
    glowColor: "rgba(239, 68, 68, 0.8)",
    flameIntensity: 6,
    flameColors: ["#DC2626", "#EF4444", "#F87171", "#FCA5A5"]
  },
  {
    level: 7,
    name: "Máquina",
    minDays: 150,
    maxDays: 199,
    primaryColor: "#B91C1C", // Intense red
    secondaryColor: "#991B1B",
    glowColor: "rgba(185, 28, 28, 0.8)",
    flameIntensity: 7,
    flameColors: ["#991B1B", "#B91C1C", "#EF4444", "#FCA5A5"]
  },
  {
    level: 8,
    name: "Leyenda",
    minDays: 200,
    maxDays: 299,
    primaryColor: "#A855F7", // Purple
    secondaryColor: "#9333EA",
    glowColor: "rgba(168, 85, 247, 0.8)",
    flameIntensity: 8,
    flameColors: ["#7C3AED", "#9333EA", "#A855F7", "#C084FC", "#DDD6FE"]
  },
  {
    level: 9,
    name: "Ídolo",
    minDays: 300,
    maxDays: 399,
    primaryColor: "#C084FC", // Bright purple
    secondaryColor: "#A855F7",
    glowColor: "rgba(192, 132, 252, 0.9)",
    flameIntensity: 9,
    flameColors: ["#9333EA", "#A855F7", "#C084FC", "#E9D5FF", "#F3E8FF"]
  },
  {
    level: 10,
    name: "Titán",
    minDays: 400,
    maxDays: 499,
    primaryColor: "#3B82F6", // Electric blue
    secondaryColor: "#2563EB",
    glowColor: "rgba(59, 130, 246, 0.9)",
    flameIntensity: 10,
    flameColors: ["#1D4ED8", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"]
  },
  {
    level: 11,
    name: "Mítico",
    minDays: 500,
    maxDays: Infinity,
    primaryColor: "#FDE68A", // Golden/white bright
    secondaryColor: "#FBBF24",
    glowColor: "rgba(253, 230, 138, 1)",
    flameIntensity: 10,
    flameColors: ["#FBBF24", "#FDE68A", "#FEF3C7", "#FFFFFF", "#FBBF24", "#F59E0B"]
  }
];

export function getLevelInfo(streakDays: number): LevelInfo {
  for (const level of LEVELS) {
    if (streakDays >= level.minDays && streakDays <= level.maxDays) {
      return level;
    }
  }
  // Default to max level if beyond
  return LEVELS[LEVELS.length - 1];
}

export function getProgressToNextLevel(streakDays: number): { current: number; target: number; percentage: number } {
  const currentLevel = getLevelInfo(streakDays);
  const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level);
  
  // If at max level
  if (currentLevelIndex === LEVELS.length - 1) {
    return { current: streakDays, target: streakDays, percentage: 100 };
  }
  
  const nextLevel = LEVELS[currentLevelIndex + 1];
  const daysInCurrentLevel = streakDays - currentLevel.minDays;
  const daysNeededForNext = nextLevel.minDays - currentLevel.minDays;
  
  return {
    current: streakDays,
    target: nextLevel.minDays,
    percentage: Math.min(100, (daysInCurrentLevel / daysNeededForNext) * 100)
  };
}

export function getDaysUntilNextLevel(streakDays: number): number {
  const currentLevel = getLevelInfo(streakDays);
  const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level);
  
  // If at max level
  if (currentLevelIndex === LEVELS.length - 1) {
    return 0;
  }
  
  const nextLevel = LEVELS[currentLevelIndex + 1];
  return nextLevel.minDays - streakDays;
}

// Motivational messages based on streak
export function getMotivationalMessage(streakDays: number, hasClickedToday: boolean): string {
  if (hasClickedToday) {
    const messages = [
      "¡Excelente trabajo hoy! 🔥",
      "¡Misión cumplida! Descansa bien 💪",
      "¡Lo lograste! Mañana más fuerte ⭐",
      "¡Día completado! Sigue así 🏆",
      "¡Increíble dedicación! 💯"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  if (streakDays === 0) {
    return "¡Comienza tu racha hoy! 🚀";
  }
  
  if (streakDays < 7) {
    const messages = [
      "¡Un paso a la vez! 💪",
      "¡Tú puedes hacerlo! 🔥",
      "¡Cada día cuenta! ⭐",
      "¡Construye tu mejor versión! 💯"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  if (streakDays < 30) {
    const messages = [
      "¡Vas muy bien! Sigue así 🌟",
      "¡La constancia es tu poder! 💪",
      "¡Cada día más fuerte! 🔥",
      "¡Tu dedicación inspira! ⭐"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  if (streakDays < 100) {
    const messages = [
      "¡Eres imparable! 🏆",
      "¡Tu disciplina es legendaria! 💎",
      "¡Nada te detiene! 🚀",
      "¡Eres una máquina! 🔥"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  const messages = [
    "¡ERES UNA LEYENDA! 👑",
    "¡PODER MÍTICO ACTIVADO! 🌟",
    "¡INSPIRAS A TODOS! 💎",
    "¡ERES INCREÍBLE! 🔥🔥🔥"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
