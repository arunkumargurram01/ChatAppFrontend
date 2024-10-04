import React from "react";
import {useParams} from "react-router-dom";
import styles from './FriendRequest.module.css';

import PofilePic from '../Images/profile.png'


const ContactProfile = () => {
    
    //using params to get contact name from the route URL
    const params = useParams();
    const {name} = params;

    const API_URL = process.env.REACT_APP_BACKEND_URL;
    
    const removeContact = async() => {
        try {
            const response = await fetch(`${API_URL}removefriend`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body : JSON.stringify({ name: name }),
            });
      
            if (!response.ok) {
              throw new Error('Network response was not ok');
            } else {
              const result = await response.json();
              if(result.msg){
                  alert(`${name} Ignored from friend requests`)
              }
            }
          } catch (err) {
            console.log(`ERROR from IgnoreFriend function: ${err}`);
          }
    }

    return(
        <>
      <div>
        <div className={styles.ppdiv}>
          <div className={styles.imgDiv}>
            <img src={PofilePic} className={styles.ppImg}></img>
          </div>
        </div>

        <div className={styles.detailsDiv}>
          <div className={styles.nameDiv}>{name}</div>
          <button className={styles.removeFriend} onClick={removeContact}>
                Remove Friend
          </button>
        </div>
      </div>
        </>
    )
}

export default ContactProfile;