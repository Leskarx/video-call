import  { useEffect, useState, useCallback,useRef } from "react";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { FcVideoCall } from "react-icons/fc";
import { MdCallEnd } from "react-icons/md";

export default function Chat() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [joinedUsers, setJoinedUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const localVideoRef=useRef(null)



  // Function to update joined users
  const handleJoinedUsers = useCallback((usersList) => {
    console.log("Updated users list:", usersList);
    setJoinedUsers(usersList);
  }, []);

  useEffect(() => {
    if(!socket.id){
      console.log("No socket ID found, navigating back to home page");
      navigate("/")
    
    } ;
    console.log("Chat component mounted");

    // Ensure socket listener is active
    socket.on("joined-users", handleJoinedUsers);

    // 🔥 Request the latest user list manually on mount
    socket.emit("get-users");

    return () => {
      console.log("Chat component cleanup");
      socket.off("joined-users", handleJoinedUsers);
    };
  }, [socket, handleJoinedUsers, navigate]);

  // Video call controls
  const toggleMute = () => setIsMuted((prev) => !prev);
  const toggleVideo = () => setIsVideoOn((prev) => !prev);
  const endCall = () =>{
    // stop the video stream
    localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    console.log("Call ended");


  }
// start call
const startCall=useCallback(async(data)=>{
  const steam=await navigator.mediaDevices.getUserMedia(
    {video:true,audio:true}
  )
  if(localVideoRef.current){
    localVideoRef.current.srcObject=steam
  }
  console.log("Call started",steam)
},[])

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Call Section */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Video Call</h2>
          {/* remote video section */}
          <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video">
           
            <div className="w-full h-full bg-gray-700 animate-pulse" />
            {/* local video section */}
            <div className="absolute bottom-4 right-4 w-1/4 h-1/5 rounded-lg border-2 border-white overflow-hidden">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full"/>
              <div className="w-full h-full bg-gray-600 animate-pulse" />
            </div>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <button onClick={toggleMute} className={`p-3 rounded-full ${isMuted ? "bg-red-500" : "bg-gray-200"} hover:bg-opacity-80 transition`} />
            <button onClick={toggleVideo} className={`p-3 rounded-full ${!isVideoOn ? "bg-red-500" : "bg-gray-200"} hover:bg-opacity-80 transition`} />
            <button onClick={endCall} className=" w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-red-700 bg-red-500 hover:bg-red-600 transition" >
            <MdCallEnd color="white" />
            
            </button>
          </div>
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 h-fit lg:sticky lg:top-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Online ({joinedUsers.length})
          </h2>
          <div className="space-y-3">
            {joinedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center space-x-3">
                  <div className="h-8 rounded-full flex items-center justify-center text-blue-500">
                    {user.username.charAt(0).toUpperCase()}
                   
                  </div>
                  <span className="font-medium">{user.username}
                  {socket.id === user.id && <span className=" text-center text-xs text-blue-500  px-1 ml-1">{"("}You{")"}</span>}

                  </span>
                </div>
               {
                socket.id!==user.id &&  <button onClick={()=>{
                  startCall(user.username)
                }} className="p-2 rounded-lg cursor-pointer hover:bg-slate-300 transition">
                <FcVideoCall color="white"/>
              </button>
               }
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
