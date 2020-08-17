const initialState = ''

const passwordReducer = (state = initialState, action) => {	
  switch (action.type) {	
    case 'SET_PASSWORD': {	
      return action.password	
    }
    default:	
      return state;	
  }	
};

export default passwordReducer; 