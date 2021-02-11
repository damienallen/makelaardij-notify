import React from 'react'
import dayjs from 'dayjs'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { ListItem, Link } from '@material-ui/core'

import { Apartment } from '../stores'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            '&a': {
                textDecoration: 'none',
            },
        },
        left: {
            flex: 1,
        },
        center: {
            flex: 1,
        },
        right: {
            flex: 0,
        },
        address: {
            color: theme.palette.text.primary,
            fontSize: '1.2em',
        },
        makelaardij: {
            color: theme.palette.text.secondary,
            textTransform: 'capitalize',
        },
        price: {
            color: theme.palette.secondary.main,
            fontSize: '1.5em',
            textAlign: 'center',
        },
        added: {
            color: theme.palette.text.hint,
            textAlign: 'center',
        },
    })
)

type Props = {
    listing: Apartment
}

export const Listing: React.FC<Props> = ({ listing }) => {
    const classes = useStyles()

    return (
        <ListItem alignItems="flex-start" classes={{ root: classes.root }}>
            <div className={classes.left}>
                <Link href={listing.url} color="inherit">
                    <div className={classes.address}>{listing.address}</div>
                    <div className={classes.makelaardij}>{listing.makelaardij}</div>
                </Link>
            </div>
            <div className={classes.center}></div>
            <div className={classes.right}>
                <Link href={listing.url} color="inherit">
                    <div className={classes.price}>{`€${Math.ceil(
                        listing.asking_price / 1000
                    )} K`}</div>
                    <div className={classes.added}>{dayjs(listing.added).format()}</div>
                </Link>
            </div>
        </ListItem>
    )
}
