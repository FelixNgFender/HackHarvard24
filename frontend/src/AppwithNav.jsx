import React from 'react';
import NavBar from './components/NavBar';
import App from './App';
import ChatInterface from './components/ChatInterface'

const AppWithNav = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        ChatInterface
      </main>
    </div>
  );
};

export default AppWithNav;