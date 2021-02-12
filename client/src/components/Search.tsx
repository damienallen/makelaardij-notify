import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, fade, Theme, makeStyles } from '@material-ui/core/styles'
import { Input } from '@material-ui/core'
import { BiSearch } from 'react-icons/bi'

import { useStores } from '../stores'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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

export const Search: React.FC = observer(() => {
    const { filters } = useStores()
    const classes = useStyles()

    return (
        <div className={classes.search}>
            <div className={classes.searchIcon}>
                <BiSearch />
            </div>
            <Input
                placeholder="Search…"
                value={filters.query}
                onChange={(e: any) => filters.setQuery(e.target.value)}
                classes={{
                    root: classes.inputRoot,
                    input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
            />
        </div>
    )
})
