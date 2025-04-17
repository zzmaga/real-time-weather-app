import './leafletFix';
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Weather from './components/Weather';
import Disasters from './components/Disasters';
import News from './components/News';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('weather');

  return (
    <div className="container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'weather' && <Weather />}
        {activeTab === 'disasters' && <Disasters />}
        {activeTab === 'news' && <News />}
      </main>
    </div>
  );
}

export default App;