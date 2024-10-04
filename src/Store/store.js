import { configureStore, createSlice } from '@reduxjs/toolkit';

// Define the 'counterSlice'
const counterSlice = createSlice({
    name: 'counter',
    initialState: { count: 0 },
    reducers: {
        increment(state) {
            state.count++;
        },
        decrement(state) {
            state.count--;
        }
    }
});


//Creating User Slice to store details of the user 
const userProfileSlice = createSlice({
  name : 'userprofile', //slice name for access its variables
  initialState : {
    uname : '',
    nfriends : 0,

  },
  reducers : {
    addName(state, action){
      state.uname = action.payload;
    },
    addNFriends(state, action){
      state.nfriends = action.payload;
    }
  }

})

// Define the 'msgsSlice' with a Map in the initialState
const msgsSlice = createSlice({
    name: 'allmsgs',
    initialState: { 
      msgs: new Map(),//for storing all messages which are sent from server
      friends : [] //used to store friends names and send & recived msgs 
    },
    reducers: {
      addFriends(state, action) {
        // console.log(`REDUX : AddFriends executed`);
        for (let name of action.payload) {
          const exists = state.friends.some(friendObject => Object.keys(friendObject)[0] === name);

          if (!exists) {
              // If the name is not already present, add the new friend
              const friendObject = {
                  [name]: {
                      rmsgs: [],
                      smsgs: [],
                      viewStatus: false,
                  }
              };
  
              state.friends.push(friendObject);
          }
        }
      },
        getallMsgs(state, action) {
            // Set the messages to the payload (which is a Map)
            state.msgs = action.payload;
        },
        clearAllMsgs(state) {
          // Loop through each friend in the friends array
          state.friends.forEach(friend => {
              const contactName = Object.keys(friend)[0]; // Get the contact's name
      
              // Access and clear smsgs and rmsgs for each contact
              friend[contactName].smsgs = [];  // Clear sent messages
              friend[contactName].rmsgs = [];  // Clear received messages
          });
      },
        addMsgs(state, action) { 
          const { name, msgtype, msg, time } = action.payload;
          // Find the index of the contact
          const friendIndex = state.friends.findIndex(friend => Object.keys(friend)[0] === name);
          
          if (friendIndex !== -1) {
              // Find the contact object
              const contact = state.friends[friendIndex];
              const contactName = Object.keys(contact)[0];
      
              // Check the message type and handle accordingly
              if (msgtype === 'rmsg') {
                  contact[contactName].rmsgs.push({ [msg]: time });
                  // console.log(`Redux R Msg added`);
              } else if (msgtype === 'smsg') {
                  contact[contactName].smsgs.push({ [msg]: time });
                  // console.log(`Redux S Msg added`);
              }
          } 
      },
      
        changeViewStatus(state, action) {
          //const {name} = action.payload
          const friendIndex = state.friends.findIndex(friend => Object.keys(friend)[0] === action.payload);
          const contact = state.friends[friendIndex];
          if(contact){
            const contactName = Object.keys(contact)[0];
            contact[contactName].viewStatus = true;

          }
          // alert( contact[contactName].viewStatus)
        }

    }
});

// Exporting the 'counterSlice' actions
export const CounterSliceActions = counterSlice.actions;


// Exporting the 'userProfileSlice' actions
export const userProfileSliceActions = userProfileSlice.actions;

// Exporting the 'msgsSlice' actions
export const MsgsSliceActions = msgsSlice.actions;

// Create and configure the Redux store with serializable checks disabled for msgsSlice
const store = configureStore({
  reducer: {
    counterSlice: counterSlice.reducer,
    msgsSlice: msgsSlice.reducer,
    upSlice : userProfileSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific paths and actions that involve the Map
        ignoredPaths: ['msgsSlice.msgs'],
        ignoredActions: ['allmsgs/getallMsgs'],
      },
    }),
});

export default store;
