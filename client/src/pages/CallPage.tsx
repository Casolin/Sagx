import { useEffect, useRef, useState } from "react";
import { useCallStore } from "../utils/call.store";
import {
  Phone,
  Mic,
  MicOff,
  X,
  Minimize2,
  PhoneOff,
  PhoneCall,
  Maximize2,
  ScreenShare,
  MonitorOff,
  Maximize,
  Minimize,
} from "lucide-react";

import {
  stopRingtone,
  stopCallingTone,
  startCallingTone,
  startRingtone,
} from "../utils/callSounds";

export const CallPage = () => {
  const incomingCall = useCallStore((s) => s.incomingCall);
  const callAccepted = useCallStore((s) => s.callAccepted);
  const isCalling = useCallStore((s) => s.isCalling);

  const answerCall = useCallStore((s) => s.answerCall);
  const rejectCall = useCallStore((s) => s.rejectCall);
  const endCall = useCallStore((s) => s.endCall);

  const remoteStream = useCallStore((s) => s.remoteStream);

  const toggleMute = useCallStore((s) => s.toggleMute);
  const toggleScreenShare = useCallStore((s) => s.toggleScreenShare);

  const isMuted = useCallStore((s) => s.isMuted);
  const isScreenSharing = useCallStore((s) => s.isScreenSharing);

  const isMinimized = useCallStore((s) => s.isMinimized);
  const minimizeCall = useCallStore((s) => s.minimizeCall);
  const restoreCall = useCallStore((s) => s.restoreCall);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isIncoming = !!incomingCall;
  const isInCall = callAccepted;

  // ✅ NEW: fake fullscreen state (ONLY for video)
  const [isVideoFull, setIsVideoFull] = useState(false);

  const toggleVideoFull = () => {
    setIsVideoFull((prev) => !prev);
  };

  useEffect(() => {
    if (!remoteStream) return;

    const attachStream = async () => {
      if (!videoRef.current) return;

      if (videoRef.current.srcObject !== remoteStream) {
        videoRef.current.srcObject = remoteStream;
      }

      try {
        await videoRef.current.play();
      } catch (err) {
        // @ts-expect-error chat
        console.log(err.message);
      }
    };

    setTimeout(() => {
      attachStream();
    }, 100);

    window.addEventListener("focus", attachStream);

    return () => {
      window.removeEventListener("focus", attachStream);
    };
  }, [remoteStream, isMinimized]);

  useEffect(() => {
    if (isIncoming && !isInCall) startRingtone();
    else stopRingtone();
    return () => stopRingtone();
  }, [isIncoming, isInCall]);

  useEffect(() => {
    if (isCalling && !isIncoming && !isInCall) startCallingTone();
    else stopCallingTone();
    return () => stopCallingTone();
  }, [isCalling, isIncoming, isInCall]);

  if (isMinimized && isInCall) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
          <PhoneCall size={16} className="opacity-80" />
          <span className="text-sm opacity-90">Call in progress</span>

          <button
            onClick={restoreCall}
            className="hover:opacity-70 cursor-pointer"
          >
            <Maximize2 size={16} />
          </button>

          <button
            onClick={endCall}
            className="hover:opacity-70 text-red-400 cursor-pointer"
          >
            <PhoneOff size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black text-white flex items-center justify-center z-50"
    >
      {/* VIDEO */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={
          isVideoFull
            ? "absolute inset-0 w-full h-full object-contain bg-black"
            : "absolute top-6 right-6 w-72 h-48 bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 object-cover"
        }
      />

      {/* FULLSCREEN BUTTON (now only toggles VIDEO fullscreen) */}
      {isInCall && (
        <button
          onClick={toggleVideoFull}
          className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-full hover:bg-black/60 transition z-50 cursor-pointer"
        >
          {isVideoFull ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      )}

      {/* CONTROLS */}
      {isInCall && !isVideoFull && (
        <div className="absolute bottom-6 flex items-center gap-3 bg-black/40 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10">
          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <button
            onClick={toggleScreenShare}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            {isScreenSharing ? (
              <MonitorOff size={18} />
            ) : (
              <ScreenShare size={18} />
            )}
          </button>

          <button
            onClick={minimizeCall}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            <Minimize2 size={18} />
          </button>

          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition cursor-pointer"
          >
            <PhoneOff size={18} />
          </button>
        </div>
      )}

      {/* INCOMING CALL */}
      {isIncoming && !isInCall && (
        <div className="flex flex-col items-center gap-6">
          <img
            src={incomingCall.caller.avatar || "/default-avatar.png"}
            className="w-24 h-24 rounded-full border border-white/10"
          />

          <p className="text-sm text-white/80">
            {incomingCall.caller.firstName} {incomingCall.caller.lastName}
          </p>

          <div className="flex gap-10">
            <button
              onClick={rejectCall}
              className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              <X />
            </button>

            <button
              onClick={answerCall}
              className="p-4 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition"
            >
              <Phone />
            </button>
          </div>
        </div>
      )}

      {/* CALLING */}
      {isCalling && !isInCall && (
        <div className="flex flex-col items-center gap-6">
          <PhoneCall size={40} className="opacity-80" />
          <p className="text-white/70 text-sm">Calling...</p>

          <button
            onClick={endCall}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            <PhoneOff />
          </button>
        </div>
      )}
    </div>
  );
};
