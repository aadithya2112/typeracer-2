"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { TypeRacerTest, TypingStats } from "@/components/TypingTest";

// Sample texts for practice
const sampleTexts = ["The quick brown fox jumps over the lazy dog."];

export default function PracticePage() {
  const [practiceText, setPracticeText] = useState("");
  const [testCompleted, setTestCompleted] = useState(false);
  const [typingStats, setTypingStats] = useState<TypingStats | null>(null);

  // Function to get a random text from our samples
  const getRandomText = () => {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    return sampleTexts[randomIndex];
  };

  // Initialize with a random text
  useEffect(() => {
    setPracticeText(getRandomText());
  }, []);

  // Handle test completion
  const handleComplete = (stats: TypingStats) => {
    setTypingStats(stats);
    setTestCompleted(true);
  };

  // Start a new practice session
  const startNewPractice = () => {
    setPracticeText(getRandomText());
    setTestCompleted(false);
    setTypingStats(null);
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 bg-black h-screen">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-green-400">
          Typing Practice
        </h1>
        <p className="text-zinc-400">Improve your typing speed and accuracy</p>
      </header>

      <div className="bg-[#0A0A0B] rounded-xl p-6 shadow-lg border border-zinc-800">
        <TypeRacerTest
          text={practiceText}
          onComplete={handleComplete}
          className="bg-[#0A0A0B]"
        />

        {testCompleted && (
          <div className="mt-6 text-center">
            <Button
              onClick={startNewPractice}
              className="bg-[#009965] hover:bg-[#007d53] text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Practice Again
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-zinc-500 text-sm">
        <p>
          Practice makes perfect! Try to improve your WPM with each attempt.
        </p>
      </div>
    </div>
  );
}
