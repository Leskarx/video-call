import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

export default function Home() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (socket.connected) {
      socket.disconnect();
    }
  }, [socket]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setLoading(true);
    
    setUsername("");

    if (!socket.connected) {
      try {
        socket.connect();

        socket.on("connect", () => {
          console.log("Socket connected:", socket.id);
          socket.emit("user-joined", { username });
          navigate("/chat", { state: { username } });
          setLoading(false);
        });

        socket.on("connect_error", (err) => {
          console.error("Connection error:", err.message);
          setLoading(false);
        });
      } catch (err) {
        console.error("Error connecting to socket:", err);
        setLoading(false);
      }
    }
  }, [socket, username, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Main Card Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to Video Chat
          </h1>
          <p className="text-gray-500">
            Enter your username to start connecting
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Container */}
          <div className="relative group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-8 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter username"
              required
            />
            {/* Input Decoration */}
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg 
                className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </div>
          </div>

          {/* Button Container */}
          <button
            disabled={loading || !username.trim()}
            type="submit"
            className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              "Join Chat"
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="mt-6 text-sm text-center text-gray-500">
          By joining, you agree to our 
          <a href="#" className="text-blue-600 hover:underline ml-1">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}