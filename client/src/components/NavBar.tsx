import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, fade, Theme, makeStyles } from '@material-ui/core/styles'
import { AppBar, Toolbar, IconButton, InputBase } from '@material-ui/core'
import { BiSearch, BiSliderAlt, BiSun } from 'react-icons/bi'

import { useStores } from '../stores'

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
        search: {
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: fade(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
            },
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                marginLeft: theme.spacing(1),
                width: 'auto',
            },
        },
        searchIcon: {
            padding: theme.spacing(0, 2),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        inputRoot: {
            color: 'inherit',
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                width: '12ch',
                '&:focus': {
                    width: '20ch',
                },
            },
        },
    })
)

export const NavBar: React.FC = observer(() => {
    const { settings } = useStores()
    const classes = useStyles()

    return (
        <AppBar position="fixed" color="primary" className={classes.appBar}>
            <Toolbar>
                <div className={classes.search}>
                    <div className={classes.searchIcon}>
                        <BiSearch />
                    </div>
                    <InputBase
                        placeholder="Search…"
                        classes={{
                            root: classes.inputRoot,
                            input: classes.inputInput,
                        }}
                        inputProps={{ 'aria-label': 'search' }}
                    />
                </div>
                <div className={classes.grow} />
                <IconButton color="inherit">
                    <BiSliderAlt />
                </IconButton>
                <IconButton edge="end" color="inherit">
                    <BiSun />
                </IconButton>
            </Toolbar>
        </AppBar>
    )
})
