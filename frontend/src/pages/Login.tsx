import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, Lock, Phone, User, Heart } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onLogin: (token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ""}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.token);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-200 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-300 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl glass-card rounded-[2rem] overflow-hidden relative z-10 flex flex-col md:flex-row shadow-2xl"
      >
        {/* Image Section */}
        <div className="md:w-1/2 bg-black relative min-h-[300px] md:min-h-full overflow-hidden">
          <img
            src="https://image2url.com/r2/default/images/1772725081400-be91df77-f929-44d5-95e4-69e57a76a63b.jpeg"
            alt="Devotional"
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-white/80 font-serif italic text-lg leading-relaxed">
              "પ્રાપ્તિ એજ પૂર્ણાહુતિ"
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg rotate-3">
              <Heart size={24} fill="currentColor" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-stone-800 tracking-tight">
              HARI ANAND SMRUTI
            </h1>
            <p className="text-stone-500 text-sm mt-2">
              {isLogin ? "Welcome back to your devotional journey" : "Begin your journey of divine inspiration"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input
                type="tel"
                placeholder="Phone Number"
                required
                className="w-full pl-10 pr-4 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="w-full pl-10 pr-12 py-3 bg-stone-100 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && <p className="text-red-500 text-xs text-center font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center space-y-2">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-stone-600 text-sm hover:text-amber-600 transition-colors font-medium"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
            {isLogin && (
              <p className="text-stone-400 text-xs cursor-pointer hover:text-stone-600 transition-colors">
                Forgot Password?
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
