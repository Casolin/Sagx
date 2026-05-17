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
    <div className="flex h-screen w-full justify-center items-center bg-[url('/public/authenticate.jpg')] bg-cover bg-center">
      <form
        onSubmit={handleLogin}
        className="bg-white p-10 rounded-2xl shadow-2xl w-105 flex flex-col gap-6"
      >
        <img src="/logo.png" className="w-19 m-auto" alt="Logo" />

        <h2 className="text-2xl text-center mb-2 font-semibold">
          {step === 1 ? "Welcome back" : "Two-Factor Authentication"}
        </h2>

        {step === 1 && (
          <>
            <input
              className="w-full px-4 py-3 border border-gray-400 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 
              focus:border-indigo-500 transition-all duration-200"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />

            <input
              className="w-full px-4 py-3 border border-gray-400 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-indigo-500 
              focus:border-indigo-500 transition-all duration-200"
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
                className="text-sm text-indigo-600 font-medium hover:underline transition"
              >
                Forgot password
              </a>
            </div>
          </>
        )}

        {step === 2 && (
          <input
            className="w-full px-4 py-3 border border-gray-400 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 
            focus:border-indigo-500 transition-all duration-200"
            placeholder="Code"
            value={twoFactorToken}
            onChange={(e) => setTwoFactorToken(e.target.value)}
            autoComplete="off"
          />
        )}

        <button
          disabled={loading}
          className="w-full py-3 bg-black text-white rounded-3xl font-semibold cursor-pointer"
        >
          {loading ? "Processing..." : step === 1 ? "Login" : "Confirm"}
        </button>

        {step === 2 && (
          <button
            type="button"
            onClick={handleBack}
            className="text-sm text-gray-500 hover:text-black transition cursor-pointer"
          >
            Back
          </button>
        )}
      </form>
    </div>
  );
}
