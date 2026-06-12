import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorToken, setTwoFactorToken] = useState("");

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await loginUser({
        email,
        password,
        twoFactorToken: step === 2 ? twoFactorToken : undefined,
      });

      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      const message = error.response?.data?.message;

      if (message === "2FA token is required") {
        setStep(2);
        toast.info("Enter your 2FA code");
        return;
      }

      toast.error(message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setTwoFactorToken("");
  };

  return (
    <div className="flex h-screen overflow-hidden w-full">
      {/* LEFT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10">
        <div className="w-full bg-white rounded-3xl p-8 md:p-12">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <img src="/logo.png" className="w-24 mx-auto" alt="Logo" />

            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900">Welcome Back</h2>

              <p className="text-base text-gray-500 mt-2">
                Sign in to continue managing your system
              </p>
            </div>

            {step === 1 && (
              <>
                <input
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                />

                <input
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />

                <div className="flex justify-between items-center -mt-2">
                  <span className="text-xs text-gray-400">
                    Need help signing in?
                  </span>

                  <a
                    href="/forgot-password"
                    className="text-sm text-black font-medium hover:underline"
                  >
                    Forgot password
                  </a>
                </div>
              </>
            )}

            {step === 2 && (
              <input
                className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                placeholder="2FA Code"
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value)}
                autoComplete="off"
              />
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full py-3.5 bg-black text-white rounded-xl font-semibold
              hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : step === 1 ? "Login" : "Confirm"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Don’t have an account?{" "}
              <a
                href="/register"
                className="font-semibold text-black hover:underline"
              >
                Sign up
              </a>
            </p>

            {step === 2 && (
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-gray-500 hover:text-black transition"
              >
                Back
              </button>
            )}
          </form>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE + TEXT */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/authenticate.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/65 flex items-center">
          <div className="max-w-lg px-16 text-white">
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium">
              Mission Management Platform
            </span>

            <h2 className="text-6xl font-bold leading-tight">
              Welcome Back to SAGX
            </h2>

            <p className="mt-6 text-xl text-gray-200 leading-relaxed">
              Access your dashboard, manage missions, and continue tracking your
              operations seamlessly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
