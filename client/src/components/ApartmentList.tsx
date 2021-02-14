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
            maxWidth: 580,
            margin: '0 auto',
        },
        subheader: {
            backgroundColor: theme.palette.primary.main,
        },
    })
)

export const ApartmentList: React.FC = observer(() => {
    const { apartments } = useStores()
    const classes = useStyles()

    const now = Date.now()
    const threholds = [
        { label: 'Today', value: 0 },
        { label: 'Yesterday', value: 1 },
        { label: 'This Week', value: 2 },
        { label: 'Last Week', value: 7 },
        { label: 'This Month', value: 14 },
        { label: 'Last Month', value: 30 },
        { label: 'Last Year', value: 60 },
        { label: 'Way Back', value: 365 },
    ]

    const numListings = apartments.filteredList.length
    let listItems = []

    for (let i = 0; i < numListings; i++) {
        const a = apartments.filteredList[i]
        const listingDate = apartments.getSortDate(a)
        const timeDiff = (now - listingDate) / 1000 / 60 / 60 / 24

        if (threholds[0] && timeDiff > threholds[0].value) {
            const nextThreshold = threholds.shift()
            listItems.push(
                <ListSubheader
                    key={`subheader-${nextThreshold!.label}`}
                    className={classes.subheader}
                >
                    {nextThreshold!.label}
                </ListSubheader>
            )
        }

        listItems.push(<Listing key={`listing-${i}`} listing={a} />)
        if (i < numListings - 1) {
            listItems.push(<Divider key={`divider-${i}`} component="li" />)
        }
    }

    return <List className={classes.list}>{listItems}</List>
})
