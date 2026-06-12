import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import api from "../api/axios"; // IMPORTANT: use raw api, not register wrapper

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // 🚨 IMPORTANT: bypass auth.api wrapper to avoid weird interceptor behavior
      await api.post("/api/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });

      toast.success("Account created successfully");
      navigate("/login");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden w-full">
      {/* LEFT SIDE */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/authenticate2.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/65 flex items-center">
          <div className="max-w-lg px-16">
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white">
              Mission Management Platform
            </span>

            <h2 className="text-6xl font-bold leading-tight text-white">
              Welcome to SAGX
            </h2>

            <p className="mt-6 text-xl text-gray-200 leading-relaxed">
              Plan missions, assign technicians, monitor progress, and manage
              operations.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10">
        <div className="w-full bg-white rounded-3xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <img src="/logo.png" className="w-24 mx-auto" />

            <h2 className="text-4xl font-bold text-center">Create Account</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="firstName"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
                className="px-4 py-3 border rounded-xl"
                required
              />

              <input
                name="lastName"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleChange}
                className="px-4 py-3 border rounded-xl"
                required
              />
            </div>

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="px-4 py-3 border rounded-xl"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="px-4 py-3 border rounded-xl"
              required
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="px-4 py-3 border rounded-xl"
              required
            />

            <button
              disabled={loading}
              className="py-3 bg-black text-white rounded-xl"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
