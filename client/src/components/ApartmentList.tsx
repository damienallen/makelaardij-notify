import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { Divider, List, ListItem, ListSubheader } from '@material-ui/core'

import { Listing } from './Listing'
import { useStores } from '../stores/root'

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
        all: {
            textAlign: 'center',
            width: '100%',
            cursor: 'pointer',
        },
    })
)

export const ApartmentList: React.FC = observer(() => {
    const { apartments, settings } = useStores()
    const classes = useStyles()

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

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

    const numListings = settings.showAll
        ? apartments.filteredList.length
        : Math.min(100, apartments.filteredList.length)
    let listItems = [<div id="top-anchor" key="scroll-top" />]
    for (let i = 0; i < numListings; i++) {
        const a = apartments.filteredList[i]
        const listingDate = apartments.getSortDate(a)
        const timeDiff = (today.getTime() - listingDate) / 1000 / 60 / 60 / 24

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
        } else if (numListings === 100 && !settings.showAll) {
            listItems.push(<Divider key={`divider-${i}`} component="li" />)
            listItems.push(
                <ListItem alignItems="center" onClick={() => settings.setShowAll(true)}>
                    <div className={classes.all}>Show All</div>
                </ListItem>
            )
        } else if (settings.showAll) {
            listItems.push(<Divider key={`divider-${i}`} component="li" />)
            listItems.push(
                <ListItem alignItems="center" onClick={() => settings.setShowAll(false)}>
                    <div className={classes.all}>Only Show First 100</div>
                </ListItem>
            )
        }
    }

    return <List className={classes.list}>{listItems}</List>
})
