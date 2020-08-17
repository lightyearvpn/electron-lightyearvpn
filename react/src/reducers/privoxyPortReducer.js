const initialState = '1090'

const privoxyPortReducer = (state = initialState, action) => {	
  switch (action.type) {
    case 'SET_PRIVOXY_PORT': {
      return action.privoxyPort
    }
    default:
      return state;	
  }	
};

export default privoxyPortReducer; 