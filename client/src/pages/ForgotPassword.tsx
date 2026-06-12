import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword } from "../api/auth.api";
import type { AxiosError } from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await forgotPassword({ email });

      toast.success("Reset link sent to your email");
      navigate("/login");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;

      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden w-full">
      {/* LEFT SIDE - FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10">
        <div className="w-full bg-white rounded-3xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <img src="/logo.png" className="w-24 mx-auto" alt="Logo" />

            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900">
                Forgot Password
              </h2>

              <p className="text-base text-gray-500 mt-2">
                Enter your email to receive a reset link
              </p>
            </div>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              required
            />

            <button
              disabled={loading}
              className="w-full py-3.5 bg-black text-white rounded-xl font-semibold
              hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Remember your password?{" "}
              <a
                href="/login"
                className="font-semibold text-black hover:underline"
              >
                Sign in
              </a>
            </p>
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
              Account Recovery
            </h2>

            <p className="mt-6 text-xl text-gray-200 leading-relaxed">
              We’ll send you a secure link to reset your password and regain
              access to your SAGX dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
