import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { Divider, List } from '@material-ui/core'

import { Listing } from './Listing'
import { useStores } from '../stores'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        list: {
            marginBottom: 32,
        },
    })
)

export const ApartmentList: React.FC = observer(() => {
    const { apartments } = useStores()
    const classes = useStyles()

    const numListings = apartments.list.length
    let listItems = []
    for (let i = 0; i < numListings; i++) {
        listItems.push(<Listing key={`listing-${i}`} listing={apartments.list[i]} />)
        if (i < numListings - 1) {
            listItems.push(<Divider key={`divider-${i}`} component="li" />)
        }
    }

    return <List className={classes.list}>{listItems}</List>
})
