import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from './FriendRequest.module.css';

import PofilePic from '../Images/profile.png'

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SearchProfile = ({cname}) => {
    const[nfriends, setNfriends] = useState()
    const[isFriend, setIsFriend] = useState()
    const[hasSentRequest, setHasSentRequest] = useState()
    const[requestSendmsg, setRequestSendMsg] = useState()
    const[requestRemovemsg, setRequestRemoveMsg] = useState()
    const {name} = useParams();

    useEffect(() => {
        getUserDetails(name)
    },[])

    const getUserDetails = async(name) => {
        try{
            // alert('executed')
            const response = await fetch(`${API_URL}getuserdetails`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body : JSON.stringify({ name: name }),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            else{
                const result = await response.json();
                setNfriends(result.data.numberOfFriends)
                setIsFriend(result.data.isFriend)
                setHasSentRequest(result.data.hasSentRequest)
                // console.log(`IsFriend : ${result.data.isFriend}`)
                // console.log(`HasSentRequest : ${result.data.hasSentRequest}`)
            }
            // getUserDetails(name)
    
        }
        catch(err){
            console.log(`ERROR from getUSerDetails : ${err}`)
        }
    }

    const sendFriendRequest = async() => {
        try{
            const response = await fetch(`${API_URL}sendfriendrequest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body : JSON.stringify({ name: name }),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            else{
                const result = await response.json();
                setRequestSendMsg(result.msg)
            }
            // getUserDetails(name)
        }
        catch(err){
            console.log(`ERROR from sendFriendRequest : ${err}`)
        }
    }

    const removeFriendRequest = async() => {
        try{
            const response = await fetch(`${API_URL}removefriendrequest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body : JSON.stringify({ name: name }),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            else{
                const result = await response.json();
                setRequestRemoveMsg(result.msg)
            }
        }
        catch(err){
            console.log(`ERROR from sendFriendRequest : ${err}`)
        }
    }


    useEffect(() => {
        if(requestSendmsg == true){
            getUserDetails(name)
            alert(`Friend Request sent.`)
        }
    },[requestSendmsg])

    useEffect(() => {
        if(requestRemovemsg == true){
            getUserDetails(name)
            alert(`Friend Request Removed.`)
        }
    },[requestRemovemsg])

    return(
        <>
            <center>
            <div>
        <div className={styles.ppdiv}>
          <div className={styles.imgDiv}>
            <img src={PofilePic} className={styles.ppImg}></img>
          </div>
        </div>

        <div className={styles.detailsDiv}>
          <div className={styles.nameDiv}>{name}</div>
          <div className={styles.nFrdsDiv}>Friends : {nfriends}</div>
          <div className={styles.frdsDiv}></div>
        </div>
      </div>

                <div>
                </div>
                {isFriend ? (
                // Render content if isFriend is true
                    <div>You Both Are Already Friends!</div>
                    ) : hasSentRequest ? (
                        // Render content if isFriend is false and hasSent is true
                        <div>
                            <button onClick={removeFriendRequest} className={styles.removeFriendRequest}>Remove Friend Request</button>
                        </div>
                    ) : (
                        // Render content if both isFriend and hasSent are false
                        <div> 
                            <button onClick={sendFriendRequest} className={styles.reqSendBtn}>Send Request</button>
                            <br></br><br></br>
                        </div>
                )}
            </center>
           
        </>
    )
}

export default SearchProfile;