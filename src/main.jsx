// import { StrictMode } from 
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { SocketContextProvider } from './context/SocketContext.jsx'

createRoot(document.getElementById('root')).render(
    <SocketContextProvider>
        <BrowserRouter>
    <App />
    </BrowserRouter>
    </SocketContextProvider>
    

  
    
  
)
