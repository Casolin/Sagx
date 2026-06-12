import { Monitor, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DownloadApp() {
  const navigate = useNavigate();

  const desktopUrl =
    "https://github.com/Casolin/Sagx/releases/download/v1.0.0/sagx-setup.exe";

  const handleDesktopDownload = () => {
    window.open(desktopUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-linear-to-b from-gray-950 via-gray-900 to-black text-white">
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur hover:bg-white/20 transition active:scale-95 cursor-pointer"
      >
        ← Back
      </button>

      <div className="w-full max-w-5xl px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Download SagX</h1>

          <p className="text-gray-400 mt-3">
            Choose your platform to continue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={handleDesktopDownload}
            className="group bg-white/5 border border-white/10 rounded-3xl p-8 text-left hover:bg-white/10 hover:border-white/20 transition cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <Monitor className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold">Desktop</h2>

            <p className="text-gray-400 mt-3">
              Download the Windows desktop application with full native support.
            </p>

            <div className="mt-6 text-sm text-gray-500">
              Windows 10+ • Installer (.exe)
            </div>

            <div className="mt-8 font-semibold group-hover:translate-x-1 transition">
              Download for PC →
            </div>
          </button>

          <button
            onClick={() => navigate("/download")}
            className="group bg-white/5 border border-white/10 rounded-3xl p-8 text-left hover:bg-white/10 hover:border-white/20 transition cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <Smartphone className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold">Mobile</h2>

            <p className="text-gray-400 mt-4">
              Download the Android APK and install it on your device.
            </p>

            <div className="mt-6 text-sm text-gray-500">Android 9+ • APK</div>

            <div className="mt-8 font-semibold group-hover:translate-x-1 transition">
              Continue to Mobile Download →
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
