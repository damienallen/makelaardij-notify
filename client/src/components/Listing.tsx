import React from 'react'
import { toJS } from 'mobx'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { ListItem, Link } from '@material-ui/core'
import { BiArea, BiHomeAlt, BiPurchaseTag } from 'react-icons/bi'

import { Apartment } from '../stores'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            '& a': {
                textDecoration: 'none !important',
            },
            '&:hover': {
                backgroundColor: theme.palette.secondary.main,
            },
            '& svg': {
                paddingTop: 2,
                marginRight: 2,
                verticalAlign: 'baseline',
            },
        },
        left: {
            flex: 1,
        },
        right: {
            flex: '0 0 100px',
            textAlign: 'right',
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
            color: theme.palette.warning.main,
            fontSize: '1.5em',
        },
        areaPrice: {
            color: theme.palette.primary.main,
            fontSize: '0.9em',
        },
        added: {
            color: theme.palette.text.hint,
            marginTop: theme.spacing(1),
        },
        meta: {
            marginTop: theme.spacing(1),
            '& span': {
                marginRight: theme.spacing(1),
            },
        },
        available: {
            color: theme.palette.success.main,
        },
    })
)

type Props = {
    listing: Apartment
}

export const Listing: React.FC<Props> = ({ listing }) => {
    const classes = useStyles()
    dayjs.extend(relativeTime)

    console.debug(toJS(listing))

    return (
        <ListItem alignItems="flex-start" classes={{ root: classes.root }}>
            <div className={classes.left}>
                <Link href={listing.url} target="_blank" rel="noreferrer" color="inherit">
                    <div className={classes.address}>{listing.address}</div>
                    <div className={classes.makelaardij}>
                        {listing.makelaardij}
                        {listing.available ? (
                            <span className={classes.available}>Available</span>
                        ) : null}
                    </div>
                    <div className={classes.meta}>
                        <span>
                            <BiHomeAlt />
                            {listing.building.year_constructed}
                        </span>
                        <span>
                            <BiPurchaseTag />
                            {listing.unit.energy.label}
                        </span>
                        <span>
                            <BiArea />
                            {listing.unit.area} m&sup2;
                        </span>
                    </div>
                </Link>
            </div>
            <div className={classes.right}>
                <Link href={listing.url} target="_blank" rel="noreferrer" color="inherit">
                    <div className={classes.price}>€{Math.ceil(listing.asking_price / 1000)} K</div>
                    <div className={classes.areaPrice}>
                        €{Math.ceil(listing.asking_price / listing.unit.area)}/m&sup2;
                    </div>
                    <div className={classes.added}>
                        {dayjs(Date.parse(listing.added)).fromNow()}
                    </div>
                </Link>
            </div>
        </ListItem>
    )
}
