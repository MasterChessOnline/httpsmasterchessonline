import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Minimal P2P voice chat over WebRTC, signalled through Supabase Realtime
 * broadcast on a per-room channel. Designed for 2-party rooms (online games).
 * Uses a public Google STUN server — sufficient for most home networks.
 */
const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

type SignalMsg =
  | { kind: "hello"; from: string }
  | { kind: "offer"; from: string; sdp: RTCSessionDescriptionInit }
  | { kind: "answer"; from: string; sdp: RTCSessionDescriptionInit }
  | { kind: "ice"; from: string; candidate: RTCIceCandidateInit }
  | { kind: "bye"; from: string };

export function useVoiceChat(roomId: string | null, userId: string | null) {
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [active, setActive] = useState(false);
  const [remoteSpeaking, setRemoteSpeaking] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const politeRef = useRef<boolean>(false);
  const makingOfferRef = useRef<boolean>(false);
  const ignoreOfferRef = useRef<boolean>(false);

  const send = useCallback((msg: SignalMsg) => {
    channelRef.current?.send({ type: "broadcast", event: "voice", payload: msg });
  }, []);

  const cleanup = useCallback(() => {
    try { pcRef.current?.getSenders().forEach((s) => s.track?.stop()); } catch {}
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    if (channelRef.current) {
      try { send({ kind: "bye", from: userId ?? "" }); } catch {}
      try { supabase.removeChannel(channelRef.current); } catch {}
      channelRef.current = null;
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    setConnected(false);
    setActive(false);
    setRemoteSpeaking(false);
  }, [send, userId]);

  const ensurePeer = useCallback(() => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pc.onicecandidate = (e) => {
      if (e.candidate && userId) send({ kind: "ice", from: userId, candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e) => {
      const [stream] = e.streams;
      if (remoteAudioRef.current && stream) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch(() => {});
      }
      setConnected(true);
    };
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === "connected") setConnected(true);
      if (s === "failed" || s === "disconnected" || s === "closed") setConnected(false);
    };
    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current = true;
        await pc.setLocalDescription();
        if (userId && pc.localDescription) send({ kind: "offer", from: userId, sdp: pc.localDescription });
      } catch (err) {
        console.error("[voice] negotiation", err);
      } finally {
        makingOfferRef.current = false;
      }
    };
    pcRef.current = pc;
    return pc;
  }, [send, userId]);

  const start = useCallback(async () => {
    if (!roomId || !userId || active) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      const pc = ensurePeer();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const ch = supabase
        .channel(`voice-${roomId}`, { config: { broadcast: { self: false } } })
        .on("broadcast", { event: "voice" }, async ({ payload }: { payload: SignalMsg }) => {
          if (!payload || payload.from === userId) return;
          // Determine politeness deterministically by ID comparison
          politeRef.current = userId < payload.from;
          const peer = ensurePeer();
          try {
            if (payload.kind === "hello") {
              // The other side announced — make sure we have a local stream attached
              // and renegotiate (onnegotiationneeded will fire).
              if (!peer.getSenders().some((s) => s.track)) {
                localStreamRef.current?.getTracks().forEach((t) => peer.addTrack(t, localStreamRef.current!));
              }
            } else if (payload.kind === "offer") {
              const offerCollision = makingOfferRef.current || peer.signalingState !== "stable";
              ignoreOfferRef.current = !politeRef.current && offerCollision;
              if (ignoreOfferRef.current) return;
              await peer.setRemoteDescription(payload.sdp);
              await peer.setLocalDescription();
              if (peer.localDescription) send({ kind: "answer", from: userId, sdp: peer.localDescription });
            } else if (payload.kind === "answer") {
              if (peer.signalingState === "have-local-offer") {
                await peer.setRemoteDescription(payload.sdp);
              }
            } else if (payload.kind === "ice") {
              try { await peer.addIceCandidate(payload.candidate); } catch (err) {
                if (!ignoreOfferRef.current) console.warn("[voice] ice add failed", err);
              }
            } else if (payload.kind === "bye") {
              cleanup();
            }
          } catch (err) {
            console.error("[voice] signal handler", err);
          }
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") send({ kind: "hello", from: userId });
        });
      channelRef.current = ch;
      setActive(true);
    } catch (err: any) {
      console.error("[voice] start failed", err);
      cleanup();
      throw err;
    }
  }, [roomId, userId, active, ensurePeer, send, cleanup]);

  const stop = useCallback(() => cleanup(), [cleanup]);

  const toggleMic = useCallback(() => {
    const enabled = !micOn;
    setMicOn(enabled);
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = enabled));
  }, [micOn]);

  useEffect(() => () => cleanup(), [cleanup]);

  return { active, connected, micOn, remoteSpeaking, start, stop, toggleMic, remoteAudioRef };
}
