import React from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar } from '@material-ui/core'

import { FilterModal } from './FilterModal'
import { Push } from './Push'
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
                <Push />
                <FilterModal />
                <ThemeToggle />
            </Toolbar>
        </AppBar>
    )
}
