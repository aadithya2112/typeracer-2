"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Keyboard, Flag, Clock, ArrowLeft } from "lucide-react";

export default function RacePage({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const [isRaceStarted, setIsRaceStarted] = useState(false);
  const [isRaceFinished, setIsRaceFinished] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [text, setText] = useState(
    "The quick brown fox jumps over the lazy dog. Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages."
  );
  const [typedText, setTypedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock participants data with progress
  const [participants, setParticipants] = useState([
    {
      id: "user-123",
      name: "SpeedTyper (You)",
      progress: 0,
      wpm: 0,
      isFinished: false,
    },
    {
      id: "user-456",
      name: "KeyboardWarrior",
      progress: 0,
      wpm: 0,
      isFinished: false,
    },
    {
      id: "user-789",
      name: "TypeMaster",
      progress: 0,
      wpm: 0,
      isFinished: false,
    },
    { id: "user-101", name: "Player4", progress: 0, wpm: 0, isFinished: false },
  ]);

  // Start countdown when component mounts
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRaceStarted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Start race timer when countdown finishes
  useEffect(() => {
    if (!isRaceStarted || isRaceFinished) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);

      // Calculate WPM
      const minutes = elapsedTime / 60;
      const words = typedText.trim().split(/\s+/).length;
      const calculatedWpm = minutes > 0 ? Math.round(words / minutes) : 0;
      setWpm(calculatedWpm);

      // Update user progress
      const progress = (typedText.length / text.length) * 100;
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === "user-123" ? { ...p, progress, wpm: calculatedWpm } : p
        )
      );

      // Simulate other participants progress
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.id === "user-123" || p.isFinished) return p;

          const randomIncrement = Math.random() * 2;
          const newProgress = Math.min(p.progress + randomIncrement, 100);
          const newWpm = Math.floor(60 + Math.random() * 40);
          const isNowFinished = newProgress >= 100;

          return {
            ...p,
            progress: newProgress,
            wpm: newWpm,
            isFinished: isNowFinished,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [isRaceStarted, isRaceFinished, elapsedTime, typedText, text.length]);

  // Focus input when race starts
  useEffect(() => {
    if (isRaceStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRaceStarted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isRaceStarted || isRaceFinished) return;

    const value = e.target.value;
    setTypedText(value);

    // Check if race is finished
    if (value.length >= text.length) {
      setIsRaceFinished(true);
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === "user-123" ? { ...p, progress: 100, isFinished: true } : p
        )
      );
    }

    // Calculate accuracy
    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (i < text.length && value[i] === text[i]) {
        correctChars++;
      }
    }
    const calculatedAccuracy =
      value.length > 0 ? Math.round((correctChars / value.length) * 100) : 100;

    setAccuracy(calculatedAccuracy);

    // Update current word index for highlighting
    const words = text.split(" ");
    const typedWords = value.split(" ");
    setCurrentWordIndex(typedWords.length - 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-6 w-6 text-emerald-500" />
            <span className="text-xl font-bold tracking-tight">TypeRacer</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-md">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isRaceStarted ? (
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-4xl font-bold mb-4">Race starting in</h2>
            <div className="text-6xl font-bold text-emerald-500">
              {countdown}
            </div>
            <p className="mt-4 text-zinc-400">Get ready to type!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Race text area */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                {isRaceFinished ? (
                  <div className="text-center py-8">
                    <h2 className="text-2xl font-bold mb-2">Race Completed!</h2>
                    <div className="flex items-center justify-center gap-2 text-emerald-500 mb-4">
                      <Flag className="h-5 w-5" />
                      <span className="text-xl font-bold">
                        {formatTime(elapsedTime)}
                      </span>
                    </div>
                    <div className="flex justify-center gap-8 mb-6">
                      <div>
                        <p className="text-zinc-400">WPM</p>
                        <p className="text-2xl font-bold">{wpm}</p>
                      </div>
                      <div>
                        <p className="text-zinc-400">Accuracy</p>
                        <p className="text-2xl font-bold">{accuracy}%</p>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        router.push(`/dashboard/room/${params.roomId}`)
                      }
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Back to Room
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
                      {text.split(" ").map((word, index) => (
                        <span
                          key={index}
                          className={`${
                            index < currentWordIndex
                              ? "text-zinc-500"
                              : index === currentWordIndex
                                ? "text-emerald-500 underline"
                                : "text-white"
                          }`}
                        >
                          {word}{" "}
                        </span>
                      ))}
                    </div>
                    <div>
                      <input
                        ref={inputRef}
                        type="text"
                        value={typedText}
                        onChange={handleInputChange}
                        disabled={!isRaceStarted || isRaceFinished}
                        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Start typing when the race begins..."
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Participants progress */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Race Progress</h3>
              {participants
                .sort((a, b) => b.progress - a.progress)
                .map((participant, index) => (
                  <div key={participant.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-900/30 flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                        <span
                          className={
                            participant.id === "user-123" ? "font-bold" : ""
                          }
                        >
                          {participant.name}
                        </span>
                        {participant.isFinished && (
                          <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded">
                            Finished
                          </span>
                        )}
                      </div>
                      <div className="text-emerald-500 font-bold">
                        {participant.wpm} WPM
                      </div>
                    </div>
                    <Progress
                      value={participant.progress}
                      className="h-2 bg-zinc-800"
                    />
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/room/${params.roomId}`)}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave Race
          </Button>
        </div>
      </main>
    </div>
  );
}
