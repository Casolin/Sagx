import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../api/auth.api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        token,
        newPassword,
      });

      toast.success("Password reset successfully");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
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
                Reset Password
              </h2>

              <p className="text-base text-gray-500 mt-2">
                Enter your new password to regain access
              </p>
            </div>

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              required
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
              required
            />

            <button
              disabled={loading}
              className="w-full py-3.5 bg-black text-white rounded-xl font-semibold
              hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset password"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Back to{" "}
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

            <h2 className="text-6xl font-bold leading-tight">Secure Reset</h2>

            <p className="mt-6 text-xl text-gray-200 leading-relaxed">
              Create a new secure password to protect your account and continue
              using SAGX safely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
