import './styles/index.css';
import React from 'react'
import ReactDOM from 'react-dom'
import { PersistGate } from 'redux-persist/integration/react'

import { Provider } from 'react-redux'
import { store, persistor } from './store';
import App from './components/App';

const rootElement = document.getElementById('root')
ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
    	<App />
    </PersistGate>
  </Provider>,
  rootElement
)