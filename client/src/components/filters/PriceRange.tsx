import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { ListItem, Slider } from '@material-ui/core'
import { BiEuro } from 'react-icons/bi'

import { useStores, minPrice, maxPrice } from '../../stores'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        label: {
            fontSize: '2em',
            flex: 0,
        },
        slider: {
            margin: theme.spacing(0, 2.5, 0),
            flex: 1,
        },
    })
)

export const PriceRange: React.FC = observer(() => {
    const { filters } = useStores()
    const classes = useStyles()

    const setPriceRange = (event: any, value: number | number[]) => {
        filters.setPriceRange(value as number[])
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

    return (
        <ListItem>
            <div className={classes.label}>
                <BiEuro />
            </div>
            <div className={classes.slider}>
                <Slider
                    value={filters.priceRange}
                    onChange={setPriceRange}
                    step={10}
                    marks={marks}
                    min={minPrice}
                    max={maxPrice}
                    valueLabelDisplay="auto"
                    getAriaValueText={valuetext}
                />
            </div>
        </ListItem>
    )
})
