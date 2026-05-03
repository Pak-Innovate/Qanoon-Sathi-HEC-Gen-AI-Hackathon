import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { apiCall } from "../services/apiClient";

interface AuthProps {
  t: any;
  lang: string;
  setToken: (token: string | null) => void;
  setUser: (user: any) => void;
  setCurrentPage: (page: string) => void;
}

const Auth: React.FC<AuthProps> = ({
  t,
  lang,
  setToken,
  setUser,
  setCurrentPage,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { ...formData, preferred_lang: lang };

    try {
      const response = await apiCall(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      if (!data.token && data.message) {
        // Success but no token (likely email verification needed)
        setError(""); // Clear error
        alert(data.message);
        setIsLogin(true); // Switch to login
        return;
      }

      if (!data.token) {
        throw new Error("Authentication succeeded but no token was provided.");
      }

      // Save token and user
      localStorage.setItem("qanoonsathi_token", data.token);
      setToken(data.token);
      setUser(data.user);
      setCurrentPage("dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-6 animate-in">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-[#065016]/20 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#065016]/10 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#065016]/5 rounded-tr-full"></div>

        <h2 className="text-3xl font-black text-[#065016] text-center mb-8 uppercase tracking-tighter relative z-10">
          {isLogin
            ? lang === "ur"
              ? "لاگ ان"
              : "Login"
            : lang === "ur"
              ? "رجسٹر کریں"
              : "Register"}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 text-sm text-center font-bold">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 relative z-10"
          dir={lang === "ur" ? "rtl" : "ltr"}
        >
          {!isLogin && (
            <div>
              <label className="block text-[#065016]/60 text-xs font-bold uppercase tracking-widest mb-2">
                {lang === "ur" ? "پورا نام" : "Full Name"}
              </label>
              <input
                type="text"
                required
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                inputMode="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    full_name: e.target.value.toLowerCase(),
                  })
                }
                className="w-full bg-[#FDFBF7] p-4 rounded-xl border border-[#065016]/10 focus:border-[#065016] outline-none transition-colors lowercase"
                placeholder={
                  lang === "ur" ? "اپنا نام درج کریں" : "Enter your name"
                }
              />
            </div>
          )}

          <div>
            <label className="block text-[#065016]/60 text-xs font-bold uppercase tracking-widest mb-2">
              {lang === "ur" ? "ای میل" : "Email"}
            </label>
            <input
              type="email"
              required
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="email"
              spellCheck="false"
              inputMode="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value.toLowerCase(),
                })
              }
              className="w-full bg-[#FDFBF7] p-4 rounded-xl border border-[#065016]/10 focus:border-[#065016] outline-none transition-colors text-left lowercase"
              dir="ltr"
              placeholder="email@example.pk"
            />
          </div>

          <div>
            <label className="block text-[#065016]/60 text-xs font-bold uppercase tracking-widest mb-2">
              {lang === "ur" ? "پاس ورڈ" : "Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="current-password"
                spellCheck="false"
                inputMode="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value.toLowerCase(),
                  })
                }
                className="w-full bg-[#FDFBF7] p-4 rounded-xl border border-[#065016]/10 focus:border-[#065016] outline-none transition-colors text-left pr-12"
                dir="ltr"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#065016] hover:text-[#065016]/70 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#065016] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#065016]/90 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {loading
              ? "..."
              : isLogin
                ? lang === "ur"
                  ? "لاگ ان کریں"
                  : "Log In"
                : lang === "ur"
                  ? "اکاؤنٹ بنائیں"
                  : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-[#065016] font-bold text-sm uppercase tracking-widest hover:text-[#065016]/70 transition-colors cursor-pointer"
          >
            {isLogin
              ? lang === "ur"
                ? "نیا اکاؤنٹ بنائیں؟"
                : "Need an account? Register"
              : lang === "ur"
                ? "پہلے سے اکاؤنٹ ہے؟ لاگ ان"
                : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
