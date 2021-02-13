import React from 'react'
import { observer } from 'mobx-react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { Drawer, Divider, List, ListItem, IconButton } from '@material-ui/core'
import { BiSliderAlt } from 'react-icons/bi'

import { useStores } from '../stores'

const useStyles = makeStyles({
    list: {
        width: 250,
    },
    fullList: {
        width: 'auto',
    },
})

export const Filters: React.FC = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return
        }

        ui.setFiltersOpen(open)
    }

    const list = (
        <div
            className={clsx(classes.list, classes.fullList)}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
                    <ListItem button key={text}>
                        {text}
                    </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                {['All mail', 'Trash', 'Spam'].map((text, index) => (
                    <ListItem button key={text}>
                        {text}
                    </ListItem>
                ))}
            </List>
        </div>
    )

    return (
        <React.Fragment>
            <IconButton onClick={toggleDrawer(true)} color="inherit">
                <BiSliderAlt />
            </IconButton>
            <Drawer anchor="bottom" open={ui.filtersOpen} onClose={toggleDrawer(false)}>
                {list}
            </Drawer>
        </React.Fragment>
    )
})
