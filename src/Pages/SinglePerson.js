import React, { useEffect, useState } from "react";
import { useParams, useNavigate,Route, Link } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import styles from './singlePerson.module.css';
import SendMsgs from "./SendMsgs";
import { forwardRef, useImperativeHandle, } from "react";

import { MsgsSliceActions } from "../Store/store";

import PofilePic from '../Images/profile.png'
import dotsMenu from '../Images/3dotsmenu.png'


// Inside SinglePerson.js
import { useHomeContext } from "./Home";

const API_URL = process.env.REACT_APP_BACKEND_URL;


const SinglePerson = forwardRef(({ skt, Afrds}, ref) => {

    const [sname, setSname] = useState('');
    const [msg, setMsg] = useState(''); 
    const [sentMsgs,setSentMsgs] = useState([]); //for storing sending smgs temporerly
    const [recivedMsgs,setRecivedMsgs] = useState([]);
    const [listItems, setListItems] = useState([]);
    const [allMsgs, setAllMsgs] = useState([]);
    const [allsentMsgs,setAllSentMsgs] = useState([]); //for storing sending smgs temporerly
    const [allrecivedMsgs,setAllRecivedMsgs] = useState([]);



    //using params to get contact name from the route URL
    const params = useParams();
    const {name} = params;

    //Accessing data from redux store
    const dispatch = useDispatch()
    const friends = useSelector((state) => state.msgsSlice.friends);

    //Friend Online/Offline indicater
    const SetArray = Array.from(Afrds);
    let dynamicStyles = styles.offline;
    const filter = SetArray.filter((user) => user === name);
    if (filter[0] === name) {
        dynamicStyles = styles.online;
    }

  // State to control the display of typing animation
  const [isTyping, setIsTyping] = useState(false);

  // Function to call when friends of a user are typing msgs to the user
  const typingMsg = () => {
      setIsTyping(true);  // Show the typing animation
      setTimeout(() => {
          setIsTyping(false);  // Hide the typing animation after 2 seconds
      }, 2000);
  };

  // Use useImperativeHandle to expose typingMsg to parent
  useImperativeHandle(ref, () => ({
      typingMsg
  }));


    //Adding all msgs to the 'allMsgs' array by sorting based on time 
    useEffect(() => {
        // Find the contact in the friends array by name
        const contact = friends.find(friend => Object.keys(friend)[0] === name);
        if (contact) {
            // Access rmsgs and smsgs for the given contact name
            const { rmsgs, smsgs, viewStatus } = contact[name];
        
            // Combine sent and received messages into a single array
            const combinedMsgs = [
                ...(smsgs || []).map(obj => ({ type: 's', ...obj })), // Map sent messages with type 's'
                ...(rmsgs || []).map(obj => ({ type: 'r', ...obj }))  // Map received messages with type 'r'
            ];
    
            // Sort the combined messages by timestamp
            const sortedMsgs = combinedMsgs.sort((a, b) => {
                const aTimestamp = Object.values(a)[1]; // Assuming the timestamp is the second value in the object
                const bTimestamp = Object.values(b)[1];
                return new Date(aTimestamp) - new Date(bTimestamp); // Sort by date
            });
    
            // Store the sorted messages in the allMsgs state
            setAllMsgs(sortedMsgs);
    
            // // Optional: Log the sorted messages for debugging
            // console.log(`***********************************************`)
            // sortedMsgs.forEach(messageObj => {
            //     const [msg, timestamp] = Object.entries(messageObj)[1]; // Access message and timestamp
            //     console.log(`Message: ${msg}, Timestamp: ${timestamp}`);
            // });
        } else {
            // console.log(`No data found for ${name}`);
        }
    }, [friends, name]);
    


    //using Context
    const {HomeCompoMethod, HomeMethod2} = useHomeContext();

    //Creating Usenavigation object
    const navigate = useNavigate();
    
    const socket = skt;
    let room = 'groom'


    useEffect(() => {
        // getUserName();
        // getAllMsgs()        
        dispatch(MsgsSliceActions.changeViewStatus(name))
    },[])


//Connecting to sockets on any changes happen in socket object like sending recicving msgs etc
    useEffect(() => {
       // socket.emit('join',sname);
       socket.on('server-msg', ( msg, timestamp) => {
            //setRecivedMsgs(prevMsgs => [...prevMsgs, msg]);

            const newMsgObj2 = { type: 'r', [msg]: timestamp };

            setAllMsgs(prevMsgs => [...prevMsgs, newMsgObj2])
            // setAllMsgs(prevMsgs => [...prevMsgs, newMsgObj])
       });
       socket.on('room',(msg, room) => {
            handleClick('li2','span1',msg);
            // console.log(`Msg came from ${room} : ${msg}`)
       });
    },[socket])


//joining user with his contact name
    useEffect(() => {
        //socket.emit('join-room', room, sname);
        //socket.emit('join', sname);
        HomeMethod2(socket,sname);
       //calling event to store users in a chatroom with a contact
       socket.emit('userInChatroom', (name));
    },[sname])

  // Function to handle scrolling to the bottom of the chat container
  const scrollToBottom = () => {
    // alert()
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  };

  // Run the scrollToBottom function whenever the messages array updates
  useEffect(() => {
    scrollToBottom();
  }, [allMsgs]);


    //Handling the Input change by making it controled compo 
    const handleInputChange = (event) => {
        const value = event.target.value;
        setMsg(value);
        // Emit the typing event with optional data
        socket.emit('typing',{reciver : name})
    };

    //method for sending 1-to-1 chat
    const sendMsg = () =>{
      const trimmedMsg = msg.trim()
      if(trimmedMsg == ''){
        alert(`Empty msgs are not allowed`)
      }
      else{
        const now = new Date();
        const isoString = now.toISOString();

 
        const newMsgObj2 = { type: 's', [msg]: isoString };
        setAllMsgs(prevMsgs => [...prevMsgs, newMsgObj2])
        //sending message to socket
        socket.emit('p-msg', { msg: msg, reciver: name });
      }
       setMsg('');
    }


    //To display msgs on chats div
    const handleClick = (clsname,clspan,msg,) => {
        const newItem = <li key={listItems.length} className={`${styles[clsname]}`}><span className={`${styles[clspan]}`}>{msg}</span></li>;
        setListItems((prevItems) => [...prevItems, newItem]);
    };


    const getAllMsgs = async() => {
        try{
            const response = await fetch(`${API_URL}getallmsgs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            else{
                const result = await response.json();
                // setAllMsgs(result)
                // console.log(`All Msgs from DB : ${JSON.stringify(result, null, 2)}`)
            }

        }
        catch(err){
            console.log(`Error From getAllMags : ${getAllMsgs}`)
        }
    } 


    const formatTime = (timestamp) => {
        // Convert timestamp to Date object
        const date = new Date(timestamp);
    
        // Use toLocaleTimeString to get the time in 12-hour format with AM/PM
        let timeString = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    
        // Remove leading zero from the hour part if present
        timeString = timeString.replace(/^0/, '');
    
        return timeString;
    };
    
    
     // Helper function to format the timestamp into a day string (e.g., "Sep 1, 2024")
     const formatDay = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
      
        // Zero out the time for both today and the given date
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
      
        const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
      
        // Calculate the difference in days
        const diffDays = Math.floor((today - date) / oneDay);
      
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "yesterday";
        if (diffDays <= 7) return `${diffDays} days ago`;
      
        // Return formatted date for messages older than 7 days
        return date.toLocaleDateString("en-US", {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      };
      
        // To store the last displayed day
        let lastDisplayedDay = '';

    return (
        <>
        <div id={styles.mdiv} style={{border : ""}}>
            <div className={styles.SPdiv}>
            <div className={styles.ppic}>
                <img src={PofilePic} className={styles.ppImg}></img>
            </div>
                  <div className={styles.pname} style={{border : ""}}>
                    <span id={styles.name}>{name}</span><br></br>
                    <div className={styles.typingdiv}>
                        {/* Show typing animation if isTyping is true */}
                        {isTyping && (
                            <div className={styles.typing}>
                                typing<span className={styles.dots}></span>
                            </div>
                        )}
                    </div>
                  </div>
                  <div id={dynamicStyles} style={{border : ""}}></div>
                  <Link to={`/contactProfile/${name}`} styles={{ textDecoration: 'none', color: 'black' }}>
                        <div style={{ width: "18px", height:"25px", marginRight: "2%", cursor:"pointer"}} >
                            <img src={dotsMenu} className={styles.ppImg}></img>
                        </div>               
                  </Link>
            </div>

            <div id={styles.chatSection}>
                <div id={styles.chats} className="chat-container">
                    {allMsgs.map((messageObj, index) => {
                        const { type, ...messageDetails } = messageObj;
                        const [msg, timestamp] = Object.entries(messageDetails)[0];

                        if (typeof msg !== 'string') return null; // Skip invalid messages

                        const formattedTime = formatTime(timestamp);
                        const messageClass = type === 's' ? styles.li1 : styles.li2;
                        const spanClass = type === 's' ? styles.span2 : styles.span1;

                        // Get the current message's day
                        const messageDay = formatDay(timestamp);

                        // Check if we should display the day block
                        const showDayBlock = messageDay !== lastDisplayedDay;
                        if (showDayBlock) {
                            lastDisplayedDay = messageDay; // Update the last displayed day
                        }

                        return (
                            <React.Fragment key={index}>
                                {/* Show the day block if it's the first message of the day */}
                                {showDayBlock && (
                                    <div className={styles.dateBlock}>
                                        {messageDay}
                                    </div>
                                )}

                                <div className={messageClass}>
                                    <span className={spanClass}>
                                        {msg}<br />
                                        <span className={styles.time}>{formattedTime}</span>
                                    </span>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
                <div id={styles.msgDiv}>
                    <input
                        id={styles.SPinput}
                        type='text'
                        value={msg}
                        onChange={handleInputChange}
                        placeholder="type..."
                    />
                    <button id={styles.SPbtn} onClick={sendMsg}>Send</button>
                </div>
            </div>
        </div>
      </>
    );
});

export default SinglePerson;
