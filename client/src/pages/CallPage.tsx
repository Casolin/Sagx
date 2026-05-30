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
            className="
            group
            flex items-center gap-3
            px-4 py-3
            rounded-3xl
            bg-white/10
            backdrop-blur-2xl
            border border-white/10
            shadow-[0_8px_40px_rgba(0,0,0,.4)]
            text-white
            cursor-move
            select-none
          "
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-50" />
              <div className="relative w-3 h-3 rounded-full bg-green-400 animate-pulse" />
            </div>

            <div>
              <p className="text-sm font-medium">Call in progress</p>
              <p className="text-xs text-white/50">Connected</p>
            </div>

            <button
              onClick={restoreCall}
              className="ml-2 p-2 rounded-xl hover:bg-white/10 transition cursor-pointer"
            >
              <Maximize2 size={16} />
            </button>

            <button
              onClick={endCall}
              className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            >
              <PhoneOff size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="
          fixed inset-0
          overflow-hidden
          flex items-center justify-center
          bg-black
          text-white
          z-50
        "
        >
          {/* BACKGROUND */}
          <div className="absolute inset-0">
            <div className="absolute -top-40 -left-40 w-125 h-125 rounded-full bg-violet-600/20 blur-[180px]" />
            <div className="absolute -bottom-40 -right-40 w-125 h-125 rounded-full bg-cyan-500/20 blur-[180px]" />
            <div className="absolute top-1/2 left-1/2 w-100 h-100 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-[160px]" />
          </div>

          {/* VIDEO */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={
              isVideoFull || isScreenSharing
                ? `
                absolute inset-0
                w-full h-full
                object-contain
                bg-black
              `
                : `
                absolute
                top-6
                right-6
                w-80
                h-52
                rounded-[28px]
                border border-white/10
                shadow-2xl
                bg-black/60
                backdrop-blur-xl
                object-cover
              `
            }
          />

          {/* FULLSCREEN BUTTON */}
          {isInCall && (
            <button
              onClick={toggleVideoFull}
              className="
              absolute top-6 right-6 z-50
              p-3
              rounded-full
              bg-white/10
              backdrop-blur-xl
              border border-white/10
              hover:bg-white/20
              transition
              cursor-pointer
            "
            >
              {isVideoFull ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          )}

          {/* STATUS */}
          {isInCall && (
            <div
              className="
              absolute
              top-6
              left-6
              px-5
              py-3
              rounded-3xl
              bg-white/10
              backdrop-blur-2xl
              border border-white/10
            "
            >
              <p className="font-medium">Connected</p>
              <p className="text-xs text-white/60">Voice Call</p>
            </div>
          )}

          {/* CONTROLS */}
          {isInCall && !isVideoFull && (
            <div
              className="
              absolute bottom-8
              flex items-center gap-3
              px-4 py-3
              rounded-full
              bg-white/10
              backdrop-blur-2xl
              border border-white/10
              shadow-2xl
            "
            >
              <button
                onClick={toggleMute}
                className="
                p-4
                rounded-full
                bg-white/10
                hover:bg-white/20
                hover:scale-110
                active:scale-95
                transition-all
                cursor-pointer
              "
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button
                onClick={toggleScreenShare}
                className="
                p-4
                rounded-full
                bg-white/10
                hover:bg-white/20
                hover:scale-110
                active:scale-95
                transition-all
                cursor-pointer
              "
              >
                {isScreenSharing ? (
                  <MonitorOff size={20} />
                ) : (
                  <ScreenShare size={20} />
                )}
              </button>

              <button
                onClick={minimizeCall}
                className="
                p-4
                rounded-full
                bg-white/10
                hover:bg-white/20
                hover:scale-110
                active:scale-95
                transition-all
                cursor-pointer
              "
              >
                <Minimize2 size={20} />
              </button>

              <button
                onClick={endCall}
                className="
                p-4
                rounded-full
                bg-red-500
                hover:bg-red-600
                hover:scale-110
                active:scale-95
                shadow-lg
                shadow-red-500/30
                transition-all
                cursor-pointer
              "
              >
                <PhoneOff size={20} />
              </button>
            </div>
          )}

          {/* INCOMING */}
          {isIncoming && !isInCall && (
            <div className="relative flex flex-col items-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-72 rounded-full bg-violet-500/20 blur-[120px]" />
              </div>

              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-green-500/30 blur-3xl animate-pulse" />

                <img
                  src={incomingCall.caller.avatar || "/default-avatar.png"}
                  className="
                  relative
                  w-40 h-40
                  rounded-full
                  object-cover
                  border-4 border-white/10
                  shadow-2xl
                "
                />
              </div>

              <h2 className="mt-8 text-4xl font-bold">
                {incomingCall.caller.firstName} {incomingCall.caller.lastName}
              </h2>

              <p className="mt-3 text-white/60 tracking-wide">Incoming Call</p>

              <div className="flex gap-8 mt-10">
                <button
                  onClick={rejectCall}
                  className="
                  w-16 h-16
                  rounded-full
                  bg-red-500
                  hover:bg-red-600
                  hover:scale-110
                  transition-all
                  flex items-center justify-center
                  cursor-pointer
                "
                >
                  <X />
                </button>

                <button
                  onClick={answerCall}
                  className="
                  w-20 h-20
                  rounded-full
                  bg-green-500
                  hover:bg-green-600
                  hover:scale-110
                  transition-all
                  flex items-center justify-center
                  shadow-[0_0_40px_rgba(34,197,94,.5)]
                  animate-pulse
                  cursor-pointer
                "
                >
                  <Phone />
                </button>
              </div>
            </div>
          )}

          {/* CALLING */}
          {isCalling && !isInCall && (
            <div className="relative flex flex-col items-center">
              <div className="absolute w-72 h-72 rounded-full bg-violet-500/20 blur-[120px]" />

              <div
                className="
                relative
                w-40 h-40
                rounded-full
                bg-white/10
                backdrop-blur-2xl
                border border-white/10
                flex items-center justify-center
              "
              >
                <PhoneCall size={56} />
              </div>

              <h2 className="mt-8 text-4xl font-bold">Calling...</h2>

              <p className="mt-3 text-white/60">Waiting for answer</p>

              <button
                onClick={() => {
                  cancelOutgoingCall();
                }}
                className="
                mt-10
                w-16 h-16
                rounded-full
                bg-red-500
                hover:bg-red-600
                hover:scale-110
                transition-all
                flex items-center justify-center
                cursor-pointer
              "
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
