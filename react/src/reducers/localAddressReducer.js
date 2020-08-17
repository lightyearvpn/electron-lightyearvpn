const initialState = '127.0.0.1'

const localAddressReducer = (state = initialState, action) => {	
  switch (action.type) {
    case 'SET_LOCAL_ADDRESS': {
      return action.localAddress
    }
    default:
      return state;
  }
};

export default localAddressReducer; 