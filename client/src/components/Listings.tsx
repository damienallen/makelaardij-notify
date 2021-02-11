import React from 'react'
import dayjs from 'dayjs'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { Divider, List, ListItem, ListItemText, Typography } from '@material-ui/core'

import { useStores } from '../stores'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: '36ch',
            backgroundColor: theme.palette.background.paper,
        },
        inline: {
            display: 'inline',
        },
    })
)

export const Listings: React.FC = observer(() => {
    const { apartments } = useStores()
    const classes = useStyles()

    console.log(apartments.list)

    const numListings = apartments.list.length
    let listItems = []
    for (let i = 0; i < numListings; i++) {
        const listing = apartments.list[i]
        listItems.push(
            <ListItem key={`listing-${i}`} alignItems="flex-start">
                <a href={listing.listing_url}>
                    <ListItemText
                        primary={listing.address}
                        secondary={
                            <React.Fragment>
                                <Typography
                                    component="span"
                                    variant="body2"
                                    className={classes.inline}
                                    color="textPrimary"
                                >
                                    {`€${listing.asking_price / 1000}K`}
                                </Typography>
                                {` - ${dayjs(listing.listing_added).format()}`}
                            </React.Fragment>
                        }
                    />
                </a>
            </ListItem>
        )
        if (i < numListings - 1) {
            listItems.push(<Divider key={`divider-${i}`} component="li" />)
        }
    }

    return <List>{listItems}</List>
})
