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
  const [coverLoaded, setCoverLoaded] = useState(false);

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
      window.location.reload();
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
      className={`h-screen overflow-hidden ${
        dark ? "bg-[#0b0d14] text-white" : "bg-[#f6f7fb] text-gray-900"
      }`}
    >
      <div className="h-full flex justify-center px-6 py-6">
        <div className="w-full max-w-5xl flex flex-col gap-4">
          <div className="relative h-40 md:h-44 rounded-2xl overflow-hidden border border-gray-200">
            <img
              src="/userprofilecover.webp"
              className="absolute inset-0 w-full h-full object-cover object-top scale-110 blur-xl opacity-60"
            />

            <img
              src="/userprofilecover.webp"
              onLoad={() => setCoverLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${
                coverLoaded ? "opacity-100" : "opacity-0"
              }`}
            />

            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* PROFILE HEADER */}
          <div className="relative -mt-12 px-4">
            <div className="rounded-2xl backdrop-blur-xl shadow-lg p-4 flex flex-col md:flex-row items-center justify-between bg-white border border-gray-200">
              {/* LEFT */}
              <div className="flex items-end gap-4">
                {/* AVATAR */}
                <div className="relative -mt-10">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden ring-4 ring-gray-200 shadow-md">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-indigo-500 to-purple-500 font-bold text-lg">
                        {user.firstName?.charAt(0)}
                      </div>
                    )}
                  </div>

                  <label className="absolute -bottom-2 -right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg cursor-pointer">
                    <Upload size={12} className="text-white" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={uploadAvatar}
                    />
                  </label>
                </div>

                {/* INFO */}
                <div>
                  <h2 className="text-lg font-semibold">
                    {user.firstName} {user.lastName}
                  </h2>

                  <p className="text-xs text-gray-500">{user.email}</p>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-gray-200 text-indigo-600">
                      {user.role}
                    </span>

                    <span
                      className={`text-[11px] px-2 py-1 rounded-full ${
                        user.twoFactorEnabled
                          ? "bg-green-500/10 text-green-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      2FA {user.twoFactorEnabled ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-row mt-6 md:mt-0 sm:flex-row gap-2">
                <button
                  onClick={handleEnable2FA}
                  className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Enable
                </button>

                <button
                  onClick={handleRemove2FA}
                  className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 hover:bg-gray-200"
                >
                  Disable
                </button>
              </div>
            </div>
          </div>

          {/* SETTINGS */}
          <div className="rounded-2xl p-5 backdrop-blur-xl shadow-lg bg-white border border-gray-200">
            <h3 className="text-sm font-semibold mb-3">Account Settings</h3>

            <div className="grid grid-cols-2 gap-3">
              <input
                name="firstName"
                value={form.firstName}
                onChange={onChange}
                placeholder="First name"
                className="p-2.5 text-sm rounded-xl bg-white border border-gray-200 focus:border-indigo-500 outline-none"
              />

              <input
                name="lastName"
                value={form.lastName}
                onChange={onChange}
                placeholder="Last name"
                className="p-2.5 text-sm rounded-xl bg-white border border-gray-200 focus:border-indigo-500 outline-none"
              />

              <input
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="Email"
                className="col-span-2 p-2.5 text-sm rounded-xl bg-white border border-gray-200 focus:border-indigo-500 outline-none"
              />

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                placeholder="Current password"
                className="col-span-2 p-2.5 text-sm rounded-xl bg-white border border-gray-200 focus:border-indigo-500 outline-none"
              />

              <input
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={onChange}
                placeholder="New password"
                className="col-span-2 p-2.5 text-sm rounded-xl bg-white border border-gray-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="mt-4 w-full py-2.5 text-sm rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
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
