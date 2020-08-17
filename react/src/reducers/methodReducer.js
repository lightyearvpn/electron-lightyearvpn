const initialState = 'chacha20-ietf-poly1305'

const methodReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_METHOD': {
      return action.method
    }
    default:
      return state;	
  }	
};

export default methodReducer; 