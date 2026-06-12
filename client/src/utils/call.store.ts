import { create } from "zustand";
import Peer from "simple-peer";
import { Socket } from "socket.io-client";
import { SOCKET_EVENTS } from "../services/socket.events";

type CallUser = {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
};

type IncomingCall = {
  offer: Peer.SignalData;
  caller: CallUser;
};

type CallState = {
  socket: Socket | null;

  incomingCall: IncomingCall | null;
  callAccepted: boolean;
  isCalling: boolean;

  callBusyOpen: boolean;
  setCallBusyOpen: (v: boolean) => void;

  cancelOutgoingCall: () => void;

  peer: Peer.Instance | null;

  stream: MediaStream | null;
  remoteStream: MediaStream | null;

  activeCallUserId: string | null;

  isMuted: boolean;
  isScreenSharing: boolean;

  isMinimized: boolean;

  bindSocket: (socket: Socket) => void;

  startCall: (receiverId: string, currentUser: CallUser) => Promise<void>;

  answerCall: () => Promise<void>;

  rejectCall: () => void;
  endCall: () => void;

  listenersBound: boolean;

  toggleMute: () => void;
  toggleScreenShare: () => Promise<void>;

  minimizeCall: () => void;
  restoreCall: () => void;

  cleanup: () => void;
};

const createDummyVideoTrack = () => {
  const canvas = document.createElement("canvas");

  canvas.width = 640;
  canvas.height = 480;

  const ctx = canvas.getContext("2d");

  const draw = () => {
    if (!ctx) return;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(draw);
  };

  draw();

  const stream = canvas.captureStream(30);

  return {
    track: stream.getVideoTracks()[0],
    stream,
  };
};

export const useCallStore = create<CallState>((set, get) => ({
  socket: null,

  incomingCall: null,
  callAccepted: false,
  isCalling: false,

  peer: null,
  stream: null,
  remoteStream: null,

  callBusyOpen: false,

  setCallBusyOpen: (v) => set({ callBusyOpen: v }),

  activeCallUserId: null,
  listenersBound: false,

  isMuted: false,
  isScreenSharing: false,

  isMinimized: false,

  bindSocket: (socket) => {
    if (get().listenersBound) {
      set({ socket });
      return;
    }

    set({
      socket,
      listenersBound: true,
    });

    socket.off(SOCKET_EVENTS.CALL_OFFER);
    socket.off(SOCKET_EVENTS.CALL_ANSWER);
    socket.off(SOCKET_EVENTS.CALL_REJECT);
    socket.off(SOCKET_EVENTS.CALL_END);
    socket.off(SOCKET_EVENTS.CALL_CANCEL);
    socket.off("CALL_BUSY");

    socket.on(SOCKET_EVENTS.CALL_OFFER, (data) => {
      set({
        incomingCall: data,
        isCalling: false,
        callAccepted: false,
        isMinimized: false,
      });
    });

    socket.on(SOCKET_EVENTS.CALL_ANSWER, ({ answer }) => {
      const peer = get().peer;

      if (!peer || peer.destroyed) return;

      peer.signal(answer);

      set({
        callAccepted: true,
        isCalling: false,
      });
    });

    socket.on(SOCKET_EVENTS.CALL_REJECT, () => {
      get().cleanup();
    });

    socket.on(SOCKET_EVENTS.CALL_END, () => {
      get().cleanup();
    });

    socket.on("CALL_BUSY", () => {
      set({
        callBusyOpen: true,
      });

      get().cleanup();
    });

    socket.on(SOCKET_EVENTS.CALL_CANCEL, () => {
      get().cleanup();
    });
  },

  startCall: async (receiverId, currentUser) => {
    const socket = get().socket;

    if (!socket) return;

    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const dummy = createDummyVideoTrack();

    const stream = new MediaStream([
      ...audioStream.getAudioTracks(),
      dummy.track,
    ]);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (offer) => {
      socket.emit(SOCKET_EVENTS.CALL_OFFER, {
        to: receiverId,
        offer,
        caller: currentUser,
      });
    });

    peer.on("stream", (remoteStream) => {
      set({ remoteStream });
    });

    set({
      peer,
      stream,
      isCalling: true,
      activeCallUserId: receiverId,
      isMuted: false,
      isScreenSharing: false,
    });
  },

  answerCall: async () => {
    const { incomingCall, socket } = get();

    if (!incomingCall || !socket) return;

    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const dummy = createDummyVideoTrack();

    const stream = new MediaStream([
      ...audioStream.getAudioTracks(),
      dummy.track,
    ]);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.signal(incomingCall.offer);

    peer.on("signal", (answer) => {
      socket.emit(SOCKET_EVENTS.CALL_ANSWER, {
        to: incomingCall.caller._id,
        answer,
      });
    });

    peer.on("stream", (remoteStream) => {
      set({ remoteStream });
    });

    set({
      peer,
      stream,
      incomingCall: null,
      callAccepted: true,
      isCalling: false,
      activeCallUserId: incomingCall.caller._id,
      isMuted: false,
      isScreenSharing: false,
    });
  },

  toggleMute: () => {
    const { stream, isMuted } = get();

    if (!stream) return;

    const audioTrack = stream.getAudioTracks()[0];

    if (!audioTrack) return;

    audioTrack.enabled = isMuted;

    set({
      isMuted: !isMuted,
    });
  },

  toggleScreenShare: async () => {
    const { peer, stream, isScreenSharing } = get();

    if (!peer || !stream) return;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && !navigator.mediaDevices?.getDisplayMedia) {
      alert("Screen sharing is not supported on this mobile browser");
      return;
    }

    //eslint-disable-next-line
    const pc = (peer as any)._pc as RTCPeerConnection;

    const senders = pc.getSenders();

    const videoSender = senders.find(
      (s) => s.track && s.track.kind === "video",
    );

    const audioSender = senders.find(
      (s) => s.track && s.track.kind === "audio",
    );

    if (!videoSender) return;

    const dummyTrack = stream.getVideoTracks()[0];

    // STOP SCREEN SHARE
    if (isScreenSharing) {
      if (dummyTrack) {
        await videoSender.replaceTrack(dummyTrack);
      }

      set({ isScreenSharing: false });
      return;
    }

    // GET SCREEN STREAM (Electron or Browser)
    let screenStream: MediaStream;

    //eslint-disable-next-line
    const electronAPI = (window as any).electronAPI;

    try {
      if (electronAPI?.getScreenStream) {
        screenStream = await electronAPI.getScreenStream();
      } else {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      }

      const screenTrack = screenStream.getVideoTracks()[0];

      if (!screenTrack) return;

      await videoSender.replaceTrack(screenTrack);

      // optional audio merge (keep your logic, but safe guard)
      if (audioSender) {
        const micTrack = stream.getAudioTracks()[0];

        if (micTrack) {
          await audioSender.replaceTrack(micTrack);
        }
      }

      screenTrack.onended = async () => {
        const fallback = stream.getVideoTracks()[0];

        if (fallback) {
          await videoSender.replaceTrack(fallback);
        }

        set({ isScreenSharing: false });
      };

      set({ isScreenSharing: true });
    } catch (err) {
      console.log("SCREEN SHARE ERROR:", err);
    }
  },

  cancelOutgoingCall: () => {
    const { socket, activeCallUserId } = get();

    if (socket && activeCallUserId) {
      socket.emit(SOCKET_EVENTS.CALL_CANCEL, {
        to: activeCallUserId,
      });
    }

    get().cleanup();
  },

  minimizeCall: () => {
    set({
      isMinimized: true,
    });
  },

  restoreCall: () => {
    set({
      isMinimized: false,
    });
  },

  rejectCall: () => {
    const { socket, incomingCall } = get();

    if (!socket || !incomingCall) return;

    socket.emit(SOCKET_EVENTS.CALL_REJECT, {
      to: incomingCall.caller._id,
    });

    get().cleanup();
  },

  endCall: () => {
    const { socket, activeCallUserId } = get();

    if (socket && activeCallUserId) {
      socket.emit(SOCKET_EVENTS.CALL_END, {
        to: activeCallUserId,
      });
    }

    get().cleanup();
  },

  cleanup: () => {
    const { peer, stream } = get();

    peer?.destroy();

    stream?.getTracks().forEach((track) => {
      track.stop();
    });

    set({
      peer: null,
      stream: null,
      remoteStream: null,
      incomingCall: null,
      callAccepted: false,
      isCalling: false,
      activeCallUserId: null,
      isMuted: false,
      isScreenSharing: false,
      isMinimized: false,
    });
  },
}));
