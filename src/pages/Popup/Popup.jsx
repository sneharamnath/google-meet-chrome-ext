import React, { useEffect, useState, useRef } from 'react';
import logo from '../../assets/img/logo.svg';
import './Popup.css';

const Popup = () => {
  const [meetID, setMeetID] = useState('');
  const [email, setEmail] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const textAreaRef = useRef(null);

  useEffect(() => {
    chrome.storage.sync.get(['email'], (res) => {
      setEmail(res.email);
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.msg === 'google_meet_link_created') {
        setMeetID(request.meetID);
        setEmail(request.email);
      }

      if (request.msg === 'copy_meet_id') {
        copyToClip();
      }

      if (request.msg === 'user_changed') {
      }
    });
  });

  const createMeet = () => {
    chrome.runtime.sendMessage('create-meet');
  };

  const switchUser = () => {
    chrome.runtime.sendMessage('change-user');
    setEmail('');
    setMeetID('');

    chrome.storage.sync.set({ meetID: '' }, () => {});
    chrome.storage.sync.set({ email: '' }, () => {});
  };

  const copyToClip = (e) => {
    textAreaRef.current.select();
    document.execCommand('copy');
    setCopySuccess('Copied!');
  };

  return (
    <div className="App">
      <button onClick={createMeet}>
        <span>&#x2b; &nbsp;New meeting</span>
      </button>
      <button onClick={switchUser}>
        <span>&#x2b; &nbsp;Switch User</span>
      </button>
      <input
        className="clipboard-input"
        ref={textAreaRef}
        value={meetID || ''}
        readOnly="readOnly"
      />
      <button onClick={copyToClip}>Copy</button>
      <p>{copySuccess}</p>
      {email && <p>{email}</p>}
    </div>
  );
};

export default Popup;
