import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { Divider, List, IconButton, Modal, Paper } from '@material-ui/core'
import { BiSliderAlt } from 'react-icons/bi'

import { Area } from './filters/Area'
import { PriceRange } from './filters/PriceRange'
import { YearRange } from './filters/YearRange'
import { useStores } from '../stores'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        list: {
            width: 'auto',
        },
        modal: {
            width: '100vw',
            maxWidth: 300,
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            top: '50%',
            left: '50%',
            outline: 0,
        },
        label: {
            flex: 0,
        },
        slider: {
            flex: 1,
            marginTop: theme.spacing(1),
            marginLeft: theme.spacing(3),
        },
    })
)

export const FilterModal: React.FC = observer(() => {
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

    return (
        <React.Fragment>
            <IconButton onClick={toggleDrawer(true)} color="inherit">
                <BiSliderAlt />
            </IconButton>
            <Modal open={ui.filtersOpen} onClose={toggleDrawer(false)}>
                <Paper classes={{ root: classes.modal }}>
                    <div
                        className={classes.list}
                        role="presentation"
                        onKeyDown={toggleDrawer(false)}
                    >
                        <List>
                            <PriceRange />
                            <Area />
                            <YearRange />
                        </List>
                        <Divider />
                    </div>
                </Paper>
            </Modal>
        </React.Fragment>
    )
})
