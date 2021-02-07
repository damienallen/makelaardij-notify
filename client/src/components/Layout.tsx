import React from 'react'
import { observer } from 'mobx-react'

import { NavBar } from './NavBar'
import { useStores } from '../stores'

export const Layout: React.FC = observer(() => {
    const { settings } = useStores()
    return (
        <React.Fragment>
            {settings.host}
            <NavBar />
        </React.Fragment>
    )
})
