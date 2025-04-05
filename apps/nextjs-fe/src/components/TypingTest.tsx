"use client";

import React, { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Keyboard, Clock, BarChart } from "lucide-react";
import axios from "axios";

interface TypingTestProps {
  text: string;
  onProgress?: (progress: number) => void;
  onComplete?: (stats: TypingStats) => void;
  isMultiplayer?: boolean;
  disabled?: boolean;
  onStatusUpdate?: (stats: TypingStats) => void;
  className?: string;
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  errors: number;
  time: number; // seconds
}

export function TypeRacerTest({
  text,
  onProgress,
  onComplete,
  onStatusUpdate,
  isMultiplayer = false,
  disabled = false,
  className = "",
}: TypingTestProps) {
  // Split the text into words for tracking
  const words = text.split(" ");
  const fullText = text;

  // Main state variables
  const [currentPos, setCurrentPos] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState(0);
  const [progress, setProgress] = useState(0);

  // Stats
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const statusUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastErrorPosRef = useRef(-1);

  // Focus the input field on start
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  // Initialize timer
  useEffect(() => {
    if (startTime && !endTime) {
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        setTimeElapsed(elapsed);

        // Update WPM in real-time
        if (currentPos > 0) {
          const minutes = elapsed / 60;
          // Use standard WPM calculation (chars/5 / minutes)
          const wordsTyped = currentPos / 5;
          const currentWpm = Math.round(wordsTyped / minutes);
          setWpm(currentWpm);
        }
      }, 200);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime, endTime, currentPos]);

  // Setup status update timer for multiplayer mode
  useEffect(() => {
    // If we have the onStatusUpdate prop and the test has started
    if (onStatusUpdate && startTime && !endTime) {
      // Clear any existing interval
      if (statusUpdateTimerRef.current) {
        clearInterval(statusUpdateTimerRef.current);
      }

      // Send initial status update
      onStatusUpdate({
        wpm,
        accuracy,
        errors,
        time: timeElapsed,
      });

      // Set up regular status updates every second
      statusUpdateTimerRef.current = setInterval(() => {
        onStatusUpdate({
          wpm,
          accuracy,
          errors,
          time: timeElapsed,
        });
      }, 1000);
    }

    return () => {
      if (statusUpdateTimerRef.current) {
        clearInterval(statusUpdateTimerRef.current);
      }
    };
  }, [startTime, endTime, onStatusUpdate]);

  // Update status when relevant stats change
  useEffect(() => {
    // Only send updates if the test is in progress and we have the callback
    if (onStatusUpdate && startTime && !endTime) {
      onStatusUpdate({
        wpm,
        accuracy,
        errors,
        time: timeElapsed,
      });
    }
  }, [
    wpm,
    accuracy,
    errors,
    progress,
    onStatusUpdate,
    startTime,
    endTime,
    timeElapsed,
  ]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isCompleted) return;

    const value = e.target.value;
    setTypedText(value);

    // Start timer on first input
    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
    }

    // Check for correctness
    const expectedText = fullText.substring(0, value.length);
    let isCorrect = true;

    // Find first error position
    let errorPos = -1;
    for (let i = 0; i < value.length; i++) {
      if (i >= fullText.length || value[i] !== fullText[i]) {
        isCorrect = false;
        errorPos = i;
        break;
      }
    }

    // Count errors (only count when a new error occurs)
    if (errorPos !== -1 && errorPos !== lastErrorPosRef.current) {
      setErrors((prev) => prev + 1);
      lastErrorPosRef.current = errorPos;
    }

    // If typing is correct so far, update the position and progress
    if (isCorrect) {
      const newPos = value.length;
      setCurrentPos(newPos);

      // Calculate progress percentage
      const newProgress = Math.min(
        100,
        Math.floor((newPos / fullText.length) * 100)
      );
      setProgress(newProgress);
      if (onProgress) {
        onProgress(newProgress);
      }

      // Update current word index
      const textUpToCursor = fullText.substring(0, newPos);
      const wordsSoFar = textUpToCursor.split(" ").length - 1;
      setCurrentWordIndex(wordsSoFar);

      // Check for completion
      if (newPos === fullText.length) {
        handleTestComplete();
      }
    }

    // Calculate accuracy
    const totalChars = value.length;
    const correctChars = isCorrect ? totalChars : errorPos;
    const newAccuracy =
      totalChars === 0 ? 100 : Math.round((correctChars / totalChars) * 100);
    setAccuracy(newAccuracy);
  };

  // Handle test completion
  const handleTestComplete = () => {
    if (isCompleted && !isMultiplayer) {
      // Save to database
      // const res = axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/`)
      // TODO: Save to database
      return;
    }

    const endTimeStamp = Date.now();
    setEndTime(endTimeStamp);
    setIsCompleted(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Clear status update timer
    if (statusUpdateTimerRef.current) {
      clearInterval(statusUpdateTimerRef.current);
    }

    const testDuration = startTime
      ? (endTimeStamp - startTime) / 1000
      : timeElapsed;

    // Calculate final statistics
    const minutes = testDuration / 60;
    const wordsTyped = currentPos / 5;
    const finalWpm = Math.round(wordsTyped / minutes);

    setWpm(finalWpm);

    // Send final stats to parent component
    const finalStats = {
      wpm: finalWpm,
      accuracy,
      errors,
      time: testDuration,
    };

    // Send one last status update
    if (onStatusUpdate) {
      onStatusUpdate(finalStats);
    }

    // Send completion stats
    if (onComplete) {
      onComplete(finalStats);
    }
  };

  // Format the time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Function to determine character color based on typed input and position
  const getCharacterClass = (charIndex: number) => {
    // If the character hasn't been typed yet
    if (charIndex >= typedText.length) {
      // Current word is white, upcoming words are gray
      const charWordIndex =
        fullText.substring(0, charIndex).split(" ").length - 1;
      return charWordIndex === currentWordIndex
        ? "text-zinc-400"
        : "text-zinc-600";
    }

    // If the character has been typed correctly
    if (typedText[charIndex] === fullText[charIndex]) {
      return "text-[#009965]"; // Correct character (green)
    }

    // If the character has been typed incorrectly
    return "text-red-500"; // Incorrect character (red)
  };

  return (
    <div className={`relative ${className}`}>
      {/* Stats display */}
      <div className="flex justify-between mb-4 text-white">
        <div className="flex items-center gap-3">
          <Badge className="bg-[#009965] text-white flex items-center gap-1">
            <Keyboard className="h-3 w-3" />
            <span>{wpm} WPM</span>
          </Badge>
          <Badge className="bg-zinc-800 text-white flex items-center gap-1">
            <BarChart className="h-3 w-3" />
            <span>{accuracy}% Accuracy</span>
          </Badge>
        </div>
        <Badge className="bg-zinc-800 text-white flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatTime(timeElapsed)}</span>
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <Progress value={progress} className="h-2 bg-zinc-800" />
        <style jsx global>{`
          progress::-webkit-progress-value {
            background-color: #009965 !important;
          }
          progress::-moz-progress-bar {
            background-color: #009965 !important;
          }
          progress {
            color: #009965 !important;
          }
          .progress-indicator {
            background-color: #009965 !important;
          }
        `}</style>
      </div>

      {/* Text display - Modified to show individual characters with coloring */}
      <div className="bg-[#0A0A0B] p-6 rounded-lg border border-zinc-800 font-mono text-lg leading-relaxed mb-4">
        {/* Render the text character by character */}
        {Array.from(fullText).map((char, index) => (
          <span key={index} className={getCharacterClass(index)}>
            {char}
          </span>
        ))}
      </div>

      {/* Visible input field */}
      <div className="mb-4">
        <Input
          ref={inputRef}
          type="text"
          value={typedText}
          onChange={handleInputChange}
          className={`w-full p-3 bg-zinc-800 border-zinc-700 text-white ${
            isCompleted ? "opacity-50" : ""
          }`}
          placeholder="Type here..."
          disabled={disabled || isCompleted}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>

      {/* Results display shown when completed */}
      {isCompleted && (
        <div className="bg-[#0A0A0B] rounded-lg p-4 border border-[#009965] mt-4">
          <h3 className="text-[#009965] font-bold text-lg mb-2">
            Test Completed!
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800 p-3 rounded">
              <span className="text-zinc-400 text-sm">WPM</span>
              <p className="text-white text-2xl font-bold">{wpm}</p>
            </div>
            <div className="bg-zinc-800 p-3 rounded">
              <span className="text-zinc-400 text-sm">Accuracy</span>
              <p className="text-white text-2xl font-bold">{accuracy}%</p>
            </div>
            <div className="bg-zinc-800 p-3 rounded">
              <span className="text-zinc-400 text-sm">Time</span>
              <p className="text-white text-2xl font-bold">
                {formatTime(timeElapsed)}
              </p>
            </div>
            <div className="bg-zinc-800 p-3 rounded">
              <span className="text-zinc-400 text-sm">Errors</span>
              <p className="text-white text-2xl font-bold">{errors}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
