import React from 'react'
import ReactDOM from 'react-dom'

import { App } from './App'
import { StoreProvider } from './stores/root'
import './index.css'

// Init firebase for push notifications
import './firebase'

ReactDOM.render(
    <StoreProvider>
        <App />
    </StoreProvider>,
    document.getElementById('root')
)
