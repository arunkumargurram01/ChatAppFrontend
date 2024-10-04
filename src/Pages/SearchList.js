import React from "react";
import { Link } from "react-router-dom";
import styles from './FriendRequest.module.css'

const SearchList = ({ cname}) => {
    return(
        <>
            <center>
            <Link to={{ pathname: `/search/${cname}`, state:{ cname } }} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3>{cname}</h3>
            </Link>
            </center>
        </>
    )
}

export default SearchList;