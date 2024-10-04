import { io } from 'socket.io-client';
import {useEffect, useState} from 'react'
import { Routes,Route } from 'react-router-dom';
import './App.css'
import Home from './Pages/Home';
import SinglePerson from './Pages/SinglePerson';
import HomeCard from './Pages/HomeCard';
import LogInCompo from './Pages/LogInCompo';


  // Creating Socket instance to connect users and emit and listen to events to and from the server.
const socket = io('http://localhost:4040');

function OldApp() {

  const [msg, setMsg] = useState('');
  const [SMsg, setSMsg] = useState('');

  useEffect(() => {
    socket.on('connect',() =>{
      console.log("Connected")
    },[socket])

  //To recive msgs from event name 'server-msg'
    socket.on('server-msg',(msg) => {
      setSMsg(msg)
      console.log(`msg sent : ${msg}`);
    })
    

  },[socket])


  const sendMsg = () => {
//To send msgs to all connected users
    socket.emit('allusers',msg);
    alert(`msg sended`)

  }



  //setting input/msg value
  const msgfun = (e) => {
    setMsg(e.target.value);
  }

  return (
    <>
      {/* We have to give all the routes here  */}
            <Routes>
                <Route path="/" element={<LogInCompo />}/>
                <Route path='/home' element={<Home skt={socket}/>} />
                <Route path='/:name' element={<SinglePerson cname={''} skt={socket} />} />
{/*             <Route path='/Dattu' element={<SinglePerson  cname={'Dattu'} skt={socket} sname={'Arun'}/>} />
                <Route path='/Amar' element={<SinglePerson cname={'Amar'} skt={socket} sname={'Dattu'} />}/>
                <Route path='/Harish' element={<SinglePerson cname={'Harish'} skt={socket}/>} />
                <Route path='Group-chat' element={<SinglePerson cname={'Group-chat'} skt={socket}/>} />
                   */}
            </Routes>
 
{/*      <div className="App">
      <center>
        <h1>Home page</h1>
        <input type='text' value={msg} onChange={msgfun}></input>
        <button onClick={sendMsg}>send</button>
        <h2>{SMsg}</h2>
      </center>
    </div>  */}
    {/* <Home /> */}
    </>
  );
}

export default OldApp;
