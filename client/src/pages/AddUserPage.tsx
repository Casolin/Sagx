import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { createUser } from "../api/admin.api";
import type { UserRole } from "../types/global.types";

const roles: UserRole[] = ["ADMIN", "MANAGER", "TECHNICIAN"];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "TECHNICIAN" as UserRole,
};

export default function AddUserPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await createUser(form);
      navigate("/users");
      toast.success("User added successfully");
    } catch (err) {
      console.error("Create user failed", err);
      toast.error("Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-sm font-semibold text-zinc-800">Create User</h1>

          <p className="text-xs text-zinc-500 mt-1">
            Add a new team member and assign their role
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 space-y-5">
          {/* NAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="First name"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50
            focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
            />

            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50
            focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          {/* EMAIL */}
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50
          focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          />

          {/* PASSWORD */}
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50
          focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          />

          {/* ROLE */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">Role</p>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50
            focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="px-4 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90 disabled:opacity-40 transition"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
