"use client";
import React, { useEffect, useRef, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Image from "next/image";
import {
  CheckCircle,
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
  X,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion } from "motion/react";

function page() {
  const { userData } = useSelector((state: RootState) => state.user);
  const containerRef = useRef<HTMLDivElement>(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  const previewRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const { roomId } = useParams();
  const router = useRouter();

  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [reason, setReason] = useState("");

  const [showApprovelModal, setShowApprovelModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  useEffect(() => {
    if (joined) return;

    let localStream: MediaStream;
    const init = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setStream(localStream);
        if (previewRef.current) {
          previewRef.current.srcObject = localStream;
        }
      } catch (error) {
        console.log(error);
      }
    };

    init();
  }, []);

  const toggleCamera = () => {
    if (!stream) return;

    stream.getVideoTracks().forEach((track) => (track.enabled = !isCameraOn));
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    if (!stream) return;

    stream.getAudioTracks().forEach((track) => (track.enabled = !isMicOn));
    setIsMicOn(!isMicOn);
  };

  const handleApprove = async () => {
    setApproveLoading(true);
    try {
      const { data } = await axios.post("/api/admin/video-kyc/complete", {
        roomId,
        action: "approved",
      });
      console.log(data);
      setApproveLoading(false);
      router.push("/")
    } catch (error: any) {
      console.log(error.response.data.message ?? error);
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    try {
      const { data } = await axios.post("/api/admin/video-kyc/complete", {
        roomId,
        action: "rejected",
        reason,
      });
      console.log(data);
      setRejectLoading(false);
      router.push("/")
    } catch (error: any) {
      console.log(error.response.data.message ?? error);
      setRejectLoading(false);
    }
  };

  const startCall = async () => {
    if (!containerRef) return null;

    setLoading(true);

    const displayName =
      userData?.role === "admin"
        ? "Admin"
        : `${userData?.name} (${userData?.email})`;

    try {
      const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret!,
        roomId?.toString()!,
        userData?._id.toString()!,
        displayName,
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
        },
        showPreJoinView: false,
      });

      setJoined(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* Navbar logo Image */}
          <Image
            src={"/logo.jpeg"}
            alt="RYDEX"
            width={44}
            height={44}
            priority
          />
          <p className="text-xs text-gray-400">
            {userData?.role === "admin"
              ? "Admin Verification"
              : "Partner Video KYC"}
          </p>
        </div>

        {joined && (
          <div className="flex flex-wrap gap-3">
            {userData?.role === "admin" && (
              <>
                <button
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-sm flex items-center gap-2 cursor-pointer"
                  onClick={() => setShowApprovelModal(true)}
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm flex items-center gap-2 cursor-pointer"
                  onClick={() => setShowRejectionModal(true)}
                >
                  <XCircle /> Reject
                </button>
              </>
            )}

            <button
              className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full text-sm flex items-center gap-2 cursor-pointer"
              onClick={() => router.push("/")}
            >
              <PhoneOff size={16} /> End Call
            </button>
          </div>
        )}
      </div>

      {/* VIDEO PREVIEW SCREEN AND BUTTONS */}
      <div className="flex-1 relative">
        <div
          ref={containerRef}
          className={`absolute inset-0 ${joined ? "block" : "hidden"}`}
        />
        {!joined && (
          <div className="h-full flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <video
                  ref={previewRef}
                  autoPlay
                  playsInline
                  className="w-full h-[300px] sm:h-[400px] object-cover"
                />

                {!isCameraOn && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <VideoOff size={40} />
                  </div>
                )}
              </div>

              <div className="space-y-8 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl font-bold">
                  Secure Video KYC
                </h1>
                <div className="flex justify-center lg:justify-start gap-6">
                  <button
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition cursor-pointer ${isCameraOn ? "bg-white text-black" : "bg-white/10 border border-white/20"}`}
                    onClick={toggleCamera}
                  >
                    {isCameraOn ? <Video /> : <VideoOff />}
                  </button>
                  <button
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition cursor-pointer ${isMicOn ? "bg-white text-black" : "bg-white/10 border border-white/20"}`}
                    onClick={toggleMic}
                  >
                    {isMicOn ? <Mic /> : <MicOff />}
                  </button>
                </div>

                <button
                  onClick={startCall}
                  className="w-full bg-white text-black py-4 rounded-xl font-semibold cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Connecting..." : "Join Secure Call"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showApprovelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <button
                className="absolute top-4 right-4 text-gray-400 cursor-pointer"
                onClick={() => setShowApprovelModal(false)}
              >
                <X size={16} />
              </button>

              <h2 className="text-lg font-semibold mb-4">Confirm Approval</h2>

              <div className="flex gap-4">
                <button
                  className="flex-1 border rounded-xl py-2 cursor-pointer"
                  onClick={() => setShowApprovelModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-green-600 rounded-xl py-2 cursor-pointer"
                  disabled={approveLoading}
                  onClick={handleApprove}
                >
                  {approveLoading ? "Processing..." : "Yes, Approve"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative bg-[#111] w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <button
                className="absolute top-4 right-4 text-gray-400 cursor-pointer"
                onClick={() => setShowRejectionModal(false)}
              >
                <X size={16} />
              </button>

              <h2 className="text-lg font-semibold mb-4">Reject Partner</h2>

              <textarea
                className="w-full bg-white/10 border-white/20 rounded-xl p-3 mb-4 text-sm"
                value={reason}
                placeholder="Give Rejection Reason..."
                onChange={(e) => setReason(e.target.value)}
              />

              <div className="flex gap-4">
                <button
                  className="flex-1 border rounded-xl py-2 cursor-pointer"
                  onClick={() => setShowRejectionModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-red-600 rounded-xl py-2 cursor-pointer"
                  disabled={rejectLoading}
                  onClick={handleReject}
                >
                  {rejectLoading ? "Processing..." : "Reject"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default page;
