import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { getUsers, updateUser } from "../api/admin.api";
import type { User, UserRole } from "../types/global.types";

const roles: UserRole[] = ["ADMIN", "MANAGER", "TECHNICIAN"];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "TECHNICIAN" as UserRole,
  skills: [] as string[],
  experience: 0,
  availability: true,
};

export default function EditUserPage() {
  const [form, setForm] = useState(emptyForm);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        const users = await getUsers();
        const found = users.find((u) => u._id === id);

        if (!found) return;

        setUser(found);

        setForm({
          firstName: found.firstName || "",
          lastName: found.lastName || "",
          email: found.email || "",
          password: "",
          role: found.role,

          skills: found.skills || [],
          experience: found.experience || 0,
          availability: found.availability ?? true,
        });
      } catch (err) {
        console.error("Failed to load user", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "experience" ? Number(value) : value,
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
    if (!user) return;

    try {
      setSaving(true);

      const payload = {
        ...form,
        password: form.password.trim() === "" ? undefined : form.password,
      };

      await updateUser(user._id, payload);

      navigate("/users");
      toast.info("User modified successfully");
    } catch (err) {
      console.error("Update failed", err);
      toast.error("Failed to edit user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* HEADER */}
      <div className="sticky top-0 z-20 backdrop-blur border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-sm font-semibold text-zinc-800">Edit User</h1>

          <p className="text-xs text-zinc-500 mt-1">
            Update user details and permissions
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
            placeholder="Leave blank to keep current password"
            type="password"
            className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50
            focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          />

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
                placeholder="Add skill"
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50
                focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              />

              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-3 rounded-xl bg-black text-white text-sm cursor-pointer"
              >
                +
              </button>
            </div>

            {/* chips */}
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

          {/* EXPERIENCE */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">Experience (years)</p>
            <input
              name="experience"
              type="number"
              value={form.experience}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50
              focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          {/* AVAILABILITY */}
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
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90 disabled:opacity-40 cursor-pointer"
            >
              {saving ? "Updating..." : "Update User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
