import { useEffect, useState } from "react";
import {
  getProfile,
  updateProfile,
  updateAvatar,
  enable2FA,
  remove2FA,
} from "../api/user.api";
import type { User } from "../types/global.types";
import { Upload } from "lucide-react";
import { toast } from "react-toastify";
import AvatarCropModal from "../components/AvatarCropModal";

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  newPassword: string;
};

type UpdatePayload = {
  firstName: string;
  lastName: string;
  email: string;
  oldPassword?: string;
  newPassword?: string;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export default function Profile({ dark }: { dark?: boolean }) {
  const [user, setUser] = useState<User | null>(null);

  const [form, setForm] = useState<Form>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [cropOpen, setCropOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const roleColor = user
    ? {
        ADMIN: "bg-orange-500 text-white",
        MANAGER: "bg-indigo-500 text-white",
        TECHNICIAN: "bg-gray-800 text-white",
      }[user.role] || "bg-gray-500 text-white"
    : "bg-gray-500 text-white";

  /* =========================
     LOAD PROFILE
  ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfile();
        const u: User = res.data;

        setUser(u);

        setForm({
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
          password: "",
          newPassword: "",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* =========================
     FORM CHANGE
  ========================= */
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     SAVE PROFILE
  ========================= */
  const save = async () => {
    setSaving(true);

    try {
      const payload: UpdatePayload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
      };

      if (form.newPassword.trim()) {
        if (!form.password.trim()) {
          toast.error("Old password required");
          return;
        }

        payload.oldPassword = form.password;
        payload.newPassword = form.newPassword;
      }

      const updated = await updateProfile(payload);

      setUser((prev) => (prev ? { ...prev, ...updated } : updated));

      setForm((prev) => ({
        ...prev,
        password: "",
        newPassword: "",
      }));

      toast.success("Profile updated successfully");
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     2FA HANDLERS (FIXED)
  ========================= */
  const handleEnable2FA = async () => {
    try {
      const res = await enable2FA();

      setUser((prev) => (prev ? { ...prev, twoFactorEnabled: true } : prev));

      if (res?.qrCodeUrl) {
        setQrCodeUrl(res.qrCodeUrl);
      }

      toast.success("2FA enabled");
    } catch {
      toast.error("Failed to enable 2FA");
    }
  };

  const handleRemove2FA = async () => {
    try {
      await remove2FA();

      setUser((prev) => (prev ? { ...prev, twoFactorEnabled: false } : prev));

      toast.success("2FA removed");
    } catch {
      toast.error("Failed to remove 2FA");
    }
  };

  /* =========================
     AVATAR UPLOAD
  ========================= */
  const uploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCropOpen(true);
    };

    reader.readAsDataURL(file);
  };

  const handleCroppedSave = async (blob: Blob) => {
    const fd = new FormData();
    fd.append("avatar", blob);

    try {
      const updated = await updateAvatar(fd);

      setUser((prev) => (prev ? { ...prev, avatar: updated.avatar } : updated));

      toast.success("Avatar updated");
    } catch {
      toast.error("Failed to update avatar");
    } finally {
      setCropOpen(false);
      setImageSrc(null);
    }
  };

  /* =========================
     LOADING / ERROR
  ========================= */
  if (loading)
    return (
      <div className={`p-10 ${dark ? "text-gray-300" : "text-gray-500"}`}>
        Loading profile...
      </div>
    );

  if (!user) return <div className="p-6 text-red-500">Failed to load</div>;

  if (qrCodeUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
        <h1 className="text-xl font-bold mb-4">Scan QR Code</h1>

        <img
          src={qrCodeUrl}
          alt="2FA QR"
          className="w-64 h-64 bg-white p-2 rounded-xl"
        />

        <button
          onClick={() => setQrCodeUrl(null)}
          className="mt-6 bg-indigo-600 px-4 py-2 rounded-xl cursor-pointer"
        >
          Done
        </button>
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div
      className={`px-6 py-10 min-h-screen ${
        dark ? "bg-gray-950 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* HEADER */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p
          className={`text-sm mt-1 ${dark ? "text-gray-400" : "text-gray-500"}`}
        >
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`rounded-2xl border p-6 flex flex-col h-full ${
            dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-300"
          }`}
        >
          {/* TOP CONTENT */}
          <div className="flex flex-col items-center text-center">
            {/* AVATAR */}
            <div className="relative">
              <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-gray-300/50 shadow-sm">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-700 text-2xl font-semibold">
                    {user.firstName?.charAt(0)}
                  </div>
                )}
              </div>

              <label className="absolute bottom-1 right-1 bg-gray-800 hover:bg-gray-700 transition p-2 rounded-full cursor-pointer">
                <Upload size={14} className="text-gray-200" />
                <input type="file" className="hidden" onChange={uploadAvatar} />
              </label>
            </div>

            <h2 className="mt-5 text-lg font-medium">
              {user.firstName} {user.lastName}
            </h2>

            <p className="text-sm text-gray-500">{user.email}</p>

            <span
              className={`mt-3 text-xs px-3 py-1 rounded-full ${roleColor}`}
            >
              {user.role}
            </span>
          </div>

          {/* BOTTOM ACTION AREA (FIXED) */}
          <div className="mt-auto pt-6 space-y-3">
            {/* 2FA STATUS */}
            <div className="text-center text-xs text-gray-500">
              2FA:{" "}
              <span
                className={
                  user.twoFactorEnabled ? "text-green-400" : "text-gray-400"
                }
              >
                {user.twoFactorEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2">
              <button
                onClick={handleEnable2FA}
                className="flex-1 text-xs font-semibold bg-white text-black border border-gray-300 hover:bg-gray-100 cursor-pointer transition py-2 rounded-xl"
              >
                Enable
              </button>

              <button
                onClick={handleRemove2FA}
                className="flex-1 text-xs font-semibold bg-black text-white hover:bg-gray-800 cursor-pointer transition py-2 rounded-xl"
              >
                Disable
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div
          className={`lg:col-span-2 rounded-2xl border p-6 ${
            dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-300"
          }`}
        >
          <h2 className="text-base font-medium mb-6">Account details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              className="p-3 rounded-xl border border-gray-300/40 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="First name"
            />

            <input
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              className="p-3 rounded-xl border border-gray-300/40 bg-transparent focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="Last name"
            />

            <input
              name="email"
              value={form.email}
              onChange={onChange}
              className="p-3 rounded-xl border border-gray-300/40 bg-transparent md:col-span-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="Email"
            />

            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              className="p-3 rounded-xl border border-gray-300/40 bg-transparent md:col-span-2"
              placeholder="Old password"
            />

            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={onChange}
              className="p-3 rounded-xl border border-gray-300/40 bg-transparent md:col-span-2"
              placeholder="New password"
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-6 w-full bg-gray-900 font-bold hover:bg-gray-800 text-white py-3 rounded-xl transition cursor-pointer"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {/* CROPPER */}
      {cropOpen && imageSrc && (
        <AvatarCropModal
          image={imageSrc}
          onCancel={() => {
            setCropOpen(false);
            setImageSrc(null);
          }}
          onSave={handleCroppedSave}
        />
      )}
    </div>
  );
}
