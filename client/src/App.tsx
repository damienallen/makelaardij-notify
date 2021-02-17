import React from 'react'

import { Layout } from './components/Layout'
import { useStores } from './stores/root'
import { getToken } from './firebase'

export const App: React.FC = () => {
    const { apartments, settings } = useStores()
    apartments.fetch()

    // Register FCM service worker
    getToken((token: string) => settings.setFCMToken(token))

    return (
        <div id="App">
            <Layout />
        </div>
    )
}
