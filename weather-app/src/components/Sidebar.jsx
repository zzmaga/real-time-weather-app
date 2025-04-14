import React from 'react';

function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Menu</h2>
      </div>
      <nav>
        <ul>
          <li>
            <button
              className={`tab ${activeTab === 'weather' ? 'active' : ''}`}
              onClick={() => setActiveTab('weather')}
            >
              <i className="fa-solid fa-cloud"></i> Weather
            </button>
          </li>
          <li>
            <button
              className={`tab ${activeTab === 'disasters' ? 'active' : ''}`}
              onClick={() => setActiveTab('disasters')}
            >
              <i className="fa-solid fa-exclamation-triangle"></i> Disasters
            </button>
          </li>
          <li>
            <button
              className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="fa-solid fa-cog"></i> Settings
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;