import { useCallback, useEffect, useRef, useState } from "react";
import { SOCKET_EVENTS } from "../services/socket.events";
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
  Camera,
  CameraOff,
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
  const cancelOutgoingCall = useCallStore((s) => s.cancelOutgoingCall);
  const socket = useCallStore((s) => s.socket);

  const remoteStream = useCallStore((s) => s.remoteStream);

  const toggleMute = useCallStore((s) => s.toggleMute);
  const toggleScreenShare = useCallStore((s) => s.toggleScreenShare);

  const isMuted = useCallStore((s) => s.isMuted);
  const isScreenSharing = useCallStore((s) => s.isScreenSharing);

  const isMinimized = useCallStore((s) => s.isMinimized);
  const minimizeCall = useCallStore((s) => s.minimizeCall);
  const restoreCall = useCallStore((s) => s.restoreCall);
  const outgoingCallUser = useCallStore((s) => s.outgoingCallUser);
  const activeCallUser = useCallStore((s) => s.activeCallUser);
  const toggleCamera = useCallStore((s) => s.toggleCamera);
  const isCameraOn = useCallStore((s) => s.isCameraOn);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const isIncoming = !!incomingCall;
  const isInCall = callAccepted;

  const [isVideoFull, setIsVideoFull] = useState(false);

  // DRAG POSITION
  const [dragPosition, setDragPosition] = useState({
    x: window.innerWidth - 280,
    y: window.innerHeight - 120,
  });

  const dragging = useRef(false);

  const offset = useRef({
    x: 0,
    y: 0,
  });

  const toggleVideoFull = () => {
    setIsVideoFull((prev) => !prev);
  };

  // DRAG MOVE
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;

    const width = 260;
    const height = 80;

    const x = Math.min(
      window.innerWidth - width,
      Math.max(0, e.clientX - offset.current.x),
    );

    const y = Math.min(
      window.innerHeight - height,
      Math.max(0, e.clientY - offset.current.y),
    );

    setDragPosition({ x, y });
  }, []);

  // DRAG END
  const handleMouseUp = useCallback(() => {
    dragging.current = false;

    document.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // DRAG START
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    dragging.current = true;

    offset.current = {
      x: e.clientX - dragPosition.x,
      y: e.clientY - dragPosition.y,
    };

    document.addEventListener("mousemove", handleMouseMove);

    document.addEventListener("mouseup", handleMouseUp, {
      once: true,
    });
  };

  // CLEANUP
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

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
    if (!remoteStream) return;

    // VIDEO
    if (videoRef.current) {
      videoRef.current.srcObject = remoteStream;

      videoRef.current.play().catch(() => {});
    }

    // AUDIO
    if (audioRef.current) {
      audioRef.current.srcObject = remoteStream;

      audioRef.current.muted = false;

      audioRef.current.volume = 1;

      audioRef.current.play().catch(console.error);
    }
  }, [remoteStream]);

  useEffect(() => {
    if (isIncoming && !isInCall) {
      startRingtone();
    } else {
      stopRingtone();
    }

    return () => stopRingtone();
  }, [isIncoming, isInCall]);

  useEffect(() => {
    if (isCalling && !isIncoming && !isInCall) {
      startCallingTone();
    } else {
      stopCallingTone();
    }

    return () => stopCallingTone();
  }, [isCalling, isIncoming, isInCall]);

  useEffect(() => {
    if (!socket) return;

    const onCancel = () => {
      useCallStore.getState().cleanup();
    };

    socket.on(SOCKET_EVENTS.CALL_CANCEL, onCancel);

    return () => {
      socket.off(SOCKET_EVENTS.CALL_CANCEL, onCancel);
    };
  }, [socket]);

  return (
    <>
      <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />

      {/* MINIMIZED */}
      {isMinimized && isInCall ? (
        <div
          style={{ left: dragPosition.x, top: dragPosition.y }}
          className="fixed z-50"
        >
          <div
            onMouseDown={handleMouseDown}
            className="bg-black/70 backdrop-blur-2xl border border-white/10 text-white px-5 py-3 rounded-full flex items-center gap-3 shadow-2xl cursor-move select-none"
          >
            <PhoneCall size={18} className="text-white/80" />
            <span className="text-sm font-medium text-white/80">
              Call in progress
            </span>

            <button
              onClick={restoreCall}
              className="hover:scale-110 transition text-white/70 hover:text-white cursor-pointer"
            >
              <Maximize2 size={20} />
            </button>

            <button
              onClick={endCall}
              className="hover:scale-110 transition text-red-400 cursor-pointer"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="fixed inset-0 z-50 flex items-center justify-center text-white overflow-hidden"
        >
          {/* BACKGROUND */}
          <div
            className="absolute inset-0 bg-center bg-cover scale-110 blur-sm"
            style={{ backgroundImage: "url('/userprofilecover.webp')" }}
          />

          {/* DARK + COLOR GLOW OVERLAY */}
          <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/70 to-black/90" />
          <div className="absolute inset-0 bg-blue-500/5" />

          {/* TOP USER INFO (REDESIGNED) */}
          {isInCall && activeCallUser && (
            <div className="absolute top-6 left-6 z-50 group">
              {/* avatar */}
              <div className="relative cursor-pointer">
                <img
                  src={activeCallUser.avatar || "/default-avatar.png"}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shadow-lg"
                />

                {/* online dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-black" />
              </div>

              {/* hover tooltip */}
              <div
                className="absolute left-1/2 -translate-x-1/2 mt-2 
      opacity-0 group-hover:opacity-100 
      transition pointer-events-none
      bg-black/70 backdrop-blur-xl 
      text-white text-sm px-3 py-1.5 
      rounded-lg border border-white/10 shadow-xl
      whitespace-nowrap"
              >
                {activeCallUser.firstName} {activeCallUser.lastName}
              </div>
            </div>
          )}

          {/* VIDEO */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={
              isVideoFull || isScreenSharing
                ? "absolute inset-0 w-full h-full object-contain"
                : "absolute top-6 right-6 w-80 h-52 rounded-3xl border border-white/10 shadow-2xl object-cover"
            }
          />

          {/* FULLSCREEN */}
          {isInCall && (
            <button
              onClick={toggleVideoFull}
              className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl border border-white/10 p-3 rounded-full hover:bg-white/20 transition cursor-pointer"
            >
              {isVideoFull ? <Minimize size={22} /> : <Maximize size={22} />}
            </button>
          )}

          {/* CONTROLS (IMPROVED COLORS + BIGGER ICONS) */}
          {isInCall && !isVideoFull && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-3xl px-5 py-3 rounded-full border border-white/10 shadow-2xl">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition cursor-pointer ${
                  isMuted
                    ? "bg-red-500/25 text-red-400"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
              >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>

              <button
                onClick={toggleCamera}
                className={`p-4 rounded-full transition cursor-pointer ${
                  !isCameraOn
                    ? "bg-red-500/25 text-red-400"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
              >
                {isCameraOn ? <Camera size={22} /> : <CameraOff size={22} />}
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-4 rounded-full transition cursor-pointer ${
                  isScreenSharing
                    ? "bg-blue-500/25 text-blue-400"
                    : "bg-gray-600 hover:bg-gray-500"
                }`}
              >
                {isScreenSharing ? (
                  <MonitorOff size={22} />
                ) : (
                  <ScreenShare size={22} />
                )}
              </button>

              <div className="w-px h-7 bg-gray-200 mx-1" />

              <button
                onClick={minimizeCall}
                className="p-4 rounded-full bg-gray-600 hover:bg-gray-500 transition cursor-pointer"
              >
                <Minimize2 size={22} />
              </button>

              <button
                onClick={endCall}
                className="p-4 rounded-full bg-red-500/25 text-red-400 hover:bg-red-500/35 transition shadow-lg cursor-pointer"
              >
                <PhoneOff size={22} />
              </button>
            </div>
          )}

          {/* INCOMING */}
          {isIncoming && !isInCall && (
            <div className="flex flex-col items-center gap-6 z-10">
              <img
                src={incomingCall.caller.avatar || "/default-avatar.png"}
                className="w-28 h-28 rounded-full border border-white/20 shadow-2xl"
              />

              <p className="text-xl font-semibold">
                {incomingCall.caller.firstName} {incomingCall.caller.lastName}
              </p>

              <p className="text-white/60">Incoming call</p>

              <div className="flex gap-10 mt-2">
                <button
                  onClick={rejectCall}
                  className="p-5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
                >
                  <X size={22} />
                </button>

                <button
                  onClick={answerCall}
                  className="p-5 rounded-full bg-green-500/25 text-green-400 hover:bg-green-500/35 transition cursor-pointer"
                >
                  <Phone size={22} />
                </button>
              </div>
            </div>
          )}

          {/* CALLING */}
          {isCalling && !isInCall && (
            <div className="flex flex-col items-center gap-6 z-10">
              <img
                src={outgoingCallUser?.avatar || "/default-avatar.png"}
                className="w-28 h-28 rounded-full border border-white/20 shadow-2xl"
              />

              <p className="text-xl font-semibold">
                {outgoingCallUser?.firstName} {outgoingCallUser?.lastName}
              </p>

              <p className="text-white/60">Calling...</p>

              <button
                onClick={cancelOutgoingCall}
                className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <PhoneOff size={22} />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
