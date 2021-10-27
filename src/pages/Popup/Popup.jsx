import React, { useEffect, useState, useRef } from 'react';
import copy from '../../assets/img/copy.png';
import './Popup.css';

const Popup = () => {
  const [meetID, setMeetID] = useState('');
  const [email, setEmail] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [userData, setUserData] = useState({})
  const [loading, setLoading] = useState(false)
  const textAreaRef = useRef(null);

  useEffect(() => {

    chrome.storage.sync.get('userData', (result) => {
      setUserData(result.userData);
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.msg === 'google_meet_link_created') {
        setMeetID(request.meetID);
        setEmail(request.email);
        setLoading(false);
      }

      if(request.msg === 'meet_btn_press'){
        setLoading(true);
      }

      if (request.msg === 'copy_meet_id') {
        copyToClip();
      }

      if (request.msg === 'user_changed') {
        setLoading(false);
      }
    });
  });

  const createMeet = () => {
    setLoading(true);
    chrome.runtime.sendMessage('create-meet');
  };

  const switchUser = () => {
    setLoading(true);
    chrome.runtime.sendMessage('change-user');
    setEmail('');
    setMeetID('');

    chrome.storage.sync.set({ meetID: '' }, () => {});
    chrome.storage.sync.set({ email: '' }, () => {});
    chrome.storage.sync.set({ userData: {} }, () => {});
  };

  const copyToClip = (e) => {
    // textAreaRef.current.select();
    document.execCommand('copy');
    setCopySuccess('Copied!');
  };

  return (
    <div className="App">
      <div className="container">
        <div className="box"></div>
        <div className="box"><h3 className="label-text">Google Meet</h3></div>
        <div className="box switch-user-div" title="Click or Press Alt+S to switch user." onClick={switchUser}><h4>Switch User</h4></div>
      </div>
      <div>
        <img className="current-user-img" title={userData.email} src={userData.picture} alt="" />
      </div>
      <div>
        <button className="btn-meet" title="Click or Press Alt+N to create a new meet." disabled={loading} onClick={createMeet}>
          {loading ? (<div className="loader"></div>)
            : (<span>&#x2b;&nbsp;New meeting</span>)}
        </button>
      </div>
      {meetID && (<div>
        <div className="meet-link-container">
          <input className="clipboard-input" ref={textAreaRef} value={meetID || ''} readOnly="readOnly"/>
          <div onClick={copyToClip}><img className="copy-icon" src={copy}></img></div>
        </div>
        <p className="label-text">{copySuccess}</p>
      </div>)}
    </div>
  );
};

export default Popup;
