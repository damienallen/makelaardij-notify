import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, ThemeProvider, makeStyles } from '@material-ui/core/styles'
import { CssBaseline, Container } from '@material-ui/core'

import { ApartmentList } from './ApartmentList'
import { Loading } from './Loading'
import { NavBar } from './NavBar'
import { ScrollTop } from './ScrollTop'
import { useStores } from '../stores/root'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
        },
        container: {
            padding: theme.spacing(0, 0, 8),
        },
    })
)

export const Layout: React.FC = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    return (
        <ThemeProvider theme={ui.theme}>
            <CssBaseline />
            <Loading />
            <main className={classes.content}>
                <Container maxWidth="lg" className={classes.container}>
                    <ApartmentList />
                </Container>
                <ScrollTop />
            </main>
            <NavBar />
        </ThemeProvider>
    )
})
