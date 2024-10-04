import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import SinglePerson from "./SinglePerson";
import HomeCard from "./HomeCard";
import SearchList from "./SearchList";
import ContactCardSkelton from "./ContactCardSkelton";
import axios from 'axios';

import { useRef } from "react";
import styles from './home.module.css'


import { useSelector,useDispatch } from "react-redux";
import React, { createContext, useContext } from "react";
import { MsgsSliceActions } from "../Store/store"; //Accessing 'MsgsSlice' actions from redux
import { userProfileSliceActions } from "../Store/store";

// Creating a context
const HomeContext = createContext();

let sk;


const API_URL = process.env.REACT_APP_BACKEND_URL;


// Defining a provider component of context to send different components
export const HomeProvider = ({ children, skt }) => {
    // Define the method to be provided
    const HomeCompoMethod = (socket,msg,name) => {
        // console.log(`Method in HomeCompo is Executed:, to ${name}`);
        socket.emit('p-msg', { msg: msg, reciver: name });
    }

    const HomeMethod2 = (socket, sname) => {
        // console.log(`Home method 2 called`);
        socket.emit('join', sname);    
    }

    skt.on('server-msg', ( msg) => {
        //setRecivedMsgs(prevMsgs => [...prevMsgs, msg]);
        //handleClick('li2','span1',msg);
        // console.log(`Home method 2 calle : `);
   });

    // Return the provider with the method as value
    return (
        <HomeContext.Provider value={{ HomeCompoMethod, HomeMethod2 }}>
            {children}
        </HomeContext.Provider>
    );
}

// Create a custom hook to consume the context
export const useHomeContext = () => useContext(HomeContext);

  // Creating Socket instance to connect users and emit and listen to events to and from the server.
  //const socket = io('http://localhost:4040');

const Home = ({ skt }) => {

    const { HomeCompoMethod, HomeMethod2 } = useHomeContext(); // Accessing methods from context

    const [uname, setUName] = useState('');
    const [friends, setFriends] = useState([]);
    const [findFriend, setFindFriend] = useState('');
    const [searchFriends, setSearchFriends] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const [activeUsersSet, setActiveUsersSet] = useState(new Set());
    const [disconnectedFrd, setDisconnectedFrd] = useState([]);
    const [loading, setLoading] = useState(true);
    const [setArray, setSetArray] = useState([]);
    const [newOnlineMsg, setNewOnlineMsg] = useState([]);
    const [allMsgs, setAllMsgs] = useState({ //for storing all msgs from server DB
        onlineReceivedMsgs: {},
        onlineSendMsgs: {},
        offlineSendMsgs: {},
        offlineReceivedMsgs: {},
    });
    let AllLastmsgs = [];
    const [lastMsgs,setLastMsgs] = useState([]); //for storing last msg for all contacts
    const allMsgsMap = useSelector((state) => state.msgsSlice.msgs); //to retrive all the messages from redux
    const [contactsList, setContactsList] = useState([]);
    const [allContactsSentMsgs, setAllContactsSentMsgs] = useState(Array(friends.length).fill([]));
    const latestMessages = new Map(); 
    const contactsMsgs = new Map(); //For storing all the contact msgs separetly to display on chat


    const socket = skt;
    const navigate  = useNavigate();
    // let Allmsgs = {};
    //let disconnectedFrd;

    //creating dispatch object
    const dispatch = useDispatch()


    // Create a ref to access child function
    const homeCardRef = useRef({});


//socket event handling called from server
    socket.on('activefriends',({Activefriends}) => {
        setActiveUsers(Activefriends)
        //adding data into set
        const newSet = new Set(activeUsersSet);
        Activefriends.forEach(friend => {
            newSet.add(friend);
            //console.log(`FRD : ${friend}`)
        });
        setActiveUsersSet(newSet)
        //setSetArray(Array.from(newSet))
    });

    socket.on('disconnectedFrd', (data) => {
        setDisconnectedFrd(data); // Set the received data directly to the state
    });

    socket.on('online', (name) => {
       // console.log(`New Online User Frd : ${name}`)
        //setActiveUsers(prevData => [...prevData, name]); // Set the received data directly to the state
        //adding data to the set
        const newSet = new Set(activeUsersSet)
        newSet.add(name);
        setActiveUsersSet(newSet);
    });

    useEffect(() => {
        socket.on('sender-typing',({name}) => {
            handleTyping(name)
        })
    },[socket])

    // Call the typingMsg function in the child
    // Function to handle typing indication
    const handleTyping = (name) => {
        // Check if ref exists for the given name
        if (homeCardRef.current[name]) {
            homeCardRef.current[name].typingMsg(); // Call typingMsg function for the specific HomeCard
        }
    };


        useEffect(() => {
            socket.on('msg-notify', ({ msg, sender, timestamp }) => {
                // console.log(`Home p-msg: ${msg} from: ${sender}`);
                setLastMsgs([])
                getAllMsgs()
            });
        }, [socket])

        
        

    useEffect(() => {
        //emiting a event to delete users from 'usersInChat' map when user back from chat
        socket.emit('dltuserinchat',(uname))
        HomeMethod2(socket,uname);
    },[uname])


    useEffect(() => {
        //console.log(`UseEffect activeUsersSet friend list received : ${setArray}`);
        setSetArray(activeUsers)
    }, [activeUsersSet]);
    

//to delete the disconnected frd from online to offline
    useEffect( () => {
        const dname = disconnectedFrd;
        // console.log(`Array ele : ${dname}`)
        const newActivefrds = activeUsers.filter((name) => {
            return name != dname
        })
        setActiveUsers(newActivefrds);
        // console.log(`New Active Users : ${newActivefrds}`);

        //using set
        const newSet = new Set(activeUsersSet);
        newSet.delete(dname)
        setActiveUsersSet(newSet);
        //alert(disconnectedFrd)
    },[disconnectedFrd]);


// Home starting of the page 
    useEffect(() => {
        CheckLogIn();
        getUserDetails();
        deleteMsgs();

    },[]);

    





//for sending username and frdsList to the socket object
    useEffect(() => {
        if(uname != ''){
            socket.emit('addactiveuser', {uname, friends});
        }
    },[uname])
    


    //UseEffect to set the last mesgs and messages classification for each user.
    useEffect(() => {
        // getAllMsgs();
        if (allMsgs) {
            //  let AllLastmsgs = [];

            // Accessing online received messages
            Object.keys(allMsgs.onlineReceivedMsgs).forEach(name => {
                const messages = allMsgs.onlineReceivedMsgs[name];
                if (messages.length > 0) {
                    // console.log(`Online Received Messages from ${name}:`, messages);
                    let msgLen = messages.length-1
                    let lastmsg = messages[msgLen].message;
                    let lastmsgTime = messages[msgLen].timestamp;
                    // alert(lastmsgTime)
                    //Pushing only the last msg from the a contact type of messages
                    AllLastmsgs.push({ contact: name, type:'online recived', lastmsgTime: lastmsgTime, lastmsg: lastmsg });
                    // console.log(`${name} Last message Time : ${messages[msgLen].timestamp}`)
                } else {
                    // console.log(`No online received messages from ${name} found.`);
                }
            });
    
            // Accessing online sent messages
            Object.keys(allMsgs.onlineSendMsgs).forEach(name => {
                const messages = allMsgs.onlineSendMsgs[name];
                if (messages.length > 0) {
                    // console.log(`Online Sent Messages from ${name}:`, messages);
                    let msgLen = messages.length-1
                    let lastmsg = messages[msgLen].message;
                    let lastmsgTime = messages[msgLen].timestamp;
                    //alert(lastmsgTime)

                    AllLastmsgs.push({ contact: name,type:'online sent', lastmsgTime:lastmsgTime, lastmsg: lastmsg });
                    // console.log(`${name} Last message Time : ${messages[msgLen].timestamp}`)

                } else {
                    // console.log(`No online sent messages from ${name} found.`);
                }
            });
    
            // Accessing offline sent messages
            Object.keys(allMsgs.offlineSendMsgs).forEach(name => {
                const messages = allMsgs.offlineSendMsgs[name];
                if (messages.length > 0) {
                    // console.log(`Offline Sent Messages from ${name}:`, messages);
                    let msgLen = messages.length-1
                    let lastmsg = messages[msgLen].message;
                    let lastmsgTime = messages[msgLen].timestamp;

                    AllLastmsgs.push({ contact: name,type:'offline sent', lastmsgTime:lastmsgTime, lastmsg: lastmsg });
                    // console.log(`${name} Last message Time : ${messages[msgLen].timestamp}`)
                } else {
                    // console.log(`No offline sent messages from ${name} found.`);
                }
            });
    
            // Accessing offline received messages
            Object.keys(allMsgs.offlineReceivedMsgs).forEach(name => {
                const messages = allMsgs.offlineReceivedMsgs[name];
                if (messages.length > 0) {
                    //console.log(`Offline Received Messages from ${name}:`, messages);
                    let msgLen = messages.length-1
                    let lastmsg = messages[msgLen].message;
                    let lastmsgTime = messages[msgLen].timestamp;

                /*  const dateObj = new Date(lastmsgTime);
                    const date = dateObj.toISOString().split('T')[0];
                    const time = dateObj.toISOString().split('T')[1].split('.')[0];
                    console.log("Date:", date); 
                    console.log("Time:", time);  */

                    AllLastmsgs.push({ contact: name, type:'offline recived', lastmsgTime: lastmsgTime, lastmsg: lastmsg });
                    // console.log(`${name} Last message Time : ${messages[msgLen].timestamp}`)

                } else {
                    // console.log(`No offline received messages from ${name} found.`);
                }
            });
            // console.log(`AllLast Msgs : ${AllLastmsgs}`)
/* 
            newArray = AllLastmsgs.sort((a, b) => {
                return new Date(b.lastmsgTime) - new Date(a.lastmsgTime);
            }); */

            // Use a Map to filter out only the latest message for each contact
            AllLastmsgs.forEach(item => {
                const existing = latestMessages.get(item.contact);
                if (!existing || new Date(item.lastmsgTime) > new Date(existing.lastmsgTime)) {
                    // add only uniqe contact name with changing last msg
                    latestMessages.set(item.contact, item);
                }
            });
    
            // Sort the friends list based on the latest message time using 'latestMessages' Map
            const sortedFriends = friends.slice().sort((a, b) => {
                const msgA = latestMessages.get(a);
                const msgB = latestMessages.get(b);
    
                if (msgA && msgB) {
                    return new Date(msgB.lastmsgTime) - new Date(msgA.lastmsgTime);
                } else if (msgA) {
                    return -1;
                } else if (msgB) {
                    return 1;
                } else {
                    return 0;
                }
            });
    
            // Update the friends list to be rendered
            setFriends(sortedFriends);   

            // After sorting friends, build the lastMsgs array
            const newLastMsgs = sortedFriends.map(friend => {
                const msg = latestMessages.get(friend);
                return msg ? msg.lastmsg : null;  // Add the last message time or null if no message exists
            });

            setLastMsgs(newLastMsgs)



        //to store all contacts msgs separetly in 'contactsMsgs' Map

            // Helper function to add messages
            // Initialize the map with send and received arrays
            const addMessagesToMap = (contactName, messages, messageType) => {
                if (!contactsMsgs.has(contactName)) {
                    contactsMsgs.set(contactName, { send: [], received: [] });
                }
            
                const contactMessages = contactsMsgs.get(contactName);
            
                if (messageType === 'received') {
                    contactMessages.received.push(...messages.map(msg => ({
                        msg: msg.message,
                        time: msg.timestamp
                    })));
                } else if (messageType === 'send') {
                    contactMessages.send.push(...messages.map(msg => ({
                        msg: msg.message,
                        time: msg.timestamp
                    })));
                }
            };
            
            // Iterate over each message type and add them to the correct array
            Object.entries(allMsgs).forEach(([messageType, contacts]) => {
                Object.entries(contacts).forEach(([contactName, messages]) => {
                if (messageType === 'onlineReceivedMsgs' || messageType === 'offlineReceivedMsgs') {
                    addMessagesToMap(contactName, messages, 'received');
                } else if (messageType === 'onlineSendMsgs' || messageType === 'offlineSendMsgs') {
                    addMessagesToMap(contactName, messages, 'send');
                }
                });
            });

            //setting all the messagas in the redux
            dispatch(MsgsSliceActions.getallMsgs(contactsMsgs))

        }
        setTimeout(() => {
            setLoading(false)
          }, 1000);
    }, [allMsgs,newOnlineMsg,dispatch]);


//Accessing and setting up the messages from redux and sorting and storing in a Var
    useEffect(() => {
        if (allMsgsMap.size > 0) {
          // Step 2: Retrieve and process all contacts and their messages
          let contactData = [];
    
          allMsgsMap.forEach((messagesObj, contactName) => {
            contactData.push({
              contact: contactName,
              sentMsgs: messagesObj.send,
              receivedMsgs: messagesObj.received,
            });
          });
    
          // Sort contactData based on latest message timestamp (sent or received)
          contactData.sort((a, b) => {
            const lastSentA = a.sentMsgs.length > 0 ? new Date(a.sentMsgs[a.sentMsgs.length - 1].time) : null;
            const lastReceivedA = a.receivedMsgs.length > 0 ? new Date(a.receivedMsgs[a.receivedMsgs.length - 1].time) : null;
            const lastMessageA = lastSentA > lastReceivedA ? lastSentA : lastReceivedA;
    
            const lastSentB = b.sentMsgs.length > 0 ? new Date(b.sentMsgs[b.sentMsgs.length - 1].time) : null;
            const lastReceivedB = b.receivedMsgs.length > 0 ? new Date(b.receivedMsgs[b.receivedMsgs.length - 1].time) : null;
            const lastMessageB = lastSentB > lastReceivedB ? lastSentB : lastReceivedB;
    
            return new Date(lastMessageB) - new Date(lastMessageA);
          });
    
          setContactsList(contactData);
        }
      }, [allMsgsMap]);


// Adding every message of all contacts to the redux to store in 'friends' Arry of map
    useEffect(() => {
        let idx = 0;
        dispatch(MsgsSliceActions.clearAllMsgs())
        contactsList.forEach((messagesObj, contactName) => {
            let cname = friends[contactName];
            if (messagesObj) {
                // console.log(`Contact: ${cname}`);
                // console.log("Received Messages:");
                if (messagesObj.receivedMsgs) {
                    messagesObj.receivedMsgs.forEach((message, index) => {
                        // alert(`Recived Msgs : ${message.time}`)
                        // console.log(`  ${index + 1}. Message: ${message.msg}, Time: ${message.time}`);
                        dispatch(MsgsSliceActions.addMsgs({name:cname, msgtype:`rmsg`, msg:message.msg, time:message.time}))
                    });
                }
                
                // console.log("Sent Messages:");
                if (messagesObj.sentMsgs) {
                    
                    messagesObj.sentMsgs.forEach((message, index) => {
                        // alert(`Sent Msgs : ${message.time}`)
                        // console.log(`  ${index + 1}. Message: ${message.msg}, Time: ${message.time}`);
                        //addMessageToArray(idx,message.msg,message.time)
                        dispatch(MsgsSliceActions.addMsgs({name:cname, msgtype:`smsg`, msg:message.msg, time:message.time}))
                    });
                }
                
            } else {
                // console.warn(`No messagesObj found for contact: ${contactName}`);
            }
        });
    }, [contactsList]);



    //Handling deletingMsgs of seen messages from database
    const friendsList = useSelector((state) => state.msgsSlice.friends);
    const deleteMsgs = async() => {
        friendsList.forEach(friendObject => {
            const friendName = Object.keys(friendObject)[0]; // Get the dynamic key (friend's name)
            const viewStatus = friendObject[friendName].viewStatus; // Access the viewStatus using the name
        
            // alert(`Friend: ${friendName}, View Status: ${viewStatus}`);
            if(viewStatus){
                deleteSeenMsgs(friendName)
                // getAllMsgs()
            }
        });
        
        
    } 


    // Function to delete recived msgs after seen by user/friend/contact from both sender and reciver
    const deleteSeenMsgs = async(friendName) => {
        //alert(`working..`)
        try {
            const response = await fetch(`${API_URL}deletemsgs`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies in the request
                body: JSON.stringify({ friendName , uname}),
            });
            if (response.status === 401) {
            //If The server gives error then Navigate to login page 
              navigate('/login')
              throw new Error('Network response was not ok');
            }
            else{ //If user Logged In Then Add The product Into Cart By calling addtocart method["method"]
                const result = await response.json();
                //alert(`From deleteMsgs Route response: ${result}`);
                getAllMsgs()
             }
        } 
        catch (err) {
              console.log(`Err From deleteSeenMsgs Method in ProductCard Compo : ${err}`)
        }
    }


    
//Checking method used to check user loged in or not
 //Method for User Login Check
 const CheckLogIn = async() => {
    //alert(`working..`)
    try {
        const response = await fetch(`${API_URL}islogin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include' // Include cookies in the request
        });
        if (response.status === 401) {
        //If The server gives error then Navigate to login page 
          navigate('/login')
          throw new Error('Network response was not ok');
        }
        else{ //If user Logged In Then Add The product Into Cart By calling addtocart method["method"]
            const result = await response.json();
            // console.log(`From isLogIn Route response: ${result}`);
         }
    } 
    catch (err) {
          console.log(`Err From UserLogInCheck Method in ProductCard Compo : ${err}`)
    }
}


//Fir fetching users from database if user login
    const getUserDetails = async() => {
        try {
            const response = await fetch(`${API_URL}home`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            // console.log(`From isLogIn /home response: ${result}`);

            if (response.ok) {
/*                 console.log(result);
                console.log(result.friendsList.names); */
                const name = await result.userName.name;
                const Flist = await result.friendsList.names
                setUName(name);
                setFriends(Flist);
                

                //Adding friends to the redux store
                dispatch(MsgsSliceActions.addFriends(Flist))   
                
                dispatch(userProfileSliceActions.addName(name))
                dispatch(userProfileSliceActions.addNFriends(Flist.length))

                getAllMsgs()
                //console.log(`name from server: ${uname}`)

            } else {
                console.log('Please LogIn ');
            }
        } catch (err) {
            console.log(`ERR FROM Profile Compo : ${err}`);
        }
    }



    
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
                setAllMsgs(result)
                // console.log(`All Msgs from DB : ${JSON.stringify(result, null, 2)}`)
            }
    
        }
        catch(err){
            console.log(`Error From getAllMags : ${getAllMsgs}`)
        }
    }

    useEffect(() => {
        //getAllMsgs();
    },[newOnlineMsg])

    //Handling searching a friend profile
    const findUser = (e) => {
        const value = e.target.value;
        setFindFriend(value);
        // Emit the typing event with optional data
    }

    useEffect(() => {
        getUsersList(findFriend)
    },[findFriend])


// function to get all the users which contains the name of the find users
const getUsersList = async (findFriend) => {
    try {
        // console.log(findFriend);
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
        
        // Parse the JSON data
        const data = await response.json();
        if(data){
            
        }
        setSearchFriends(data)
        // console.log(`Data:`, data);

        return data; // Return the data to be used elsewhere

    } catch (error) {
        console.error('Error finding User:', error);
    }
}



    return (
        <>
            <div className={styles.homeMdiv}>
            <div >
                {/* Show the skeleton UI while loading */}
                {loading ? (
                <ContactCardSkelton />  
                ) : (
                // After loading is done, check if friends array is empty or not
                friends.length != 0 ? (
                    friends.map((contact, idx) => (
                        <Link to={`/${contact}`} key={idx} className={styles.Link}>
                          <HomeCard 
                            cname={contact} 
                            Afrds={activeUsersSet} 
                            msg={lastMsgs[idx]} 
                            ref={(ref) => (homeCardRef.current[contact] = ref)} 
                          />
                        </Link>
                      ))
                      
                    
                ) : (
                    <center>
                        <p>You are not connected to Anyone</p>
                        <br />
                        <Link to={'/friendrequests'} styles={{ textDecoration: 'none', color: 'black' }}>
                        <button>Add Friends</button>
                        </Link>
                    </center>
                )
                )}
            </div>
            </div>

        </>
    );
}

export default Home;
