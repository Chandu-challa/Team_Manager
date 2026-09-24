"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      toast.error("Please enter a username");
      return;
    }
    if (!password) {
      toast.error("Please enter a password");
      return;
    }
    setLoading(true);
    try {
      await login({ username, password });
      toast.success("Successfully logged in");
      router.push("/dashboard");
    } catch (err) {
      const error = err;
      toast.error(error.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-zinc-950">
      {/* Background Image - Shifts to hide text on mobile, centers on desktop */}
      <div className="absolute inset-0 w-full h-full bg-[url('/images/Person.png')] bg-cover bg-no-repeat bg-position-[80%_center] lg:bg-center">
        {/* Dark overlay for mobile to ensure form readability if screen is very narrow */}
        <div className="absolute inset-0 bg-black/60 lg:bg-transparent transition-colors duration-500"></div>
      </div>

      <div className="w-full grid lg:grid-cols-2 z-10 min-h-screen">
        {/* Left Spacer to keep form on right half of screen on Desktop */}
        <div className="hidden lg:block"></div>

        {/* Right Side Form Container */}
        <div className="flex items-center justify-center lg:justify-end p-4 sm:p-8 lg:pr-24">
          {/* Glassmorphism Card */}
          <div className="w-full max-w-md bg-zinc-950/80 lg:bg-zinc-950/50 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
            {/* Header */}
            <div className="space-y-3 text-center">
              <div className="flex justify-center">
                <Users className="w-10 h-10 text-blue-500" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Welcome Back
                </h1>
                <p className="text-xs text-zinc-300">
                  Sign in to your account to continue
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                {/* Username Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-zinc-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Email or Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10 h-11 rounded-xl bg-black/30 border-white/10 focus:bg-black/50 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder:text-zinc-500 text-sm"
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-zinc-400" />
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 h-11 rounded-xl bg-black/30 border-white/10 focus:bg-black/50 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder:text-zinc-500 text-sm"
                    style={{ colorScheme: "dark" }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4 text-zinc-400 hover:text-zinc-200 transition-colors" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-zinc-400 hover:text-zinc-200 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Extra Links */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-white/20 text-blue-500 focus:ring-blue-500 bg-black/30 w-3.5 h-3.5 cursor-pointer"
                  />

                  <span className="text-xs text-zinc-300 select-none">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 mt-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 border-none"
                disabled={loading}
              >
                <span>{loading ? "Signing in..." : "Sign In"}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center py-1">
              <div className="grow border-t border-white/10"></div>
              <span className="shrink-0 mx-3 text-zinc-500 text-[10px] uppercase tracking-wider">
                OR
              </span>
              <div className="grow border-t border-white/10"></div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-zinc-400 pb-1">
              Don&apos;t have an account?{" "}
              <a href="#" className="text-blue-400 hover:underline">
                Contact Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
