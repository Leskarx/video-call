/* eslint-disable react/prop-types */
import  { createContext, useContext, useMemo,useEffect } from 'react';
import { io } from 'socket.io-client';
import URL from '../conf/env';

const SocketContext = createContext(null);

const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket must be used within a SocketContextProvider');
  }
  return socket;
};

function SocketContextProvider({ children }) {
  const socket = useMemo(() => {
    const socketInstance = io(URL, { autoConnect: false });
    return socketInstance;
  }, []);

  useEffect(() => {
    // Automatically connect the socket on mount
    socket.connect();

    // Cleanup socket connection on unmount
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export { SocketContextProvider, useSocket };
