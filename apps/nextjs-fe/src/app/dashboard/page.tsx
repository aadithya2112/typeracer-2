"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Keyboard, Trophy, Users, BarChart2 } from "lucide-react";
import axios from "axios";

export default function Dashboard() {
  const router = useRouter();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isJoinRoomOpen, setIsJoinRoomOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");
  const [user, setUser] = useState({
    id: "user-123",
    name: "User",
    email: "user@example.com",
    stats: {
      averageWpm: 85,
      highestWpm: 120,
      averageAccuracy: 96.5,
      totalRaces: 47,
      winRate: 68,
    },
  });

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUser((prevUser) => ({ ...prevUser, name: storedUsername }));
    }
  }, []);

  // Mock race history - in a real app, this would come from your database
  const raceHistory = [
    {
      id: "race-1",
      date: "Today, 2:30 PM",
      wpm: 92,
      accuracy: 97.2,
      position: 1,
      participants: 4,
    },
    {
      id: "race-2",
      date: "Today, 1:15 PM",
      wpm: 88,
      accuracy: 95.8,
      position: 2,
      participants: 6,
    },
    {
      id: "race-3",
      date: "Yesterday, 7:45 PM",
      wpm: 95,
      accuracy: 98.1,
      position: 1,
      participants: 3,
    },
    {
      id: "race-4",
      date: "Yesterday, 5:20 PM",
      wpm: 82,
      accuracy: 94.5,
      position: 3,
      participants: 8,
    },
    {
      id: "race-5",
      date: "2 days ago",
      wpm: 90,
      accuracy: 96.7,
      position: 2,
      participants: 5,
    },
  ];

  // Mock practice sessions
  const practiceSessions = [
    {
      id: "practice-1",
      date: "Today, 10:30 AM",
      wpm: 87,
      accuracy: 96.8,
      duration: 5,
    },
    {
      id: "practice-2",
      date: "Yesterday, 9:15 AM",
      wpm: 84,
      accuracy: 95.2,
      duration: 10,
    },
    {
      id: "practice-3",
      date: "3 days ago",
      wpm: 89,
      accuracy: 97.3,
      duration: 3,
    },
    {
      id: "practice-4",
      date: "Last week",
      wpm: 81,
      accuracy: 94.1,
      duration: 5,
    },
    {
      id: "practice-5",
      date: "Last week",
      wpm: 86,
      accuracy: 95.9,
      duration: 8,
    },
  ];

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    try {
      // In a real app, you would make an API call to create the room
      // and then navigate to the room page with the returned room ID
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/rooms`,
        {
          name: roomName,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log(res.data);

      if (res.data.sucess === false) {
        alert(res.data.message);
        return;
      }

      const roomId = res.data.data.id;
      console.log("Room created with ID:", roomId);
      router.push(`/dashboard/room/${roomId}`);
      setIsCreateRoomOpen(false);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room. Please try again.");
    }
  };

  const handleJoinRoom = async () => {};

  const handlePracticeSolo = () => {
    // Navigate to practice page
    router.push("/dashboard/practice");
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
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-white hover:text-emerald-400 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/leaderboard"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/profile"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Profile
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-zinc-400 hover:text-white">
              {user.name}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - User stats and actions */}
          <div className="w-full md:w-1/3 space-y-6">
            {/* User stats card */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Your Stats</CardTitle>
                <CardDescription>Your typing performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-400">Average WPM</p>
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-emerald-500" />
                      <p className="text-xl font-bold text-white">
                        {user.stats.averageWpm}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-400">Highest WPM</p>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-emerald-500" />
                      <p className="text-xl font-bold text-white">
                        {user.stats.highestWpm}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-400">Accuracy</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-white">
                        {user.stats.averageAccuracy}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-zinc-400">Races</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-white">
                        {user.stats.totalRaces}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={handlePracticeSolo}
                className="h-16 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
              >
                <Keyboard className="h-5 w-5 mr-2" />
                Practice Solo
              </Button>

              <Dialog
                open={isCreateRoomOpen}
                onOpenChange={setIsCreateRoomOpen}
              >
                <DialogTrigger asChild>
                  <Button className="h-16 bg-emerald-600 hover:bg-emerald-700">
                    <Users className="h-5 w-5 mr-2" />
                    Create Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Create a New Room
                    </DialogTitle>
                    <DialogDescription>
                      Create a room to race with friends or other typists.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="room-name" className="text-white">
                        Room Name
                      </Label>
                      <Input
                        id="room-name"
                        placeholder="Enter room name"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="private-room" className="text-white">
                          Private Room
                        </Label>
                        <p className="text-sm text-zinc-400">
                          Require a password to join
                        </p>
                      </div>
                      <Switch
                        id="private-room"
                        className="bg-emerald-600 border-zinc-700"
                        checked={isPrivate}
                        onCheckedChange={setIsPrivate}
                      />
                    </div>
                    {isPrivate && (
                      <div className="space-y-2">
                        <Label htmlFor="room-password" className="text-white">
                          Room Password
                        </Label>
                        <Input
                          id="room-password"
                          type="password"
                          placeholder="Enter password"
                          value={roomPassword}
                          onChange={(e) => setRoomPassword(e.target.value)}
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateRoomOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateRoom}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Create Room
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isJoinRoomOpen} onOpenChange={setIsJoinRoomOpen}>
                <DialogTrigger asChild>
                  <Button className="h-16 bg-blue-600 hover:bg-blue-700">
                    <Users className="h-5 w-5 mr-2" />
                    Join Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Join a Room
                    </DialogTitle>
                    <DialogDescription>
                      Enter the Room ID to join an existing room.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="room-id" className="text-white">
                        Room ID
                      </Label>
                      <Input
                        id="room-id"
                        placeholder="Enter room ID"
                        value={roomName} // Replace with a new state if needed
                        onChange={(e) => setRoomName(e.target.value)} // Replace with a new state handler if needed
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsJoinRoomOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleJoinRoom}
                    >
                      Join Room
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Right column - Race history and practice sessions */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="races" className="w-full">
              <TabsList className="bg-zinc-800 border-zinc-700 mb-6">
                <TabsTrigger value="races">Race History</TabsTrigger>
                <TabsTrigger value="practice">Practice Sessions</TabsTrigger>
              </TabsList>

              <TabsContent value="races">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">
                      Recent Races
                    </CardTitle>
                    <CardDescription>
                      Your latest typing competitions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {raceHistory.map((race) => (
                        <div
                          key={race.id}
                          className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                race.position === 1
                                  ? "bg-yellow-500/20 text-yellow-500"
                                  : race.position === 2
                                    ? "bg-zinc-400/20 text-zinc-400"
                                    : race.position === 3
                                      ? "bg-amber-700/20 text-amber-700"
                                      : "bg-zinc-700 text-zinc-400"
                              } font-bold`}
                            >
                              {race.position}
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {race.date}
                              </p>
                              <p className="text-sm text-zinc-400">
                                {race.participants} participants
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-sm text-zinc-500">WPM</div>
                              <div className="font-bold text-emerald-500">
                                {race.wpm}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-zinc-500">
                                Accuracy
                              </div>
                              <div className="font-medium text-white">
                                {race.accuracy}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="practice">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">
                      Practice Sessions
                    </CardTitle>
                    <CardDescription>Your solo typing practice</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {practiceSessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-white">
                              {session.date}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {session.duration} min duration
                            </p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-sm text-zinc-500">WPM</div>
                              <div className="font-bold text-emerald-500">
                                {session.wpm}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-zinc-500">
                                Accuracy
                              </div>
                              <div className="font-medium text-white">
                                {session.accuracy}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
