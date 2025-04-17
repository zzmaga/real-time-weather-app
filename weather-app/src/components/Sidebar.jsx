import React from 'react';

function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Разделы</h2>
      </div>
      <nav>
        <ul>
          <li>
            <button
              className={`tab ${activeTab === 'weather' ? 'active' : ''}`}
              onClick={() => setActiveTab('weather')}
            >
              <i className="fa-solid fa-cloud"></i> Погода
            </button>
          </li>
          <li>
            <button
              className={`tab ${activeTab === 'disasters' ? 'active' : ''}`}
              onClick={() => setActiveTab('disasters')}
            >
              <i className="fa-solid fa-exclamation-triangle"></i> Катастрофы
            </button>
          </li>
          <li>
            <button
              className={`tab ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              <i className="fa-solid fa-newspaper"></i> Новости
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;