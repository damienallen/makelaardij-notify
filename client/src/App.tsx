import React from 'react'

import { Layout } from './components/Layout'
import { useStores } from './stores/root'
import { getToken, onMessageListener } from './firebase'

export const App: React.FC = () => {
    const { apartments, settings } = useStores()
    apartments.fetch()

    // Register FCM service worker
    getToken((found: boolean) => settings.setPushAllowed(found))

    onMessageListener()
        .then((payload: any) => {
            console.log(payload)
            apartments.fetch()
        })
        .catch((err: any) => console.log('FCM failed: ', err))

    return (
        <div id="App">
            <Layout />
        </div>
    )
}
