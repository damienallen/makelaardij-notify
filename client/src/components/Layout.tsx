import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, ThemeProvider, makeStyles } from '@material-ui/core/styles'
import { CssBaseline, Container } from '@material-ui/core'

import { NavBar } from './NavBar'
import { useStores } from '../stores'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBarSpacer: theme.mixins.toolbar,
        content: {
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
        },
        container: {
            paddingTop: theme.spacing(4),
            paddingBottom: theme.spacing(4),
        },
    })
)

export const Layout: React.FC = observer(() => {
    const { settings, ui } = useStores()
    const classes = useStyles()

    return (
        <ThemeProvider theme={ui.theme}>
            <CssBaseline />
            <main className={classes.content}>
                <div className={classes.appBarSpacer} />
                <Container maxWidth="lg" className={classes.container}>
                    {settings.host}
                </Container>
            </main>
            <NavBar />
        </ThemeProvider>
    )
})
