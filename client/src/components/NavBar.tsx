import React from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar, IconButton } from '@material-ui/core'
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

    return (
        <AppBar position="fixed" color="primary" className={classes.appBar}>
            <Toolbar>
                <Search />
                <div className={classes.grow} />
                <IconButton color="inherit">
                    <BiSliderAlt />
                </IconButton>
                <ThemeToggle />
            </Toolbar>
        </AppBar>
    )
}
