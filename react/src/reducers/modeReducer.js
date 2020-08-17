const initialState = 'global'

const modeReducer = (state = initialState, action) => {	
  switch (action.type) {	
    case 'SET_MODE': {	
      return action.mode	
    }
    default:	
      return state;	
  }	
};

export default modeReducer; 