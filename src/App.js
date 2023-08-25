import React, { useContext } from 'react';
import './App.css';
import CallForm from './components/CallForm/CallForm';
import GroChatVoipProvider from './GroChatVoipProvider';
import { WebSocketContext } from './WebSocketProvider';
import Call from './components/Call/Call';

function App() {
  const ws = useContext(WebSocketContext)
  
  return (
    <div className="App">
      <h1>Voice Call Demo</h1>
      <GroChatVoipProvider onCallEnded={(call) => console.log(call)} ws={ws}>
        <CallForm />
        <Call />
      </GroChatVoipProvider>
    </div>
  );
}

export default App;
