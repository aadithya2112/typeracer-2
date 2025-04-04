"use client";

import { signin } from "@/actions/authActions";
import { useState, useTransition } from "react";

export default function SignUpPage() {
  const [formState, setFormState] = useState({ message: "", success: false });
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const res = await signin({}, formData);

      if (res.success && res.token) {
        localStorage.setItem("token", res.token); // ✅ store token
        localStorage.setItem("username", res.username); // ✅ store username
        window.location.href = "/dashboard"; // ✅ redirect or update UI
      } else {
        setFormState({ message: res.message, success: false });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010302] text-white">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#0c0f0e] shadow-lg">
        <h1 className="text-3xl font-semibold mb-6 text-center text-[#009965]">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="w-full px-4 py-2 rounded bg-[#010302] border border-[#009965] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009965]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>

            <input
              type="password"
              name="password"
              id="password"
              required
              className="w-full px-4 py-2 rounded bg-[#010302] border border-[#009965] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009965]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 rounded bg-[#009965] text-black font-semibold hover:brightness-110 transition disabled:opacity-60"
          >
            {isPending ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        {formState.message && (
          <p
            className={`mt-4 text-center text-sm ${
              formState.success ? "text-green-400" : "text-red-500"
            }`}
          >
            {formState.message}
          </p>
        )}
      </div>
    </div>
  );
}
