import React from 'react'
import dayjs from 'dayjs'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { ListItem, ListItemText, Typography } from '@material-ui/core'

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

export interface ApartmentJSON {
    url: string
    address: string
    asking_price: number
    added: string
}

type Props = {
    ind: number
}

export const Listing: React.FC<Props> = observer(({ ind }) => {
    const { apartments } = useStores()
    const classes = useStyles()

    const listing = apartments.list[ind]

    return (
        <ListItem key={`listing-${ind}`} alignItems="flex-start">
            <a href={listing.url}>
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
                            {` - ${dayjs(listing.added).format()}`}
                        </React.Fragment>
                    }
                />
            </a>
        </ListItem>
    )
})
