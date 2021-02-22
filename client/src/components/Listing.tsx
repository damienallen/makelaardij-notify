import React from 'react'
import dayjs, { Dayjs } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { ListItem } from '@material-ui/core'
import { BiArea, BiDetail, BiHomeAlt, BiPurchaseTag, BiMap } from 'react-icons/bi'

import { Apartment } from '../stores/apartments'

type StyleProps = {
    available: boolean
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1),
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
            flex: '0 0 80px',
            textAlign: 'right',
        },
        address: {
            color: theme.palette.text.primary,
            fontSize: '1.2em',
        },
        makelaardij: {
            color: theme.palette.text.secondary,
            textTransform: 'uppercase',
            fontSize: '0.8em',
            padding: theme.spacing(0.5, 0),
        },
        price: (props: StyleProps) => ({
            color:
                props.available === false
                    ? theme.palette.text.secondary
                    : theme.palette.text.primary,
            fontSize: '1.5em',
            textDecoration: props.available === false ? 'line-through' : 'none',
        }),
        areaPrice: {
            color: (props: StyleProps) =>
                props.available === false ? theme.palette.text.hint : theme.palette.text.secondary,
            fontSize: '0.8em',
        },
        added: {
            color: theme.palette.text.hint,
            marginTop: theme.spacing(1),
            fontSize: '0.9em',
        },
        meta: {
            marginTop: theme.spacing(0.5),
            '& span': {
                marginRight: theme.spacing(1),
            },
        },
        sold: {
            color: theme.palette.error.main,
            marginLeft: theme.spacing(0.5),
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
    const styleProps: StyleProps = { available: listing.available }
    const classes = useStyles(styleProps)
    dayjs.extend(relativeTime)
    dayjs.extend(utc)
    dayjs.extend(timezone)
    dayjs.tz.setDefault('Europe/Amsterdam')

    let displayDate: Dayjs
    if (listing.added) {
        const addedDate = dayjs(Date.parse(listing.added + 'Z'))
        displayDate = dayjs().isSame(addedDate, 'day')
            ? dayjs(Date.parse(listing.entry_added + 'Z'))
            : addedDate
    } else {
        displayDate = dayjs(Date.parse(listing.entry_added + 'Z'))
    }

    const constructionYear = listing.building.year_constructed ? (
        <span>
            <BiHomeAlt />
            {listing.building.year_constructed}
        </span>
    ) : null

    const floorArea =
        listing.unit.area > 0 ? (
            <span>
                <BiArea />
                {listing.unit.area} m&sup2;
            </span>
        ) : null

    const energyLabel =
        listing.unit.energy.label && 'ABCDEFG'.includes(listing.unit.energy.label) ? (
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
                        <BiMap />
                    </span>
                </div>
                <div className={classes.makelaardij}>
                    {listing.makelaardij}
                    {!listing.available ? <span className={classes.sold}>Sold</span> : null}
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
                    €
                    {listing.unit.area > 0
                        ? Math.ceil(listing.asking_price / listing.unit.area)
                        : ' —'}
                    /m&sup2;
                </div>
                <div className={classes.added}>{displayDate.fromNow()}</div>
            </div>
        </ListItem>
    )
}
