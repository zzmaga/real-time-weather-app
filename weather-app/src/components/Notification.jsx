import React from 'react';

function Notification({ message, visible }) {
  return (
    <div className={`notification ${visible ? '' : 'hidden'}`}>
      <p>{message}</p>
      <button onClick={() => document.querySelector('.notification').classList.add('hidden')}>
        Close
      </button>
    </div>
  );
}

export default Notification;