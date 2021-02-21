import React from 'react'
import dayjs, { Dayjs } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { ListItem } from '@material-ui/core'
import { BiArea, BiDetail, BiHomeAlt, BiPurchaseTag, BiRightArrow, BiMapAlt } from 'react-icons/bi'

import { Apartment } from '../stores/apartments'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            '& a': {
                textDecoration: 'none !important',
            },
            [theme.breakpoints.up('md')]: {
                '&:hover': {
                    backgroundColor: theme.palette.secondary.main,
                },
            },
            '& svg': {
                paddingTop: 3,
                marginRight: 2,
                verticalAlign: 'baseline',
            },
            cursor: 'pointer',
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
            color: theme.palette.text.primary,
            fontSize: '1.5em',
        },
        areaPrice: {
            color: theme.palette.secondary.main,
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
            marginLeft: theme.spacing(1),
        },
        mapIcon: {
            color: theme.palette.text.hint,
            padding: theme.spacing(0, 1, 0, 0.5),
        },
    })
)

type Props = {
    listing: Apartment
}

export const Listing: React.FC<Props> = ({ listing }) => {
    const classes = useStyles()
    dayjs.extend(relativeTime)
    dayjs.extend(utc)
    dayjs.extend(timezone)
    dayjs.tz.setDefault('Europe/Amsterdam')

    let displayDate: Dayjs
    if (listing.added) {
        const addedDate = dayjs(Date.parse(listing.added))
        displayDate = dayjs().isSame(addedDate, 'day')
            ? dayjs(Date.parse(listing.entry_added))
            : addedDate
    } else {
        displayDate = dayjs(Date.parse(listing.entry_added))
    }

    const constructionYear = listing.building.year_constructed ? (
        <span>
            <BiHomeAlt />
            {listing.building.year_constructed}
        </span>
    ) : null

    const floorArea = (
        <span>
            <BiArea />
            {listing.unit.area} m&sup2;
        </span>
    )

    const energyLabel = listing.unit.energy.label ? (
        <span>
            <BiPurchaseTag />
            {listing.unit.energy.label}
        </span>
    ) : null

    const erfpacht =
        listing.unit.own_land === false ? (
            <span>
                <BiDetail />
                Erfpacht
            </span>
        ) : null

    const mapQuery = listing.address.replaceAll(' ', '+') + ',+Rotterdam'
    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + mapQuery

    const openNewTab = (e: any, url: string) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWindow) newWindow.opener = null
        e.stopPropagation()
    }

    return (
        <ListItem
            alignItems="flex-start"
            classes={{ root: classes.root }}
            onClick={(e: any) => openNewTab(e, listing.url)}
        >
            <div className={classes.left}>
                <div className={classes.address}>
                    {listing.address}{' '}
                    <span className={classes.mapIcon} onClick={(e: any) => openNewTab(e, mapsUrl)}>
                        <BiMapAlt />
                    </span>
                </div>
                <div className={classes.makelaardij}>
                    {listing.makelaardij}
                    {listing.available ? (
                        <span className={classes.available}>
                            <BiRightArrow />
                            Available
                        </span>
                    ) : null}
                </div>
                <div className={classes.meta}>
                    {constructionYear}
                    {floorArea}
                    {energyLabel}
                    {erfpacht}
                </div>
            </div>
            <div className={classes.right}>
                <div className={classes.price}>€{Math.ceil(listing.asking_price / 1000)} K</div>
                <div className={classes.areaPrice}>
                    €{Math.ceil(listing.asking_price / listing.unit.area)}/m&sup2;
                </div>
                <div className={classes.added}>{displayDate.fromNow()}</div>
            </div>
        </ListItem>
    )
}
