import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import SinglePerson from "./SinglePerson";
import HomeCard from "./HomeCard";

const OldHome = ({ skt }) => {
    const [uname, setUName] = useState('');
    const [friends, setFriends] = useState([]);
    const [filteredArray, setFilteredArray] = useState([]);
    const [routesReady, setRoutesReady] = useState(false);

    const socket = skt;
    const navigate  = useNavigate();


    useEffect(() => {
        CheckLogIn()
        getUserDetails();
    }, []);

//For updating friends
    useEffect(() => {
        if (friends.length > 0) {
            setRoutesReady(true);
        }
    }, [friends]);

//Checking method used to check user loged in or not
 //Method for User Login Check
 const CheckLogIn = async() => {
    //alert(`working..`)
    try {
        const response = await fetch('http://localhost:4040/islogin', {
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
            console.log(`From isLogIn Route response: ${result}`);
         }
    } 
    catch (err) {
          console.log(`Err From UserLogInCheck Method in ProductCard Compo : ${err}`)
    }
}


//Fir fetching users from database if user login
    const getUserDetails = async () => {
        try {
            const response = await fetch('http://localhost:4040/home', {
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

            if (response.ok) {
                console.log(result);
                console.log(result.friendsList.names);
                const name = await result.userName.name;
                const Flist = await result.friendsList.names;
                setUName(name);
                setFriends(Flist);

            } else {
                console.log('Please LogIn ');
            }
        } catch (err) {
            console.log(`ERR FROM Profile Compo : ${err}`);
        }
    }

    return (
        <>
            {routesReady && (
                <Routes>
                    {friends.map(name => (
                        <Route
                            key={name}
                            path={`/${name}`}
                            element={<SinglePerson cname={name} skt={socket} sname={uname} />} // Assuming sname is not required here
                        />
                    ))}
                </Routes>
            )}

            <div>
                <input type='text' value={uname} onChange={(e) => setUName(e.target.value)} placeholder="Set your name" />
               {/*  <button onClick={setUser}>Set Name</button> */}
                <br /><br />
                <div>
                    {friends.map((contact, idx) => (
                        <Link to={`/${contact}`} key={idx}>
                            <HomeCard cname={contact} />
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}

export default OldHome;
