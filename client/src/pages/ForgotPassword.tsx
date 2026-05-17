import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { forgotPassword } from "../api/auth.api";
import { AxiosError } from "axios";

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
          Forgot password
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-400 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-indigo-500 
          focus:border-indigo-500 transition-all duration-200"
          required
        />

        <button
          disabled={loading}
          className="w-full py-3 bg-black text-white rounded-3xl font-semibold cursor-pointer"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Remember your password?{" "}
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
