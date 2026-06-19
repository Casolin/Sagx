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
  cameraStream: MediaStream | null;

  activeCallUserId: string | null;

  outgoingCallUser: CallUser | null;
  activeCallUser: CallUser | null;

  isMuted: boolean;
  screenStream: MediaStream | null;
  isScreenSharing: boolean;

  isCameraOn: boolean;
  toggleCamera: () => Promise<void>;

  isMinimized: boolean;

  bindSocket: (socket: Socket) => void;

  startCall: (receiver: CallUser, currentUser: CallUser) => Promise<void>;

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
  isCameraOn: false,
  cameraStream: null,

  callBusyOpen: false,

  setCallBusyOpen: (v) => set({ callBusyOpen: v }),

  activeCallUserId: null,
  outgoingCallUser: null,
  activeCallUser: null,
  listenersBound: false,

  isMuted: false,
  isScreenSharing: false,
  screenStream: null,

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

  startCall: async (receiver, currentUser) => {
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
        to: receiver._id,
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
      activeCallUserId: receiver._id,
      activeCallUser: receiver,
      outgoingCallUser: receiver,
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
      activeCallUser: incomingCall.caller,
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

    // eslint-disable-next-line
    const pc = (peer as any)._pc as RTCPeerConnection;

    const sender = pc.getSenders().find((s) => s.track?.kind === "video");

    const audioSender = pc.getSenders().find((s) => s.track?.kind === "audio");

    if (!sender) return;

    const dummyTrack = stream.getVideoTracks()[0];

    if (isScreenSharing) {
      const { screenStream } = get();

      screenStream?.getTracks().forEach((track) => {
        track.stop();
      });
      if (dummyTrack) {
        await sender.replaceTrack(dummyTrack);
      }

      const originalAudioTrack = stream.getAudioTracks()[0];

      if (audioSender && originalAudioTrack) {
        await audioSender.replaceTrack(originalAudioTrack);
      }

      set({
        isScreenSharing: false,
      });

      return;
    }

    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    set({
      screenStream,
    });

    const screenTrack = screenStream.getVideoTracks()[0];
    const screenAudioTrack = screenStream.getAudioTracks()[0];

    await sender.replaceTrack(screenTrack);
    const audioContext = new AudioContext();

    if (audioSender) {
      const micTrack = stream.getAudioTracks()[0];

      const destination = audioContext.createMediaStreamDestination();

      if (micTrack) {
        const micStream = new MediaStream([micTrack]);

        const micSource = audioContext.createMediaStreamSource(micStream);

        micSource.connect(destination);
      }

      if (screenAudioTrack) {
        const screenAudioStream = new MediaStream([screenAudioTrack]);

        const screenSource =
          audioContext.createMediaStreamSource(screenAudioStream);

        screenSource.connect(destination);
      }

      const mixedAudioTrack = destination.stream.getAudioTracks()[0];

      await audioSender.replaceTrack(mixedAudioTrack);
    }

    screenTrack.onended = async () => {
      const { screenStream } = get();

      screenStream?.getTracks().forEach((track) => {
        track.stop();
      });
      const fallbackTrack = stream.getVideoTracks()[0];

      if (fallbackTrack) {
        await sender.replaceTrack(fallbackTrack);
      }

      const originalAudioTrack = stream.getAudioTracks()[0];

      if (audioSender && originalAudioTrack) {
        await audioSender.replaceTrack(originalAudioTrack);
      }

      await audioContext.close();

      set({
        isScreenSharing: false,
        screenStream: null,
      });
    };

    set({
      isScreenSharing: true,
    });
  },

  toggleCamera: async () => {
    const { peer, stream, isCameraOn } = get();

    if (!peer || !stream) return;

    const pc = (peer as Peer.Instance & { _pc: RTCPeerConnection })._pc;

    const sender = pc.getSenders().find((s) => s.track?.kind === "video");

    if (!sender) return;

    if (!isCameraOn) {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      const cameraTrack = cameraStream.getVideoTracks()[0];

      await sender.replaceTrack(cameraTrack);

      cameraTrack.onended = async () => {
        const dummyTrack = stream.getVideoTracks()[0];

        if (dummyTrack) {
          await sender.replaceTrack(dummyTrack);
        }

        set({
          isCameraOn: false,
        });
      };

      set({
        isCameraOn: true,
        cameraStream,
      });
    } else {
      const { cameraStream } = get();

      cameraStream?.getTracks().forEach((track) => {
        track.stop();
      });

      const dummyTrack = stream.getVideoTracks()[0];

      if (dummyTrack) {
        await sender.replaceTrack(dummyTrack);
      }

      set({
        isCameraOn: false,
        cameraStream: null,
      });
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
    const { peer, stream, cameraStream, screenStream } = get();

    peer?.destroy();

    stream?.getTracks().forEach((track) => {
      track.stop();
    });

    screenStream?.getTracks().forEach((track) => track.stop());

    cameraStream?.getTracks().forEach((track) => {
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
      outgoingCallUser: null,
      isMuted: false,
      isCameraOn: false,
      cameraStream: null,
      isScreenSharing: false,
      screenStream: null,
      isMinimized: false,
    });
  },
}));
