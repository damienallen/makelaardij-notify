import React from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar, IconButton, Snackbar } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { BiSliderAlt } from 'react-icons/bi'

import { Search } from './Search'
import { ThemeToggle } from './ThemeToggle'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBar: {
            top: 'auto',
            bottom: 0,
        },
        grow: {
            flexGrow: 1,
            marginLeft: theme.spacing(0.5),
        },
    })
)

export const NavBar: React.FC = () => {
    const classes = useStyles()
    const [toastOpen, setToastOpen] = React.useState(false)

    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return
        }

        setToastOpen(false)
    }

    return (
        <AppBar position="fixed" color="primary" className={classes.appBar}>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={toastOpen}
                autoHideDuration={2000}
                onClose={handleClose}
            >
                <Alert variant="filled" onClose={handleClose} severity="info">
                    Coming soon 😉
                </Alert>
            </Snackbar>

            <Toolbar>
                <Search />
                <div className={classes.grow} />
                <IconButton onClick={() => setToastOpen(true)} color="inherit">
                    <BiSliderAlt />
                </IconButton>
                <ThemeToggle />
            </Toolbar>
        </AppBar>
    )
}
