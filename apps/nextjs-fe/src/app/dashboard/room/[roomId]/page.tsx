"use client";

import type React from "react";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Keyboard,
  Flag,
  Clock,
  ArrowLeft,
  Play,
  Trophy,
  Award,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

// Custom CSS for the progress bar
import "./progress-styles.css";
import { TypeRacerTest, TypingStats } from "@/components/TypingTest";

type roomPlayer = {
  userId: string;
  username: string;
  isAdmin: boolean;
  progress: number;
  wpm?: number;
  accuracy?: number;
  position?: number;
  finishTime?: string;
};

export default function RacePage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [roomPlayers, setRoomPlayers] = useState<roomPlayer[]>([]);
  const [roomName, setRoomName] = useState<string>("");
  const [raceText, setRaceText] = useState<string>("");
  const [isUserComplete, setIsUserComplete] = useState<boolean>(false);
  const [isRaceStarted, setIsRaceStarted] = useState<boolean>(false);
  const [isRaceCompleted, setIsRaceCompleted] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [finalResults, setFinalResults] = useState<any[]>([]);

  // Current user's typing stats
  const [currentWpm, setCurrentWpm] = useState<number>(0);
  const [currentAccuracy, setCurrentAccuracy] = useState<number>(100);
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  // Countdown state
  const [countdownActive, setCountdownActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [raceId, setRaceId] = useState<string>("");

  // Use a ref to store the current raceId to avoid async state update issues
  const raceIdRef = useRef<string>("");
  // Use a ref to track completion status to ensure immediate effect
  const isCompleteRef = useRef<boolean>(false);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Progress update interval
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle race start
  const handleStartRace = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "start_race",
          payload: {
            roomId,
          },
        })
      );
      toast.success("Starting race countdown...");
    } else {
      toast.error("WebSocket connection not available");
    }
  };

  // Handle progress update
  const handleProgress = (progress: number) => {
    // Only update progress if the user hasn't completed the race
    if (!isCompleteRef.current) {
      setCurrentProgress(progress);
    }
  };

  // Handle race completion
  const handleComplete = (stats: TypingStats) => {
    // Set both state and ref to ensure immediate effect
    setIsUserComplete(true);
    isCompleteRef.current = true;

    // Clear the progress update interval when race is complete
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null; // Ensure it's null so we don't try to use it again
    }

    // Send final progress with isFinished flag
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const currentRaceId = raceIdRef.current;
      console.log("Sending completion with raceId:", currentRaceId);

      wsRef.current.send(
        JSON.stringify({
          type: "race_progress",
          payload: {
            token: localStorage.getItem("token"),
            raceId: currentRaceId,
            roomId,
            progress: "100",
            wpm: stats.wpm.toString(),
            accuracy: stats.accuracy.toString(),
            isFinished: true,
          },
        })
      );

      console.log("Race completed - stopping progress updates");
    }
  };

  // Handle stats updates during typing
  const handleStatsUpdate = (stats: TypingStats) => {
    // Only update stats if the user hasn't completed the race
    if (!isCompleteRef.current) {
      setCurrentWpm(stats.wpm);
      setCurrentAccuracy(stats.accuracy);
    }
  };

  // Start sending progress updates at regular intervals
  const startProgressUpdates = () => {
    // Reset completion status when starting a new race
    isCompleteRef.current = false;
    setIsUserComplete(false);

    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Send initial progress after a short delay to ensure raceId is set
    setTimeout(() => {
      if (!isCompleteRef.current) {
        sendProgressUpdate();

        // Set up interval to send progress updates (every 1 second)
        progressIntervalRef.current = setInterval(() => {
          // Double-check we're not complete before sending
          if (isCompleteRef.current) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
            return;
          }
          sendProgressUpdate();
        }, 1000);
      }
    }, 200);
  };

  // Send a progress update via WebSocket
  const sendProgressUpdate = () => {
    // Multiple safeguards to ensure we don't send after completion
    if (
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN &&
      !isUserComplete &&
      !isCompleteRef.current &&
      progressIntervalRef.current !== null
    ) {
      const currentRaceId = raceIdRef.current;

      console.log("Sending progress update with raceId:", currentRaceId);

      wsRef.current.send(
        JSON.stringify({
          type: "race_progress",
          payload: {
            token: localStorage.getItem("token"),
            raceId: currentRaceId,
            roomId,
            progress: currentProgress.toString(),
            wpm: currentWpm.toString(),
            accuracy: currentAccuracy.toString(),
            isFinished: false,
          },
        })
      );
    } else if (isCompleteRef.current && progressIntervalRef.current) {
      // Extra safety - if somehow we got here while complete, stop the interval
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Start countdown timer
  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    setCountdownActive(true);

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current!);
          setCountdownActive(false);
          setIsRaceStarted(true);

          // Start sending progress updates when race begins
          startProgressUpdates();

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Function to sort players by progress and WPM for results display
  const getSortedPlayers = () => {
    // First sort by finished status, then by progress, then by WPM
    return [...roomPlayers].sort((a, b) => {
      // Finished players first
      if (a.finishTime && !b.finishTime) return -1;
      if (!a.finishTime && b.finishTime) return 1;

      // If both are finished, sort by position
      if (a.finishTime && b.finishTime) {
        if (a.position && b.position) return a.position - b.position;
      }

      // If neither is finished, sort by progress
      if (b.progress !== a.progress) return b.progress - a.progress;

      // If progress is the same, sort by WPM
      return (b.wpm || 0) - (a.wpm || 0);
    });
  };

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}`);
    wsRef.current = ws;

    // Authenticate by passing jwt
    const curr_username = localStorage.getItem("username") || "aadithya2112";

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "authenticate",
          payload: {
            token: localStorage.getItem("token"),
          },
        })
      );
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message.type === "authenticate") {
        console.log("Authenticated");
        // if message.payload.success is true, join  room
        if (message.payload.success) {
          ws.send(
            JSON.stringify({
              type: "join_room",
              payload: {
                roomId,
                token: localStorage.getItem("token"),
              },
            })
          );
        }
      }

      // Join_room message if you are successfully joined to the room
      if (message.type === "join_room") {
        console.log("Joined room");
        const { participants, room } = message.payload;
        setRoomName(room.name);
        // Initialize players with zero progress
        const players: roomPlayer[] = participants.map((player: any) => ({
          userId: player.userId,
          username: player.username,
          isAdmin: room.admin.id === player.userId,
          progress: 0,
          wpm: 0,
          accuracy: 100,
        }));

        setRoomPlayers(players);
        if (curr_username === room.admin.name) {
          setIsAdmin(true);
        }
      }

      // other user joined message
      if (message.type === "user_joined") {
        const { userId, username } = message.payload;
        setRoomPlayers((prevPlayers) => [
          ...prevPlayers,
          {
            userId,
            username,
            isAdmin: false,
            progress: 0,
            wpm: 0,
            accuracy: 100,
          },
        ]);
        toast.success(`${message.payload.username} joined the room`);
      }

      if (message.type === "user_left") {
        const leftUserId = message.payload.userId;
        setRoomPlayers((prevPlayers) => {
          const updated = prevPlayers.filter(
            (player) => player.userId !== leftUserId
          );
          return updated;
        });
        toast.success(`${message.payload.username} left the room`);
      }

      // Handle race start message from server with countdown
      if (message.type === "race_started") {
        const { raceId, startTime, textContent, countdownSeconds } =
          message.payload;

        console.log("RaceId from server:", raceId);
        // Store in both state and ref to ensure it's available immediately
        setRaceId(raceId);
        raceIdRef.current = raceId;

        // Reset completion status when starting a new race
        isCompleteRef.current = false;
        setIsUserComplete(false);
        setIsRaceCompleted(false);
        setFinalResults([]);

        setRaceText(textContent);
        toast.success(`Race will start in ${countdownSeconds} seconds!`);

        // Start countdown
        startCountdown(countdownSeconds);
      }

      // Handle progress updates from all participants
      if (message.type === "race_progress") {
        const { participants } = message.payload;

        if (Array.isArray(participants)) {
          // Update all participants with their latest progress
          setRoomPlayers((prevPlayers) => {
            const updatedPlayers = [...prevPlayers];

            participants.forEach((participant: any) => {
              const playerIndex = updatedPlayers.findIndex(
                (p) => p.userId === participant.userId
              );

              if (playerIndex >= 0) {
                updatedPlayers[playerIndex] = {
                  ...updatedPlayers[playerIndex],
                  progress: parseInt(participant.progress) || 0,
                  wpm: parseInt(participant.wpm) || 0,
                  accuracy: parseInt(participant.accuracy) || 100,
                  position: participant.position,
                  finishTime: participant.finishTime,
                };
              }
            });

            return updatedPlayers;
          });

          // Check if this is a final results update (all players have progress)
          const allHaveProgress = participants.every(
            (p) => p.progress !== undefined
          );
          const someFinished = participants.some((p) => p.finishTime);

          // If this is a final update after race has been marked complete
          if (isRaceCompleted && allHaveProgress) {
            setFinalResults(participants);
          }
        }
      }

      // Handle race finished message
      if (message.type === "race_finished") {
        setIsRaceCompleted(true);
        setIsRaceStarted(false); // Reset race started state to allow for new races

        // Ensure we stop sending updates
        isCompleteRef.current = true;

        // Clear the progress update interval
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        toast.success("Race completed!");

        // Display results if available
        if (message.payload.results) {
          setFinalResults(message.payload.results);
        }
      }
    };

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      ws.close();
    };
  }, [roomId]);

  // Current date and time display
  const currentDate = "2025-04-05 12:50:43";
  const currentUser = "aadithya2112";

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          className="w-fit mb-6 border-[#009965] text-[#009965] hover:bg-[#009965] hover:text-white"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="w-full bg-[#0A0A0B] border-zinc-800 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-[#009965]">
                Room: {roomName || "Race Room"}
              </h1>

              {/* Start Race Button - Visible to admin if race hasn't started or when race is completed */}
              {isAdmin &&
                (!isRaceStarted || isRaceCompleted) &&
                !countdownActive && (
                  <Button
                    onClick={handleStartRace}
                    className="bg-[#009965] hover:bg-[#007d53] text-white"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isRaceCompleted ? "New Race" : "Start Race"}
                  </Button>
                )}

              {/* Countdown indicator */}
              {countdownActive && (
                <div className="flex items-center gap-2 bg-[#009965] px-4 py-2 rounded-md animate-pulse">
                  <Clock className="h-5 w-5 text-white" />
                  <span className="text-white font-bold">
                    Race starts in {countdown}s
                  </span>
                </div>
              )}

              {/* Race in progress indicator */}
              {isRaceStarted && !countdownActive && !isRaceCompleted && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#009965]" />
                  <span className="text-white font-medium">
                    Race in progress
                  </span>
                </div>
              )}

              {/* Race completed indicator - Changed to non-admin variant */}
              {isRaceCompleted && !isAdmin && (
                <div className="flex items-center gap-2 bg-[#009965] px-4 py-2 rounded-md">
                  <Flag className="h-5 w-5 text-white" />
                  <span className="text-white font-bold">Race completed</span>
                </div>
              )}
            </div>

            {/* Race Results Section - Show when race is completed */}
            {isRaceCompleted && (
              <div className="bg-zinc-900 p-4 rounded-lg mb-6 border border-[#009965]">
                <h2 className="text-xl font-semibold text-[#009965] mb-4 flex items-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  Race Results
                </h2>
                <div className="space-y-3">
                  {getSortedPlayers().map((player, index) => (
                    <div
                      key={player.userId}
                      className={`p-3 rounded-md ${
                        index === 0
                          ? "bg-opacity-90 bg-zinc-800 border border-[#009965]"
                          : "bg-zinc-800 bg-opacity-60"
                      } ${player.username === currentUser ? "border-l-4 border-l-[#009965]" : ""}`}
                    >
                      <div className="flex items-center">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-700 mr-3">
                          {index === 0 ? (
                            <Trophy className="h-4 w-4 text-[#009965]" />
                          ) : (
                            <span className="text-white font-bold">
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {player.username}{" "}
                            {player.username === currentUser ? "(You)" : ""}
                          </div>
                          <div className="flex gap-4 text-xs text-zinc-400 mt-1">
                            <span>
                              WPM:{" "}
                              <span className="text-white">
                                {player.wpm || 0}
                              </span>
                            </span>
                            <span>
                              Accuracy:{" "}
                              <span className="text-white">
                                {player.accuracy || 0}%
                              </span>
                            </span>
                            <span>
                              Progress:{" "}
                              <span className="text-white">
                                {player.progress || 0}%
                              </span>
                            </span>
                          </div>
                        </div>
                        {player.position && (
                          <div className="text-[#009965] font-bold">
                            #{player.position}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="mt-6 text-center text-zinc-400">
                    <p>As the room admin, you can start a new race.</p>
                  </div>
                )}
              </div>
            )}

            {/* Participants Section - Show during race */}
            {(!isRaceCompleted || roomPlayers.length > 0) && (
              <div className="bg-zinc-950 p-4 rounded-lg mb-6">
                <h2 className="text-xl font-semibold text-[#009965] mb-3">
                  Participants
                </h2>
                <div className="space-y-4">
                  {roomPlayers.length > 0 ? (
                    roomPlayers.map((player) => (
                      <div
                        key={player.userId}
                        className={`p-3 rounded-md bg-zinc-900 ${
                          player.finishTime ? "border border-[#009965]" : ""
                        } ${player.username === currentUser ? "bg-opacity-80" : ""}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Keyboard className="h-5 w-5 text-[#009965]" />
                          <span className="font-medium text-white">
                            {player.username}{" "}
                            {player.username === currentUser ? "(You)" : ""}
                          </span>
                          {player.isAdmin && (
                            <div className="flex items-center text-[#009965] mr-auto">
                              <Flag className="h-4 w-4 mr-1" />
                              <span className="text-sm">Admin</span>
                            </div>
                          )}

                          {/* Show WPM if available */}
                          {typeof player.wpm === "number" && player.wpm > 0 && (
                            <div className="ml-auto flex items-center text-white bg-zinc-800 px-2 py-1 rounded">
                              <span className="text-sm">{player.wpm} WPM</span>
                            </div>
                          )}

                          {/* Show position if finished */}
                          {player.position && (
                            <div className="flex items-center text-white bg-[#009965] px-2 py-1 rounded">
                              <span className="text-sm font-bold">
                                #{player.position}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Progress
                              value={player.progress}
                              className="h-2 bg-zinc-800 custom-progress"
                            />
                          </div>
                          <span className="text-xs text-zinc-400 min-w-[45px] text-right">
                            {player.progress}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2 text-zinc-500">
                      No participants yet
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {isRaceStarted && !countdownActive && !isRaceCompleted && (
                <TypeRacerTest
                  text={raceText}
                  onProgress={handleProgress}
                  onComplete={handleComplete}
                  onStatusUpdate={handleStatsUpdate}
                  disabled={isUserComplete || isRaceCompleted}
                />
              )}

              {countdownActive && (
                <div className="text-center py-12 bg-zinc-900 rounded-lg border border-[#009965]">
                  <h3 className="text-4xl font-bold text-[#009965] mb-2">
                    {countdown}
                  </h3>
                  <p className="text-zinc-400">Get ready to type!</p>
                  <p className="mt-4 text-sm text-zinc-500">
                    Today: {currentDate} UTC
                  </p>
                </div>
              )}

              {!isRaceStarted && !countdownActive && !isRaceCompleted && (
                <div className="text-center py-8 text-zinc-500">
                  {isAdmin
                    ? "Click 'Start Race' to begin"
                    : "Waiting for admin to start the race..."}
                </div>
              )}

              {isUserComplete && !isRaceCompleted && (
                <div className="text-center p-4 bg-zinc-900 rounded-lg mt-4 border border-[#009965]">
                  <h3 className="text-xl font-bold text-[#009965]">
                    You've completed the race!
                  </h3>
                  <p className="text-zinc-400 mt-2">
                    Waiting for other participants to finish...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
