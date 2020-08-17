import { createStore, applyMiddleware } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import thunk from 'redux-thunk';
import createElectronStorage from '../utils/electronStore'

import rootReducer from '../reducers/index';  

const middleware = [thunk]; 

const persistConfig = {
  key: 'root',
  storage: createElectronStorage(),
  whitelist: [
    'ipReducer',
    'portReducer',
    'passwordReducer',
    'methodReducer',
    'modeReducer',
    'localAddressReducer',
    'localPortReducer',
    'privoxyPortReducer',
  ],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

let store = createStore(
	persistedReducer,
	applyMiddleware(...middleware), 
)
let persistor = persistStore(store)

export { store, persistor };