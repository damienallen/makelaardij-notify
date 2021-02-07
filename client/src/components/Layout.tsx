import React from 'react'
import { observer } from 'mobx-react'
import { ThemeProvider } from '@material-ui/core/styles'

import { NavBar } from './NavBar'
import { useStores } from '../stores'

export const Layout: React.FC = observer(() => {
    const { settings, ui } = useStores()
    return (
        <ThemeProvider theme={ui.theme}>
            {settings.host}
            <NavBar />
        </ThemeProvider>
    )
})
