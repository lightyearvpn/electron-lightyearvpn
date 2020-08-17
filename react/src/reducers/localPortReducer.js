const initialState = '1080'

const localPortReducer = (state = initialState, action) => {	
  switch (action.type) {
    case 'SET_LOCAL_PORT': {
      return action.localPort
    }
    default:
      return state;	
  }	
};

export default localPortReducer; 