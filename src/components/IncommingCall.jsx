import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPhoneAlt, FaTimes } from "react-icons/fa";
import ringTone from "../assets/ringtone.mp3"; // Import your ringtone file

export default function IncomingCall({ answerCall, endCall }) {
  const audioRef = useRef(null);
  const [isRinging, setIsRinging] = useState(true);

  // Play the ringtone when the component mounts
  useEffect(() => {
    if (isRinging && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [isRinging]);

  // Stop the ringtone when the call is answered or declined
  const handleAnswer = () => {
    setIsRinging(false);
    answerCall();
  };

  const handleDecline = () => {
    setIsRinging(false);
    endCall();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-95 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-800 p-8 rounded-2xl shadow-xl space-y-6 relative"
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="absolute top-4 right-4">
            <motion.button
              onClick={handleDecline}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </motion.button>
          </div>

          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              {/* Pulsing circle animation */}
              <motion.div
                className="absolute inset-0 bg-blue-500 rounded-full opacity-20"
                animate={{
                  scale: [1, 1.8],
                  opacity: [0.2, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeOut",
                }}
              />

              {/* Bouncing phone icon */}
              <motion.div
                className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg"
                animate={{
                  scale: [1, 1.1, 1],
                  y: [0, -10, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut",
                }}
              >
                <FaPhoneAlt className="w-8 h-8 text-white" />
              </motion.div>
            </div>

            {/* Text animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-2"
            >
              <h2 className="text-2xl font-bold text-gray-100">Incoming Call</h2>
              <motion.p
                className="text-gray-400"
                animate={{ opacity: [0.6, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Would you like to answer?
              </motion.p>
            </motion.div>

            {/* Buttons with animations */}
            <div className="flex space-x-4">
              <motion.button
                onClick={handleAnswer}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-200"
              >
                Answer
              </motion.button>
              <motion.button
                onClick={handleDecline}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-200"
              >
                Decline
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Audio element for the ringtone */}
        <audio ref={audioRef} src={ringTone} loop />
      </motion.div>
    </AnimatePresence>
  );
}