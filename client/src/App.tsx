import React from 'react'
import { Provider } from 'mobx-react'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ThemeProvider } from '@material-ui/core/styles'

import { Layout } from './components/Layout'
import { RootStore } from './stores'

export const App: React.FC = () => {
    const stores = new RootStore()

    return (
        <Provider root={stores} settings={stores.settings} ui={stores.ui}>
            <ThemeProvider theme={stores.ui.theme}>
                <div id="App">
                    <CssBaseline />
                    <Layout />
                </div>
            </ThemeProvider>
        </Provider>
    )
}
