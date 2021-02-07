import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'

import { Layout } from './components/Layout'
import { StoreProvider } from './stores'

export const App: React.FC = () => (
    <StoreProvider>
        <div id="App">
            <CssBaseline />
            <Layout />
        </div>
    </StoreProvider>
)
