"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Keyboard, Flag, Clock, ArrowLeft, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PracticePage() {
  const router = useRouter();
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [text, setText] = useState(
    "The quick brown fox jumps over the lazy dog. Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages."
  );
  const [typedText, setTypedText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [progress, setProgress] = useState(0);
  const [practiceMode, setPracticeMode] = useState("paragraph");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample practice texts
  const practiceTexts = {
    paragraph:
      "The quick brown fox jumps over the lazy dog. Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages.",
    code: "function calculateSum(a, b) {\n  return a + b;\n}\n\nconst result = calculateSum(5, 10);\nconsole.log(`The sum is ${result}`);",
    quote:
      "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. - Steve Jobs",
  };

  // Start countdown when practice starts
  const startPractice = () => {
    setCountdown(3);
    setElapsedTime(0);
    setTypedText("");
    setCurrentWordIndex(0);
    setWpm(0);
    setAccuracy(100);
    setProgress(0);
    setIsFinished(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsStarted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Reset practice
  const resetPractice = () => {
    setIsStarted(false);
    setIsFinished(false);
    setElapsedTime(0);
    setTypedText("");
    setCurrentWordIndex(0);
    setWpm(0);
    setAccuracy(100);
    setProgress(0);
  };

  // Change practice mode
  const handlePracticeModeChange = (value: string) => {
    setPracticeMode(value);
    setText(practiceTexts[value as keyof typeof practiceTexts]);
    resetPractice();
  };

  // Start race timer when countdown finishes
  useEffect(() => {
    if (!isStarted || isFinished) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);

      // Calculate WPM
      const minutes = elapsedTime / 60;
      const words = typedText.trim().split(/\s+/).length;
      const calculatedWpm = minutes > 0 ? Math.round(words / minutes) : 0;
      setWpm(calculatedWpm);

      // Update progress
      const progress = (typedText.length / text.length) * 100;
      setProgress(progress);
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isFinished, elapsedTime, typedText, text.length]);

  // Focus input when practice starts
  useEffect(() => {
    if (isStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isStarted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isStarted || isFinished) return;

    const value = e.target.value;
    setTypedText(value);

    // Check if practice is finished
    if (value.length >= text.length) {
      setIsFinished(true);
      setProgress(100);
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
            {isStarted && !isFinished && (
              <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-md">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Practice Mode</CardTitle>
              <CardDescription>
                Improve your typing skills at your own pace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Select
                  value={practiceMode}
                  onValueChange={handlePracticeModeChange}
                >
                  <SelectTrigger className="w-full sm:w-[200px] bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Select practice type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="paragraph">Paragraph</SelectItem>
                    <SelectItem value="code">Code Snippet</SelectItem>
                    <SelectItem value="quote">Quote</SelectItem>
                  </SelectContent>
                </Select>

                {!isStarted ? (
                  <Button
                    onClick={startPractice}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                  >
                    Start Practice
                  </Button>
                ) : (
                  <Button
                    onClick={resetPractice}
                    variant="outline"
                    className="w-full sm:w-auto border-zinc-700"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {isStarted && countdown > 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <h2 className="text-4xl font-bold mb-4">Starting in</h2>
              <div className="text-6xl font-bold text-emerald-500">
                {countdown}
              </div>
              <p className="mt-4 text-zinc-400">Get ready to type!</p>
            </div>
          ) : (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                {isFinished ? (
                  <div className="text-center py-8">
                    <h2 className="text-2xl font-bold mb-2">
                      Practice Completed!
                    </h2>
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
                      onClick={resetPractice}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Practice Again
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 p-4 bg-zinc-800 rounded-lg whitespace-pre-wrap">
                      {practiceMode === "code" ? (
                        <pre className="font-mono text-sm">
                          {text.split("").map((char, index) => (
                            <span
                              key={index}
                              className={`${
                                index < typedText.length
                                  ? typedText[index] === char
                                    ? "text-emerald-500"
                                    : "text-red-500 bg-red-900/30"
                                  : index === typedText.length
                                    ? "text-emerald-500 underline"
                                    : "text-white"
                              }`}
                            >
                              {char}
                            </span>
                          ))}
                        </pre>
                      ) : (
                        text.split(" ").map((word, index) => (
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
                        ))
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-zinc-800" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={typedText}
                        onChange={handleInputChange}
                        disabled={!isStarted || isFinished}
                        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder={
                          isStarted
                            ? "Start typing..."
                            : "Click 'Start Practice' to begin"
                        }
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
