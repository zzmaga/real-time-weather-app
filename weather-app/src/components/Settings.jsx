import React from 'react';

function Settings() {
  const handleToggle = (e) => {
    console.log('Notifications:', e.target.checked ? 'Enabled' : 'Disabled');
  };

  return (
    <section className="section">
      <h2>Settings</h2>
      <label>
        <input type="checkbox" id="notificationsToggle" defaultChecked onChange={handleToggle} /> Enable
        notifications
      </label>
    </section>
  );
}

export default Settings;