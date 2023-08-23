import React, { useContext } from 'react';
import './App.css';
import CallForm from './components/CallForm/CallForm';
import GroChatVoipProvider from './GroChatVoipProvider';
import { WebSocketContext } from './WebSocketProvider';

function App() {
  const ws = useContext(WebSocketContext)
  
  return (
    <div className="App">
      <h1>Voice Call Demo</h1>
      <GroChatVoipProvider ws={ws}>
        <CallForm />
      </GroChatVoipProvider>
    </div>
  );
}

export default App;
