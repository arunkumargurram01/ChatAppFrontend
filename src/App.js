import { io } from 'socket.io-client';
import {useEffect, useState, useRef} from 'react'
import { Routes,Route,Link,useNavigate, Redirect } from 'react-router-dom';
import './App.css'
import Home from './Pages/Home';
import SearchProfile from './Pages/SearchProfile';
import SearchList from './Pages/SearchList';
import SinglePerson from './Pages/SinglePerson';
import HomeCard from './Pages/HomeCard';
import LogInCompo from './Pages/LogInCompo';
import AppCompo from './App';
import FriendRequests from './Pages/FriendRequests';
import UserProfile from './Pages/UserProfile';
import SignupCompo from './Pages/SignUp';
import ContactProfile from './Pages/ContactProfile';


import { HomeProvider } from './Pages/Home';
import { useSelector } from 'react-redux';

// Images
import profileIcon from './Images/profile.png'
import chatIcon from './Images/friendRequests.png'
import homeIcon from './Images/chat.png'

const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Creating Socket instance to connect users and emit and listen to events to and from the server.
const socket = io(`${API_URL}`);

function App() {
  
  const [loginStatus, setLoginStatus] = useState(false);
  const [uname, setUName] = useState('');
  const [friends, setFriends] = useState([]);
  const [msg, setMsg] = useState('');
  const [SMsg, setSMsg] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [activeUsersSet, setActiveUsersSet] = useState(new Set());
  const [disconnectedFrd, setDisconnectedFrd] = useState([]);
  const [IndicatorVal,setIndicatorVal] = useState(false);
  const [ItemNum,setItemNum] = useState(0)
  

  const navigate = useNavigate();

  // Create a ref to access the typingMsg function in SinglePerson component
  const singlePersonRef = useRef(null);

  //calling checkLogin Method 
  useEffect(() => {
    CheckLogIn()
  }, []);


  //setting active users from socket events
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

//to delete the disconnected frd from online to offline
useEffect( () => {
  const dname = disconnectedFrd;
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
      // alert(`Result : ${result.requests.length}`); // Check if data is received
       // Update state
       setItemNum(result.requests.length)
    }
  } catch (err) {
    console.log(`ERROR from getRequests method: ${err}`);
  }
};

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
          setLoginStatus('true');
          getRequests();
          navigate('/');
          // console.log(`From isLogIn Route response: ${result}`);
       }
  } 
  catch (err) {
        console.log(`Err From UserLogInCheck Method in ProductCard Compo : ${err}`)
  }
}



  //Sokect connection using useEffect
    useEffect(() => {
      socket.on('connect',() =>{
        console.log("Connected")
    },[socket])

    },[socket]);

  const count = useSelector((state) => state.counterSlice.count)

  // //To call typing msg function 
  useEffect(() => {
    socket.on('sender-typing',({name}) => {
        triggerTypingMsg();
        // handleTyping(name)
        // console.log(`${name}, typing`)
    })
  },[socket])


    // Function to simulate when to call the typingMsg function
    const triggerTypingMsg = () => {
      if (singlePersonRef.current) {
        // Call the typingMsg function exposed via the ref
        singlePersonRef.current.typingMsg();
      }
    };


    //Indicater CSS Code 
    /* Code To Display and add styles for cart Items Indicator*/
    var Indicator = 'none'

    useEffect(() => {
      if(ItemNum != 0){
        // alert('executed')
        setIndicatorVal(true)
      }
    },[ItemNum])
           
    if(IndicatorVal == true){
        Indicator = 'Indicator'
    }

    //To remove the CartIndecator when we click on the Cart
    const resetIndicator = () =>{
        setIndicatorVal(false)
    }


  return (
    <>

      {/* App Header */}
      <div className='hdiv'>
        <div className='tdiv'>Text Me</div>
      </div>

      {/* We have to give all the routes here  */}
            <Routes>
                <Route path='/:name' element={<HomeProvider skt={socket}><SinglePerson skt={socket} Afrds={activeUsersSet} ref={singlePersonRef} /></HomeProvider>} />
                <Route path='/profile' element={<SearchProfile skt={socket}></SearchProfile>} />
                <Route path='/userprofile' element={<UserProfile skt={socket}></UserProfile>} />
                <Route path='/' element={<HomeProvider skt={socket} ><Home skt={socket}/></HomeProvider>} />
                <Route path="/login" element={<LogInCompo />}/>
                <Route path="/signup" element={<SignupCompo />}/>
                <Route path="/friendrequests" element={<FriendRequests />}/>
                <Route path='/search/:name' element={<SearchProfile />} />
                <Route path='/contactProfile/:name' element={<ContactProfile />} />
                {/* Fallback route to redirect to HomePage */}
                <Route element={<HomeProvider skt={socket} ><Home skt={socket}/></HomeProvider>} />
                {/* <Route path=':name' element={<SinglePerson skt={socket} />} /> */}
{/*                 <Route path='friends'>
                </Route> */}
            </Routes>
 
          {/* Home page Jsx */}
{/*           <div>
            {true ? (
              <h1></h1>
            ) : ( <span></span>)}
          </div> */}

                      {/* Down Bar Jsx */}
            <div className='DN_div'>
                <div className='opt_div'>
                    <Link to='/'><img className='fimgs' src={homeIcon}/></Link>
                </div>
                <div className='opt_div'>
                    <Link to='/userprofile'><img className='fimgs' src={profileIcon}/></Link>
                </div>
                <div className='opt_div'>
                    <Link to={`friendrequests`}><img className='fimgs' src={chatIcon}  onClick={resetIndicator}/></Link>
                    <div id={Indicator}>
                        <div>{ItemNum}</div>
                    </div> 
                </div>
            </div>

    </>
  );
}

export default App;
