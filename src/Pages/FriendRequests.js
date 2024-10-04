import React, { useEffect, useState } from "react";
import styles from './FriendRequest.module.css';
import SearchList from "./SearchList";
import { Link, } from "react-router-dom";

import RequestSkelton from "./RequestSkelton"; // Import your skeleton component

const API_URL = process.env.REACT_APP_BACKEND_URL;

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [findFriend, setFindFriend] = useState('');
  const [searchFriends, setSearchFriends] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state to track if data is fetching



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
    } finally {
      setLoading(false); // Set loading to false once data is fetched
    }
  };

  // Fetch requests on mount
  useEffect(() => {
    getRequests(); // Fetch requests
  }, []); 

  // Add Friend function
  const AddFriend = async (name) => {
    try {
      const response = await fetch(`${API_URL}addfriend`, {
        method: 'POST',
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
            alert(`${name} Added to friends List`)
        }
        getRequests();
      }

    } catch (err) {
      console.log(`ERROR from AddFriend function: ${err}`);
    }
  };

  // Ignore Friend function
  const IgnoreFriend = async (name) => {
    try {
      const response = await fetch(`${API_URL}ignorefriend`, {
        method: 'POST',
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
        getRequests();
      }
    } catch (err) {
      console.log(`ERROR from IgnoreFriend function: ${err}`);
    }
  };

  // Fetch users when the 'findFriend' state changes
  useEffect(() => {
    getUsersList(findFriend)
  },[findFriend])

  // Function to get all the users which match the search term
  const getUsersList = async (findFriend) => {
    try {
      const response = await fetch(`${API_URL}finduser`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: findFriend }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setSearchFriends(data);
    } catch (error) {
      console.error('Error finding User:', error);
    }
  }

  return (
    <center>
      <h2 style={{fontFamily:"cursive"}}>Friend Requests</h2><br /><br />
      <center>
        <input
          type="text"
          value={findFriend}
          onChange={(e) => setFindFriend(e.target.value)}
          placeholder="Search user"
          className={styles.searchInp}
        />
        <div>
          {findFriend.trim() !== '' ? ( // Check if search is not empty
            searchFriends.length > 0 ? (
              <ul>
                {searchFriends.map((friend, idx) => (
                  <Link to={`profile`} key={idx} styles={{ textDecoration: 'none', color: 'black' }}>
                    <SearchList cname={friend.name}/>
                  </Link>
                ))}
              </ul>
            ) : (
              <p>No matches found</p>
            )
          ) : (
            <p></p> // Optional: Message when 'text' is empty
          )}
        </div>
      </center>

      {/* Show skeleton while loading */}
      {loading ? (
        <RequestSkelton />
      ) : (
        <ul>
          {requests.length > 0 ? (
            requests.map((name, idx) => (
              <div key={idx} className={styles.user}>
                <div>
                  <div className={styles.name}>{name}</div><br />
                  <div className={styles.btnDiv}>
                    <button className={styles.btn} id={styles.accept} onClick={() => AddFriend(name)}>
                      Accept
                    </button>
                    <button className={styles.btn} id={styles.ignore} onClick={() => IgnoreFriend(name)}>
                      Ignore
                    </button>
                  </div>
                </div><br /><br />
              </div>
            ))
          ) : (
            <h3 style={{marginTop : "2%"}}>No friend requests found</h3>
          )}
        </ul>
      )}
      <br /><br />
    </center>
  );
};

export default FriendRequests;
