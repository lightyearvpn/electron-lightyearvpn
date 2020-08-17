// Imports: Dependencies
import { combineReducers } from 'redux';

// Imports: Reducers
import vpnStatusReducer from './vpnStatusReducer';
import ipReducer from './ipReducer';
import portReducer from './portReducer';
import passwordReducer from './passwordReducer';
import methodReducer from './methodReducer';
import modeReducer from './modeReducer';
import localAddressReducer from './localAddressReducer';
import localPortReducer from './localPortReducer';
import privoxyPortReducer from './privoxyPortReducer';

// Redux: Root Reducer
const rootReducer = combineReducers({
	vpnStatusReducer,
	ipReducer,
	portReducer,
	passwordReducer,
	methodReducer,
	modeReducer,
	localAddressReducer,
	localPortReducer,
	privoxyPortReducer,
});	

// Exports
export default rootReducer; 
