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

  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => Promise<void>;

  minimizeCall: () => void;
  restoreCall: () => void;

  cleanup: () => void;
};

export const useCallStore = create<CallState>((set, get) => ({
  socket: null,

  incomingCall: null,
  callAccepted: false,
  isCalling: false,

  peer: null,
  stream: null,
  remoteStream: null,

  activeCallUserId: null,

  isMuted: false,
  isScreenSharing: false,

  isMinimized: false,

  bindSocket: (socket) => {
    set({ socket });

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
      if (!peer) return;

      peer.signal(answer);

      set({
        callAccepted: true,
        isCalling: false,
      });
    });

    socket.on(SOCKET_EVENTS.CALL_REJECT, () => get().cleanup());
    socket.on(SOCKET_EVENTS.CALL_END, () => get().cleanup());
  },

  startCall: async (receiverId, currentUser) => {
    const socket = get().socket;
    if (!socket) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    stream.getAudioTracks().forEach((t) => (t.enabled = true));
    stream.getVideoTracks().forEach((t) => (t.enabled = true));

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

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    stream.getAudioTracks().forEach((t) => (t.enabled = true));
    stream.getVideoTracks().forEach((t) => (t.enabled = true));

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
    set({ isMuted: !isMuted });
  },

  toggleCamera: () => {
    const { stream } = get();
    if (!stream) return;

    const videoTrack = stream.getVideoTracks()[0];
    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
  },

  toggleScreenShare: async () => {
    const { peer, stream, isScreenSharing } = get();
    if (!peer || !stream) return;
    // eslint-disable-next-line
    const pc = (peer as any)._pc as RTCPeerConnection;
    const sender = pc.getSenders().find((s) => s.track?.kind === "video");
    if (!sender) return;

    if (isScreenSharing) {
      const camTrack = stream.getVideoTracks()[0];
      if (camTrack) await sender.replaceTrack(camTrack);

      set({ isScreenSharing: false });
      return;
    }

    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    const screenTrack = screenStream.getVideoTracks()[0];
    await sender.replaceTrack(screenTrack);

    screenTrack.onended = async () => {
      const camTrack = stream.getVideoTracks()[0];
      if (camTrack) await sender.replaceTrack(camTrack);
      set({ isScreenSharing: false });
    };

    set({ isScreenSharing: true });
  },

  minimizeCall: () => {
    const { stream } = get();

    stream?.getVideoTracks().forEach((t) => (t.enabled = false));

    set({ isMinimized: true });
  },

  restoreCall: () => {
    const { stream } = get();

    stream?.getAudioTracks().forEach((t) => (t.enabled = true));
    stream?.getVideoTracks().forEach((t) => (t.enabled = true));

    set({ isMinimized: false });
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
    stream?.getTracks().forEach((t) => t.stop());

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
