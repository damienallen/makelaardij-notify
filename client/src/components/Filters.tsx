import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import {
    Divider,
    List,
    ListItem,
    IconButton,
    Modal,
    Paper,
    Slider,
    Typography,
} from '@material-ui/core'
import { BiSliderAlt } from 'react-icons/bi'

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

export const Filters: React.FC = observer(() => {
    const { filters, ui } = useStores()
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

    const setPriceRange = (event: any, price: number | number[]) => {
        filters.setPriceRange(price as number[])
    }

    const valuetext = (value: number) => {
        return `€${value}`
    }

    const marks = [
        {
            value: 200,
            label: '200 K',
        },
        {
            value: 325,
            label: '325 K',
        },
        {
            value: 425,
            label: '425 K',
        },
    ]

    const filterList = (
        <div className={classes.list} role="presentation" onKeyDown={toggleDrawer(false)}>
            <List>
                <ListItem>
                    <div className={classes.label}>Price</div>
                    <div className={classes.slider}>
                        <Slider
                            value={filters.priceRange}
                            onChange={setPriceRange}
                            step={10}
                            marks={marks}
                            min={150}
                            max={500}
                            valueLabelDisplay="auto"
                            getAriaValueText={valuetext}
                        />
                    </div>
                </ListItem>
            </List>
            <Divider />
        </div>
    )

    return (
        <React.Fragment>
            <IconButton onClick={toggleDrawer(true)} color="inherit">
                <BiSliderAlt />
            </IconButton>
            <Modal open={ui.filtersOpen} onClose={toggleDrawer(false)}>
                <Paper classes={{ root: classes.modal }}>{filterList}</Paper>
            </Modal>
        </React.Fragment>
    )
})
