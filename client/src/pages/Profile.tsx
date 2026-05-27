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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
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
      className={`min-h-screen px-6 py-10 ${
        dark ? "bg-[#0a0a0f] text-white" : "bg-[#f6f7fb] text-gray-900"
      }`}
    >
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p
          className={`mt-1 text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}
        >
          Control your identity, security, and account preferences
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* TOP CARD */}
        <div
          className={`rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between border ${
            dark ? "bg-[#111218] border-white/5" : "bg-white border-gray-200"
          } shadow-sm`}
        >
          {/* AVATAR */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-full overflow-hidden ring-2 ring-indigo-500/20">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-gray-300 to-gray-400 text-xl font-bold">
                    {user.firstName?.charAt(0)}
                  </div>
                )}
              </div>

              <label className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-500 p-1.5 rounded-full cursor-pointer shadow-md">
                <Upload size={14} className="text-white" />
                <input type="file" className="hidden" onChange={uploadAvatar} />
              </label>
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                {user.firstName} {user.lastName}
              </h2>
              <p
                className={`text-sm ${
                  dark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {user.email}
              </p>

              <span
                className={`inline-flex mt-2 text-xs px-2 py-1 rounded-full ${
                  user.role === "ADMIN"
                    ? "bg-orange-500/20 text-orange-400"
                    : user.role === "MANAGER"
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>

          {/* 2FA */}
          <div className="flex items-center gap-3">
            <span
              className={`text-xs ${dark ? "text-gray-400" : "text-gray-500"}`}
            >
              2FA
            </span>

            <div
              className={`text-xs px-2 py-1 rounded-full ${
                user.twoFactorEnabled
                  ? "bg-green-500/10 text-green-400"
                  : "bg-gray-500/10 text-gray-400"
              }`}
            >
              {user.twoFactorEnabled ? "Enabled" : "Disabled"}
            </div>

            <button
              onClick={handleEnable2FA}
              className="px-3 py-1 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
            >
              Enable
            </button>

            <button
              onClick={handleRemove2FA}
              className="px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
            >
              Disable
            </button>
          </div>
        </div>

        {/* FORM CARD */}
        <div
          className={`rounded-2xl p-6 border ${
            dark ? "bg-[#111218] border-white/5" : "bg-white border-gray-200"
          } shadow-sm`}
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Account Information</h2>
            <p
              className={`text-sm ${dark ? "text-gray-400" : "text-gray-500"}`}
            >
              Update your personal details and password
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              placeholder="First name"
              className={`p-3 rounded-xl border outline-none transition
              ${
                dark
                  ? "bg-black/30 border-white/10 placeholder:text-gray-500 focus:border-indigo-500"
                  : "bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-indigo-500"
              }`}
            />

            <input
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              placeholder="Last name"
              className={`p-3 rounded-xl border outline-none transition
              ${
                dark
                  ? "bg-black/30 border-white/10 placeholder:text-gray-500 focus:border-indigo-500"
                  : "bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-indigo-500"
              }`}
            />

            <input
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email address"
              className={`md:col-span-2 p-3 rounded-xl border outline-none transition
              ${
                dark
                  ? "bg-black/30 border-white/10 placeholder:text-gray-500 focus:border-indigo-500"
                  : "bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-indigo-500"
              }`}
            />

            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="Current password"
              className={`md:col-span-2 p-3 rounded-xl border outline-none transition
              ${
                dark
                  ? "bg-black/30 border-white/10 placeholder:text-gray-500 focus:border-indigo-500"
                  : "bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-indigo-500"
              }`}
            />

            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={onChange}
              placeholder="New password"
              className={`md:col-span-2 p-3 rounded-xl border outline-none transition
              ${
                dark
                  ? "bg-black/30 border-white/10 placeholder:text-gray-500 focus:border-indigo-500"
                  : "bg-gray-50 border-gray-200 placeholder:text-gray-400 focus:border-indigo-500"
              }`}
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-6 w-full py-3 rounded-xl font-semibold text-white
          bg-indigo-600 hover:bg-indigo-500 transition shadow-md cursor-pointer"
          >
            {saving ? "Saving..." : "Save Changes"}
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
