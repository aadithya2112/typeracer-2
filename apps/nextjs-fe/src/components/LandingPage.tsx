import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Users,
  Zap,
  Keyboard,
  ChevronRight,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function LandingPage() {
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
              href="#features"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-to-play"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              How to Play
            </Link>
            <Link
              href="#leaderboard"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="#testimonials"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-zinc-400 hover:text-white">
              Login
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-transparent opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
              Race With Your Fingers
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 mb-8">
              The ultimate multiplayer typing competition. Challenge friends,
              improve your speed, and climb the global leaderboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6 px-8">
                Play Now
              </Button>
            </div>
            <div className="mt-12 relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg blur opacity-30"></div>
              <div className="relative bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                <Image
                  src="/placeholder.svg?height=600&width=1200"
                  alt="TypeRacer gameplay"
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
              Game Features
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Multiplayer Races</h3>
              <p className="text-zinc-400">
                Race against friends or random players from around the world in
                real-time typing competitions.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center mb-6">
                <Trophy className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Leaderboards</h3>
              <p className="text-zinc-400">
                Compete for the top spot on daily, weekly, and all-time
                leaderboards. Show off your typing prowess.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Skill Progression</h3>
              <p className="text-zinc-400">
                Track your WPM, accuracy, and improvement over time with
                detailed statistics and insights.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center mb-6">
                <Keyboard className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Custom Text Challenges</h3>
              <p className="text-zinc-400">
                Practice with texts from various categories or create your own
                custom typing challenges.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Friend Challenges</h3>
              <p className="text-zinc-400">
                Create private rooms to challenge friends and colleagues to
                typing duels.
              </p>
            </div>
            <div className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center mb-6">
                <Trophy className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Achievement System</h3>
              <p className="text-zinc-400">
                Unlock badges and achievements as you improve your typing skills
                and win races.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section id="how-to-play" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
              How to Play
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-emerald-500">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Sign Up</h3>
              <p className="text-zinc-400">
                Create your free account to track your progress and join the
                global leaderboard.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-emerald-500">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Join a Race</h3>
              <p className="text-zinc-400">
                Enter a public race or create a private room to challenge your
                friends.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-emerald-500">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Type & Win</h3>
              <p className="text-zinc-400">
                Type the text as quickly and accurately as possible to outpace
                your opponents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview Section */}
      <section id="leaderboard" className="py-20 bg-zinc-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
              Global Leaderboard
            </span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
                <h3 className="font-bold">Top Racers This Week</h3>
                <Button variant="link" className="text-emerald-500 p-0">
                  View Full Leaderboard{" "}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="divide-y divide-zinc-800">
                {[
                  { rank: 1, name: "SpeedDemon", wpm: 156, accuracy: 99.2 },
                  {
                    rank: 2,
                    name: "KeyboardWarrior",
                    wpm: 148,
                    accuracy: 98.7,
                  },
                  { rank: 3, name: "TypeMaster", wpm: 142, accuracy: 97.5 },
                  { rank: 4, name: "SwiftFingers", wpm: 138, accuracy: 96.8 },
                  { rank: 5, name: "WordNinja", wpm: 135, accuracy: 98.1 },
                ].map((player) => (
                  <div
                    key={player.rank}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          player.rank === 1
                            ? "bg-yellow-500/20 text-yellow-500"
                            : player.rank === 2
                              ? "bg-zinc-400/20 text-zinc-400"
                              : player.rank === 3
                                ? "bg-amber-700/20 text-amber-700"
                                : "bg-zinc-800 text-zinc-400"
                        } font-bold`}
                      >
                        {player.rank}
                      </span>
                      <span className="font-medium">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-zinc-500">WPM</div>
                        <div className="font-bold text-emerald-500">
                          {player.wpm}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-zinc-500">Accuracy</div>
                        <div className="font-medium">{player.accuracy}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
              What Players Say
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Johnson",
                role: "Software Developer",
                quote:
                  "TypeRacer has improved my coding speed dramatically. The competitive aspect makes practice fun!",
              },
              {
                name: "Sarah Chen",
                role: "Content Writer",
                quote:
                  "As a professional writer, typing speed is crucial. This game made practice enjoyable and I've seen real results.",
              },
              {
                name: "Michael Rodriguez",
                role: "Student",
                quote:
                  "I use TypeRacer to prepare for my essays. My typing speed went from 65 to 110 WPM in just two months!",
              },
              {
                name: "Emma Wilson",
                role: "Data Analyst",
                quote:
                  "The analytics and progress tracking are fantastic. I can see my improvement over time which keeps me motivated.",
              },
              {
                name: "David Park",
                role: "Game Developer",
                quote:
                  "The UI is sleek and the gameplay is addictive. I find myself coming back daily to improve my ranking.",
              },
              {
                name: "Olivia Martinez",
                role: "Administrative Assistant",
                quote:
                  "TypeRacer made improving my typing speed fun instead of a chore. Now I'm the fastest typist in my office!",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-zinc-900 p-8 rounded-lg border border-zinc-800"
              >
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-zinc-300 mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-zinc-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-900/30 to-teal-900/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Race Your Fingers?
          </h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Join thousands of typists around the world. Improve your speed,
            challenge friends, and climb the leaderboard.
          </p>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6 px-8">
            Start Typing Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Keyboard className="h-6 w-6 text-emerald-500" />
                <span className="text-xl font-bold">TypeRacer</span>
              </div>
              <p className="text-zinc-400 mb-4">
                The ultimate multiplayer typing competition.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-zinc-500 hover:text-white">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-zinc-500 hover:text-white">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-zinc-500 hover:text-white">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Game</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Play Now
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Practice
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Tournaments
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Typing Tips
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-zinc-400 hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-900 mt-12 pt-8 text-center text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} TypeRacer. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
