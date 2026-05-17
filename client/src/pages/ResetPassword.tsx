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
    <div className="flex h-screen w-full justify-center items-center bg-[url('/public/authenticate.jpg')] bg-cover bg-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-2xl shadow-2xl w-105 flex flex-col gap-6"
      >
        <img src="/logo.png" className="w-19 m-auto" alt="Logo" />

        <h2 className="text-2xl text-center mb-2 font-semibold">
          Reset your password
        </h2>

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-400 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 
          focus:border-indigo-500 transition-all duration-200"
          required
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-400 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 
          focus:border-indigo-500 transition-all duration-200"
          required
        />

        <button
          disabled={loading}
          className="w-full py-3 bg-black text-white rounded-3xl font-semibold cursor-pointer"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Back to{" "}
          <a
            href="/login"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
