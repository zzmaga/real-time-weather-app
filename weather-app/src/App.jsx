import './leafletFix';
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Weather from './components/Weather';
import Disasters from './components/Disasters';
import Settings from './components/Settings';
import Notification from './components/Notification';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('weather');
  const [notification, setNotification] = useState({ message: '', visible: false });

  const showNotification = (message) => {
    setNotification({ message, visible: true });
    setTimeout(() => setNotification({ message: '', visible: false }), 5000);
    if (Notification.permission === 'granted' && document.querySelector('#notificationsToggle')?.checked) {
      new Notification('Alert', {
        body: message,
        icon: '/assets/Imgs/weather-icon.png',
      });
    }
  };

  return (
    <div className="container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'weather' && <Weather showNotification={showNotification} />}
        {activeTab === 'disasters' && <Disasters showNotification={showNotification} />}
        {activeTab === 'settings' && <Settings />}
      </main>
      <Notification message={notification.message} visible={notification.visible} />
    </div>
  );
}

export default App;