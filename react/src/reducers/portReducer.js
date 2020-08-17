const initialState = ''

const portReducer = (state = initialState, action) => {	
  switch (action.type) {	
    case 'SET_PORT': {	
      return action.port	
    }
    default:	
      return state;	
  }	
};

export default portReducer; 