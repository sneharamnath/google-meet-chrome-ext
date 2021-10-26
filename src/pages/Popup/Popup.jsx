import React, { useEffect, useState, useRef } from 'react';
import copy from '../../assets/img/copy.png';
import './Popup.css';

const Popup = () => {
  const [meetID, setMeetID] = useState('');
  const [email, setEmail] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [userData, setUserData] = useState({})
  const textAreaRef = useRef(null);

  useEffect(() => {

    chrome.storage.sync.get('userData', (result) => {
      setUserData(result.userData);
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.msg === 'google_meet_link_created') {
        setMeetID(request.meetID);
        setEmail(request.email);
      }

      if (request.msg === 'copy_meet_id') {
        copyToClip();
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
    chrome.storage.sync.set({ userData: {} }, () => {});
  };

  const copyToClip = (e) => {
    textAreaRef.current.select();
    document.execCommand('copy');
    setCopySuccess('Copied!');
  };

  return (
    <div className="App">
      <div className="">
        <h3 className="label-text">Google Meet</h3>
        <img className="current-user-img" title={userData.email} src={userData.picture} alt="" />
      </div>
      <div>
        <button className="btn-meet" title="Click or Press Alt+N to create a new meet." onClick={createMeet}>
          <span>&nbsp;New meeting</span>
        </button>
        {/* <p className="label-text"></p> */}
      </div>
      {meetID && (<div>
        <div className="meet-link-container">
          <input
            className="clipboard-input"
            ref={textAreaRef}
            value={meetID || ''}
            readOnly="readOnly"
          />
          <div onClick={copyToClip}><img height="25px" width="20px" src={copy}></img></div>
        </div>
        <p className="label-text">{copySuccess}</p>
      </div>)}
      <div>
        <button className="btn-switch-user" title="Click or Press Alt+S to switch user." onClick={switchUser}>
          <span>&nbsp;Switch User</span>
        </button>
      </div>
    </div>
  );
};

export default Popup;
