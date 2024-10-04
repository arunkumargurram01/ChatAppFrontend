import React, { useEffect, useState } from "react";
import styles from './FriendRequest.module.css';

import PofilePic from '../Images/profile.png'

import { useSelector } from 'react-redux';

const UserProfile = () => {
  const [requests, setRequests] = useState([]);
  const [changeImg, setChangeImg] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;


  // Accessing the Name and Nfriends from 
  const count = useSelector((state) => state.counterSlice.count)
//   const name = useSelector((state) => state.userProfileSlice.uname)
  const name = useSelector((state) => state.upSlice.uname)
  const nfrds = useSelector((state) => state.upSlice.nfriends)



  // Define getRequests function
  const getRequests = async () => {
    try {
      const response = await fetch(`${API_URL}getfriendrequest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      } else {
        const result = await response.json();
        // console.log(`Result : ${result.requests}`); // Check if data is received
        setRequests(result.requests); // Update state
      }
    } catch (err) {
      console.log(`ERROR from getRequests method: ${err}`);
    }
  };

  //changing the state of 'changeImg'
  const changeImgFun = () => {
    setChangeImg(true)
  }

  return (
    <>
      <div>
        <div className={styles.ppdiv}>
          <div className={styles.imgDiv}>
            <img src={PofilePic} className={styles.ppImg}></img>
          </div>
        </div>

        <div className={styles.detailsDiv}>
          <div className={styles.nameDiv}>{name}</div>
          <div className={styles.nFrdsDiv}>Friends : {nfrds}</div>
          <div className={styles.frdsDiv}></div>
        </div>
      </div>

    </>
  );
};

export default UserProfile;
