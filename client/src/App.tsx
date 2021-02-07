import React from 'react'

import { Layout } from './components/Layout'
import { StoreProvider } from './stores'

export const App: React.FC = () => (
    <StoreProvider>
        <div id="App">
            <Layout />
        </div>
    </StoreProvider>
)
