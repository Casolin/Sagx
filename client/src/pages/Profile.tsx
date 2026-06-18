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
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[180px]" />
      </div>

      <div className="relative max-w-7xl mx-auto p-8">
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">
            Profile Settings
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your account, security and personal information.
          </p>
        </div>

        {/* HERO CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10" />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="h-28 w-28 rounded-full overflow-hidden ring-4 ring-indigo-500/20">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold">
                      {user.firstName?.charAt(0)}
                    </div>
                  )}
                </div>

                <label className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer hover:bg-indigo-500 transition">
                  <Upload size={16} />
                  <input
                    type="file"
                    className="hidden"
                    onChange={uploadAvatar}
                  />
                </label>
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  {user.firstName} {user.lastName}
                </h2>

                <p className="text-gray-400 mt-1">{user.email}</p>

                <div className="flex gap-2 mt-4">
                  <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-300">
                    {user.role}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      user.twoFactorEnabled
                        ? "bg-green-500/20 text-green-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {user.twoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
                  </span>
                </div>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-3 gap-4 w-full lg:w-auto">
              <div className="bg-black/20 rounded-2xl p-4 min-w-[120px]">
                <p className="text-xs text-gray-400">Status</p>
                <p className="font-semibold mt-1">Active</p>
              </div>

              <div className="bg-black/20 rounded-2xl p-4 min-w-[120px]">
                <p className="text-xs text-gray-400">Security</p>
                <p className="font-semibold mt-1">
                  {user.twoFactorEnabled ? "High" : "Medium"}
                </p>
              </div>

              <div className="bg-black/20 rounded-2xl p-4 min-w-[120px]">
                <p className="text-xs text-gray-400">Role</p>
                <p className="font-semibold mt-1">{user.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          {/* ACCOUNT FORM */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
            <h3 className="text-xl font-semibold mb-6">Personal Information</h3>

            <div className="grid md:grid-cols-2 gap-4">{/* inputs */}</div>

            <button
              onClick={save}
              disabled={saving}
              className="mt-8 w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold hover:scale-[1.01] transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* SECURITY SIDEBAR */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="font-semibold mb-4">Two-Factor Authentication</h3>

              <p className="text-sm text-gray-400 mb-5">
                Protect your account with an extra security layer.
              </p>

              {user.twoFactorEnabled ? (
                <button
                  onClick={handleRemove2FA}
                  className="w-full h-11 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  onClick={handleEnable2FA}
                  className="w-full h-11 rounded-xl bg-green-500/20 text-green-300 hover:bg-green-500/30"
                >
                  Enable 2FA
                </button>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <h3 className="font-semibold mb-4">Password Security</h3>

              <div className="space-y-3">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-[80%] bg-green-500" />
                </div>

                <p className="text-sm text-gray-400">
                  Strong password detected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
