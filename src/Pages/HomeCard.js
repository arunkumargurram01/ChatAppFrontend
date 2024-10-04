import React, { forwardRef, useImperativeHandle, useState } from "react";
import styles from './singlePerson.module.css';
import { Link } from "react-router-dom";

import PofilePic from '../Images/profile.png'

// Modify HomeCard to accept ref
const HomeCard = forwardRef(({ cname, Afrds, msg }, ref) => {
    const SetArray = Array.from(Afrds);
    let dynamicStyles = styles.offline;
    const filter = SetArray.filter((user) => user === cname);
    if (filter[0] === cname) {
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

    return (
        <Link to={{ pathname: `/${cname}`, state: { cname } }} className={styles.Link} style={{ textDecoration: 'none', color: 'black' }}>
            <div className={styles.IPdiv}>
                <div className={styles.flex}>
                    <div id={styles.ppdiv} className={styles.flexItem}>
                        <div id={styles.ppic}>
                            <img src={PofilePic} className={styles.ppImg}></img>
                        </div>
                    </div>
                </div>
                <div id={styles.textDiv}>
                    <div id={styles.pname} className={styles.flexItem}>{cname}</div>
                    <div id={styles.msg}>{msg}</div>
                    <div id={styles.typingdiv}>
                        {/* Show typing animation if isTyping is true */}
                        {isTyping && (
                            <div className={styles.typing}>
                                typing<span className={styles.dots}></span>
                            </div>
                        )}
                    </div>
                </div>
                <div id={dynamicStyles}></div>
                
            </div>
        </Link>
    );
});

export default HomeCard;
