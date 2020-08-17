const initialState = 'not_connected'

const vpnStatusReducer = (state = initialState, action) => {	
  switch (action.type) {	
    case 'SET_VPN_STATUS': {	
      return action.vpnStatus	
    }
    default:	
      return state;	
  }	
};

export default vpnStatusReducer; 