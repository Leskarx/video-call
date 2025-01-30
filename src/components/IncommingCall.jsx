

export default function IncommingCall({ answerCall, endCall }) {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/75 bg-opacity-50">
    <div className="bg-white p-6 rounded-xl shadow-lg text-center">
      <h3 className="text-lg font-bold mb-4">Incoming Call...</h3>
      <div className="flex justify-center space-x-4">
        <button onClick={answerCall} className="px-4 py-2 bg-green-500 text-white rounded-lg">Answer</button>
        <button onClick={endCall} className="px-4 py-2 bg-red-500 text-white rounded-lg">Decline</button>
      </div>
    </div>
  </div>
  )
}
