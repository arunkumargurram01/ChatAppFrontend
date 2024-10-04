import React, { useState } from "react";
import styles from './AddEle.module.css'; // Import your CSS module or stylesheet

const AddEle = () => {
  const [listItems, setListItems] = useState([]);

  const handleClick = (clsname,msg) => {
    const newItem = <li key={listItems.length} className={`${styles[clsname]}`}>{msg}</li>;
    setListItems((prevItems) => [...prevItems, newItem]);
  };

  return (
    <>
      <button onClick={() => handleClick("li1",'hello')}>Add List Item 1</button>
      <button onClick={() => handleClick("li2",'hii')}>Add List Item 2</button>

      <ul>
        {listItems.map((item, index) => (
          <div key={index} className={styles[item.props.children === 'li1' ? 'li1' : 'li2']}>
            {item}
          </div>
        ))}
      </ul>
    </>
  );
};

export default AddEle;
