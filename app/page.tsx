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

  const generateRandomPosition = useCallback(() => {
    // Generate position avoiding edges (10% margin)
    return {
      x: Math.random() * 80 + 10, // 10% to 90%
      y: Math.random() * 80 + 10,
    };
  }, []);

  const initializeGame = useCallback(() => {
    // Random number of clicks required (between 5 and 15)
    const required = Math.floor(Math.random() * 11) + 5;
    setClicksRequired(required);
    setClicksCount(0);
    setButtonPosition(generateRandomPosition());
    setButtonColor(colors[Math.floor(Math.random() * colors.length)]);
    
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

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const handleLeaveClick = () => {
    const newCount = clicksCount + 1;
    setClicksCount(newCount);

    if (newCount >= clicksRequired) {
      setIsLeaving(true);
      setShowMessage(true);
      setTimeout(() => {
        // In a real app, this would actually end the call
        alert('Call ended! (Just kidding, this is a demo)');
        initializeGame();
        setIsLeaving(false);
        setShowMessage(false);
      }, 1000);
    } else {
      // Move the button to a new random position
      setButtonPosition(generateRandomPosition());
      // Change button color
      setButtonColor(colors[Math.floor(Math.random() * colors.length)]);
      
      // Move some distracting buttons too
      setDistractingButtons(prev => 
        prev.map(btn => 
          Math.random() > 0.5 
            ? { ...btn, ...generateRandomPosition(), color: colors[Math.floor(Math.random() * colors.length)], text: buttonTexts[Math.floor(Math.random() * buttonTexts.length)] }
            : btn
        )
      );
    }
  };

  const handleDistractorClick = (id: number) => {
    // Move the clicked distractor button
    setDistractingButtons(prev =>
      prev.map(btn =>
        btn.id === id
          ? { ...btn, ...generateRandomPosition(), color: colors[Math.floor(Math.random() * colors.length)], text: buttonTexts[Math.floor(Math.random() * buttonTexts.length)] }
          : btn
      )
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
          <p className="text-xl text-gray-600 dark:text-gray-400">Duration: 00:00:00</p>
        </div>
      </div>

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
