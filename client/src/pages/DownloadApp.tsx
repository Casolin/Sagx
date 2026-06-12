import { Monitor, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DownloadApp() {
  const navigate = useNavigate();

  const desktopUrl =
    "https://github.com/Casolin/Sagx/releases/download/v1.0.0/sagx-setup.exe";

  const handleDesktopDownload = () => {
    window.open(desktopUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-linear-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center px-6">
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur hover:bg-white/20 transition active:scale-95"
      >
        ← Back
      </button>

      <div className="w-full max-w-6xl">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-bold tracking-tight">Download SagX</h1>

          <p className="text-gray-400 mt-4 text-sm">
            Choose your platform and get started in seconds
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* DESKTOP */}
          <button
            onClick={handleDesktopDownload}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 text-left transition hover:bg-white/10 hover:border-white/20"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <Monitor className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold">Desktop App</h2>

            <p className="text-gray-400 mt-3 leading-relaxed">
              Install SagX for Windows with full native performance, background
              support, and system integration.
            </p>

            <div className="mt-6 text-sm text-gray-500">
              Windows 10 / 11 • .exe Installer
            </div>

            <div className="mt-10 font-semibold text-white/80 group-hover:text-white transition">
              Download for PC →
            </div>
          </button>

          {/* MOBILE */}
          <button
            onClick={() => navigate("/download")}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 text-left transition hover:bg-white/10 hover:border-white/20"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <Smartphone className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold">Mobile App</h2>

            <p className="text-gray-400 mt-3 leading-relaxed">
              Download the Android APK and install SagX on your mobile device
              easily and securely.
            </p>

            <div className="mt-6 text-sm text-gray-500">
              Android 9+ • APK File
            </div>

            <div className="mt-10 font-semibold text-white/80 group-hover:text-white transition">
              Continue to Mobile →
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
