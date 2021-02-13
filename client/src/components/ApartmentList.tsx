import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { Divider, List, ListSubheader } from '@material-ui/core'

import { Listing } from './Listing'
import { useStores } from '../stores'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        list: {
            padding: 0,
        },
        subheader: {
            backgroundColor: theme.palette.primary.main,
        },
    })
)

export const ApartmentList: React.FC = observer(() => {
    const { apartments } = useStores()
    const classes = useStyles()

    const numListings = apartments.filteredList.length
    let listItems = [<ListSubheader className={classes.subheader}>Today</ListSubheader>]
    for (let i = 0; i < numListings; i++) {
        listItems.push(<Listing key={`listing-${i}`} listing={apartments.filteredList[i]} />)
        if (i < numListings - 1) {
            listItems.push(<Divider key={`divider-${i}`} component="li" />)
        }
    }

    return <List className={classes.list}>{listItems}</List>
})
