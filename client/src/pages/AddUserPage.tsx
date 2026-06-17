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
  skills: [] as string[],
  experience: 1,
  availability: true as boolean,
};

export default function AddUserPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

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

  // ---------------- SKILLS ----------------
  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;

    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills
        : [...prev.skills, skill],
    }));

    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  // ---------------- SUBMIT ----------------
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
      <div className="sticky top-0 z-20 backdrop-blur border-b border-zinc-200">
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

          {/* EXPERIENCE */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">Experience</p>

            <input
              name="experience"
              type="number"
              value={form.experience}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  experience: Number(e.target.value),
                }))
              }
              placeholder="Years of experience"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50
              focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          {/* AVAILABILITY (BOOLEAN FIXED) */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">Availability</p>

            <select
              value={form.availability ? "true" : "false"}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  availability: e.target.value === "true",
                }))
              }
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50
              focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>

          {/* SKILLS */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">Skills</p>

            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Add a skill"
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50
                focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              />

              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-3 rounded-xl bg-black text-white text-sm hover:opacity-90 cursor-pointer"
              >
                +
              </button>
            </div>

            {/* SKILL CHIPS */}
            <div className="flex flex-wrap gap-2 mt-3">
              {form.skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-zinc-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

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
              className="px-4 py-2 rounded-xl border border-zinc-200 text-sm text-zinc-600 hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90 disabled:opacity-40 cursor-pointer"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
