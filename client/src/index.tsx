import React from 'react'
import ReactDOM from 'react-dom'

import { App } from './App'
import { StoreProvider } from './stores/root'
import './index.css'

import firebase from 'firebase/app'

// Init firebase for push notifications
const firebaseConfig = {
    apiKey: 'AIzaSyDYe0PWsuGe7v971oRQTnGTgKXbP52hhI0',
    authDomain: 'aanbod-30521.firebaseapp.com',
    projectId: 'aanbod-30521',
    storageBucket: 'aanbod-30521.appspot.com',
    messagingSenderId: '870794108318',
    appId: '1:870794108318:web:1c7fa8bf873aba6c530a8f',
}
firebase.initializeApp(firebaseConfig)

ReactDOM.render(
    <StoreProvider>
        <App />
    </StoreProvider>,
    document.getElementById('root')
)
