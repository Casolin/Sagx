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
};

export default function EditUserPage() {
  const [form, setForm] = useState(emptyForm);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      [name]: value,
    }));
  };

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
    <div className="w-full min-h-screen bg-gray-50 px-10 py-10">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>

        <p className="text-gray-500 mt-1">
          Update user details and permissions
        </p>
      </div>

      {/* FORM CARD */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="First name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
              focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />

            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Last name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
              focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-xl border border-gray-200
            focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          {/* PASSWORD */}
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
            type="password"
            className="w-full px-4 py-3 rounded-xl border border-gray-200
            focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          {/* ROLE */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200
            focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="
                bg-indigo-600
                hover:bg-indigo-700
                text-white
                font-medium
                px-6
                py-3
                rounded-xl
                transition
                cursor-pointer
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {saving ? "Updating..." : "Update User"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/users")}
              className="
                px-6 py-3 rounded-xl
                border border-gray-300
                text-gray-700
                hover:bg-gray-100
                transition
                cursor-pointer
              "
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
