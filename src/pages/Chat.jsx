import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { FcVideoCall } from "react-icons/fc";
import { MdCallEnd } from "react-icons/md";
import PeerServices from "../services/peer";
import IncomingCall from "../components/IncommingCall";

export default function Chat() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  const [remotePeerId, setRemotePeerId] = useState(null); // Track remote peer ID
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const handleJoinedUsers = useCallback((usersList) => {
    console.log("Updated users list:", usersList);
    setJoinedUsers(usersList);
  }, []);

  // Handle incoming call
  const handleIncomingCall = useCallback(({ offer, id }) => {
    console.log("Incoming call from:", id);
    setIncomingCall({ offer, callerId: id });
  }, []);

  // Handle call accepted
  const handleCallAccepted = useCallback(async ({ answer, from }) => {
    await PeerServices.setRemoteDescription(answer);
    console.log("Call accepted");
  }, []);

  // Handle ICE candidates
  useEffect(() => {
    PeerServices.peer.addEventListener("track", (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    });
  
    PeerServices.peer.onicecandidate = (event) => {
      if (event.candidate && remotePeerId) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          targetUserId: remotePeerId,
        });
      }
    };
  }, [socket, remotePeerId]);

  // Socket listeners
  useEffect(() => {
  if (!socket.id) {
    console.log("No socket ID found, navigating back to home page");
    navigate("/");
  }

  socket.on("joined-users", handleJoinedUsers);
  socket.on("incoming-call", handleIncomingCall);
  socket.on("call-accepted", handleCallAccepted);

  socket.on("ice-candidate", async (candidate) => {
    console.log("Received ICE candidate:", candidate);
    await PeerServices.addIceCandidate(candidate);
  });

  socket.emit("get-users");

  return () => {
    socket.off("joined-users", handleJoinedUsers);
    socket.off("incoming-call", handleIncomingCall);
    socket.off("call-accepted", handleCallAccepted);
    socket.off("ice-candidate");
  };
}, [socket, handleJoinedUsers, navigate, handleIncomingCall, handleCallAccepted]);

  const toggleMute = () => setIsMuted((prev) => !prev);
  const toggleVideo = () => setIsVideoOn((prev) => !prev);

  const endCall = () => {
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setIncomingCall(null);
    setRemotePeerId(null);
    console.log("Call ended");
  };

  const startCall = useCallback(async (id) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => PeerServices.peer.addTrack(track, stream));
    const offer = await PeerServices.createOffer();
    socket.emit("start-call", { offer, id });
    setRemotePeerId(id); // Set remote peer ID
    console.log("Call started", offer);
  }, [socket]);

  const answerCall = async () => {
    if (!incomingCall) return;

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => PeerServices.peer.addTrack(track, stream));
    const answer = await PeerServices.createAnswer(incomingCall.offer);
    socket.emit("answer-call", { answer, to: incomingCall.callerId });
    setRemotePeerId(incomingCall.callerId); // Set remote peer ID
    setIncomingCall(null);
    console.log("Call answered");
  };

  return (
    socket.id && (
      <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Call Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Video Call</h2>
          <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full transform scale-x-[-1]" />
            <div className="w-full h-full bg-gray-700 animate-pulse" />
            <div className="absolute bottom-4 right-4 w-1/4 h-1/5 rounded-lg border-2 border-white overflow-hidden">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full" />
            </div>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <button onClick={toggleMute} className={`p-3 rounded-full ${isMuted ? "bg-red-500" : "bg-gray-200"} hover:bg-opacity-80 transition`} />
            <button onClick={toggleVideo} className={`p-3 rounded-full ${!isVideoOn ? "bg-red-500" : "bg-gray-200"} hover:bg-opacity-80 transition`} />
            <button onClick={endCall} className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-red-700 bg-red-500 transition">
              <MdCallEnd color="white" />
            </button>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 h-fit lg:sticky lg:top-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Online ({joinedUsers.length})</h2>
          <div className="space-y-3">
            {joinedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center space-x-3">
                  <div className="h-8 rounded-full flex items-center justify-center text-blue-500">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">
                    {user.username}
                    {socket.id === user.id && <span className="text-center text-xs text-blue-500 px-1 ml-1">{"("}You{")"}</span>}
                  </span>
                </div>
                {socket.id !== user.id && (
                  <button onClick={() => startCall(user.id)} className="p-2 rounded-lg cursor-pointer hover:bg-slate-300 transition">
                    <FcVideoCall color="white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incoming Call UI */}
      {incomingCall && <IncomingCall answerCall={answerCall} endCall={endCall} />}
    </div>
    )
  
  );
}