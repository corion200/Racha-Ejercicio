"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "streak_app_data";

interface StreakData {
  streakCount: number;
  lastClickDate: string | null;
  totalDaysCompleted: number;
}

interface UseStreakReturn {
  streakCount: number;
  hasClickedToday: boolean;
  isLoading: boolean;
  canClickToday: boolean;
  totalDaysCompleted: number;
  incrementStreak: () => boolean;
  resetStreak: () => void;
  getLastClickDate: () => Date | null;
}

// Get today's date in YYYY-MM-DD format in user's local timezone
function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

// Check if two dates are consecutive days
function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Reset hours to compare only dates
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
}

// Check if a date is today
function isToday(dateString: string): boolean {
  return dateString === getTodayDateString();
}

// Check if a date is yesterday
function isYesterday(dateString: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === yesterday.toISOString().split("T")[0];
}

export function useStreak(): UseStreakReturn {
  const [streakCount, setStreakCount] = useState<number>(0);
  const [hasClickedToday, setHasClickedToday] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalDaysCompleted, setTotalDaysCompleted] = useState<number>(0);
  const [lastClickDate, setLastClickDate] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: StreakData = JSON.parse(stored);
          const today = getTodayDateString();
          
          // Check if we need to update streak based on last click date
          if (data.lastClickDate) {
            if (isToday(data.lastClickDate)) {
              // Already clicked today
              setHasClickedToday(true);
              setStreakCount(data.streakCount);
            } else if (isYesterday(data.lastClickDate)) {
              // Clicked yesterday, streak continues
              setHasClickedToday(false);
              setStreakCount(data.streakCount);
            } else {
              // Streak broken, reset to 0
              setHasClickedToday(false);
              setStreakCount(0);
            }
          } else {
            // No previous clicks
            setHasClickedToday(false);
            setStreakCount(0);
          }
          
          setLastClickDate(data.lastClickDate);
          setTotalDaysCompleted(data.totalDaysCompleted || 0);
        }
      } catch (error) {
        console.error("Error loading streak data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever relevant state changes
  const saveData = useCallback((newData: StreakData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error("Error saving streak data:", error);
    }
  }, []);

  // Increment streak
  const incrementStreak = useCallback((): boolean => {
    if (hasClickedToday) {
      return false; // Already clicked today
    }

    const today = getTodayDateString();
    let newStreakCount = streakCount;

    if (lastClickDate && isYesterday(lastClickDate)) {
      // Continuing streak
      newStreakCount = streakCount + 1;
    } else if (!lastClickDate || (!isToday(lastClickDate) && !isYesterday(lastClickDate))) {
      // Starting new streak
      newStreakCount = 1;
    } else {
      newStreakCount = streakCount + 1;
    }

    const newTotalDays = totalDaysCompleted + 1;
    const newData: StreakData = {
      streakCount: newStreakCount,
      lastClickDate: today,
      totalDaysCompleted: newTotalDays,
    };

    setStreakCount(newStreakCount);
    setHasClickedToday(true);
    setLastClickDate(today);
    setTotalDaysCompleted(newTotalDays);
    saveData(newData);

    return true; // Successfully incremented
  }, [hasClickedToday, streakCount, lastClickDate, totalDaysCompleted, saveData]);

  // Reset streak (for testing or user request)
  const resetStreak = useCallback(() => {
    const newData: StreakData = {
      streakCount: 0,
      lastClickDate: null,
      totalDaysCompleted: 0,
    };
    setStreakCount(0);
    setHasClickedToday(false);
    setLastClickDate(null);
    setTotalDaysCompleted(0);
    saveData(newData);
  }, [saveData]);

  // Get last click date as Date object
  const getLastClickDate = useCallback((): Date | null => {
    if (!lastClickDate) return null;
    return new Date(lastClickDate);
  }, [lastClickDate]);

  return {
    streakCount,
    hasClickedToday,
    isLoading,
    canClickToday: !hasClickedToday,
    totalDaysCompleted,
    incrementStreak,
    resetStreak,
    getLastClickDate,
  };
}
