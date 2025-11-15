'use client';

import { useState, useEffect, useCallback } from 'react';

const colors = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

const buttonTexts = ['Leave Call', 'End Call', 'Hang Up', 'Disconnect', 'Exit Call'];

export default function Home() {
  const [clicksRequired, setClicksRequired] = useState(0);
  const [clicksCount, setClicksCount] = useState(0);
  const [buttonPosition, setButtonPosition] = useState({ x: 50, y: 50 });
  const [buttonColor, setButtonColor] = useState('#ef4444');
  const [distractingButtons, setDistractingButtons] = useState<Array<{ id: number; x: number; y: number; color: string; text: string }>>([]);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [callDuration, setCallDuration] = useState(0); // Duration in seconds
  const [panicTimer, setPanicTimer] = useState(0); // Panic timer in seconds

  const generateRandomPosition = useCallback(() => {
    // Generate position avoiding edges (10% margin)
    return {
      x: Math.random() * 80 + 10, // 10% to 90%
      y: Math.random() * 80 + 10,
    };
  }, []);

  const initializeGame = useCallback(() => {
    // Random number of clicks required (between 3 and 5)
    const required = Math.floor(Math.random() * 3) + 3;
    setClicksRequired(required);
    setClicksCount(0);
    setButtonPosition(generateRandomPosition());
    setButtonColor(colors[Math.floor(Math.random() * colors.length)]);
    setCallDuration(0); // Reset call duration
    // Set panic timer to random time between 30-60 seconds
    setPanicTimer(Math.floor(Math.random() * 31) + 30);
    
    // Generate 8-12 distracting buttons
    const numDistractors = Math.floor(Math.random() * 5) + 8;
    const distractors = Array.from({ length: numDistractors }, (_, i) => ({
      id: i,
      ...generateRandomPosition(),
      color: colors[Math.floor(Math.random() * colors.length)],
      text: buttonTexts[Math.floor(Math.random() * buttonTexts.length)],
    }));
    setDistractingButtons(distractors);
  }, [generateRandomPosition]);

  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Dark mode initialization and persistence
  useEffect(() => {
    // Check localStorage for saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
      localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Call duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Panic timer countdown
  useEffect(() => {
    if (panicTimer <= 0) return;
    
    const interval = setInterval(() => {
      setPanicTimer(prev => {
        if (prev <= 1) {
          // Timer reached zero - reset it to create panic but do nothing
          setTimeout(() => {
            setPanicTimer(Math.floor(Math.random() * 31) + 30);
          }, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [panicTimer]);

  // Format duration as HH:MM:SS
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleLeaveClick = () => {
    // 50% chance that the click actually counts
    const clickCounts = Math.random() < 0.5;
    
    if (clickCounts) {
      const newCount = clicksCount + 1;
      setClicksCount(newCount);

      if (newCount >= clicksRequired) {
        setIsLeaving(true);
        setShowMessage(true);
        setTimeout(() => {
          initializeGame();
          setIsLeaving(false);
          setShowMessage(false);
        }, 1000);
        return;
      }
    }
    
    // Scramble ALL buttons (main button and all distracting buttons)
    setButtonPosition(generateRandomPosition());
    setButtonColor(colors[Math.floor(Math.random() * colors.length)]);
    
    // Scramble all distracting buttons to new random positions
    setDistractingButtons(prev => 
      prev.map(btn => ({
        ...btn,
        ...generateRandomPosition(),
        color: colors[Math.floor(Math.random() * colors.length)],
        text: buttonTexts[Math.floor(Math.random() * buttonTexts.length)]
      }))
    );
  };

  const handleDistractorClick = (id: number) => {
    // Scramble ALL buttons when a distractor is clicked
    setButtonPosition(generateRandomPosition());
    setButtonColor(colors[Math.floor(Math.random() * colors.length)]);
    
    // Scramble all distracting buttons to new random positions
    setDistractingButtons(prev =>
      prev.map(btn => ({
        ...btn,
        ...generateRandomPosition(),
        color: colors[Math.floor(Math.random() * colors.length)],
        text: buttonTexts[Math.floor(Math.random() * buttonTexts.length)]
      }))
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-black text-gray-900 dark:text-white overflow-hidden relative transition-colors duration-300">
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 z-40 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 shadow-lg"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <span className="text-2xl">🌙</span>
        ) : (
          <span className="text-2xl">☀️</span>
        )}
      </button>

      {/* Call UI Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center z-10">
          <div className="text-6xl mb-4">📞</div>
          <h1 className="text-4xl font-bold mb-2">Call in Progress</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Duration: {formatDuration(callDuration)}</p>
        </div>
      </div>

      {/* Panic Timer */}
      {!isLeaving && panicTimer > 0 && (
        <div className={`absolute top-4 left-4 z-30 px-6 py-3 rounded-lg backdrop-blur-sm shadow-2xl border-2 ${
          panicTimer <= 10 
            ? 'bg-red-600/90 dark:bg-red-700/90 border-red-500 animate-pulse' 
            : panicTimer <= 20
            ? 'bg-orange-500/90 dark:bg-orange-600/90 border-orange-400'
            : 'bg-yellow-500/80 dark:bg-yellow-600/80 border-yellow-400'
        }`}>
          <p className="text-xs font-bold text-white mb-1 text-center">⚠️ URGENT</p>
          <p className={`text-2xl font-black text-white text-center font-mono ${
            panicTimer <= 10 ? 'animate-pulse' : ''
          }`}>
            {Math.floor(panicTimer / 60)}:{(panicTimer % 60).toString().padStart(2, '0')}
          </p>
          <p className="text-xs text-white/80 text-center mt-0.5">Time remaining</p>
        </div>
      )}

      {/* Progress indicator */}
      {!isLeaving && (
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20 bg-white/80 dark:bg-black/50 px-6 py-3 rounded-full backdrop-blur-sm shadow-lg">
          <p className="text-lg font-semibold">
            Clicks: {clicksCount} / {clicksRequired}
          </p>
        </div>
      )}

      {/* Success message */}
      {showMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-white/95 dark:bg-black/90">
          <div className="text-center">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-5xl font-bold mb-4">You did it!</h2>
            <p className="text-2xl text-gray-600 dark:text-gray-400">Leaving call...</p>
          </div>
        </div>
      )}

      {/* Main Leave Button */}
      {!isLeaving && (
        <button
          onClick={handleLeaveClick}
          className="absolute z-30 px-8 py-4 rounded-lg font-bold text-xl shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            left: `${buttonPosition.x}%`,
            top: `${buttonPosition.y}%`,
            backgroundColor: buttonColor,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 30px ${buttonColor}40`,
          }}
        >
          Leave Call
        </button>
      )}

      {/* Distracting Buttons */}
      {!isLeaving && distractingButtons.map((btn) => (
        <button
          key={btn.id}
          onClick={() => handleDistractorClick(btn.id)}
          className="absolute z-20 px-6 py-3 rounded-lg font-semibold text-lg shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            left: `${btn.x}%`,
            top: `${btn.y}%`,
            backgroundColor: btn.color,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 20px ${btn.color}30`,
          }}
        >
          {btn.text}
        </button>
      ))}

      {/* Decorative elements */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 text-gray-600 dark:text-gray-500 text-sm">
        <p>⚠️ This call is very important. Are you sure you want to leave?</p>
      </div>
    </main>
  );
}
