import React from 'react'

import { Layout } from './components/Layout'
import { useStores } from './stores/root'

export const App: React.FC = () => {
    const { apartments } = useStores()
    apartments.fetch()

    return (
        <div id="App">
            <Layout />
        </div>
    )
}
