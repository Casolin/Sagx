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
          style={{
            left: dragPosition.x,
            top: dragPosition.y,
          }}
          className="fixed z-50"
        >
          <div
            onMouseDown={handleMouseDown}
            className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 text-white px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl cursor-move select-none"
          >
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
      ) : (
        <div
          ref={containerRef}
          className="fixed inset-0 bg-linear-to-b from-gray-950 via-gray-900 to-black text-white flex items-center justify-center z-50"
        >
          {/* VIDEO */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={
              isVideoFull || isScreenSharing
                ? "absolute inset-0 w-full h-full object-contain bg-black"
                : "absolute top-6 right-6 w-72 h-48 bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 object-cover"
            }
          />

          {/* FULLSCREEN BUTTON */}
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

              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Incoming call
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
                  className="p-4 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 transition cursor-pointer"
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
                onClick={() => {
                  cancelOutgoingCall();
                }}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
              >
                <PhoneOff />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
