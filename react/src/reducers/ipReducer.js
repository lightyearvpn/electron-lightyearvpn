const initialState = ''

const ipReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_IP': {
      return action.ip
    }
    default:
      return state;
  }
};

export default ipReducer; 