import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { ListItem, Slider } from '@material-ui/core'
import { BiEuro } from 'react-icons/bi'

import { useStores } from '../../stores/root'
import { debounceDelay, minPrice, maxPrice } from '../../stores/filters'

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
    const [inputValue, setInputValue] = useState(filters.priceRange)

    const handleChange = (event: any, value: number | number[]) => {
        // Update input immediately
        setInputValue(value as number[])

        // Debounce store update
        clearTimeout(filters.debounceTimeout['price'])
        filters.setDebounceTimeout(
            'price',
            setTimeout(function () {
                filters.clearDebounceTimeout('price')
                filters.setPriceRange(value as number[])
            }, debounceDelay)
        )
    }

    const valuetext = (value: number) => {
        return `€${value}`
    }

    const marks = [
        {
            value: 230,
            label: '230 K',
        },
        {
            value: 325,
            label: '325K',
        },
        {
            value: 420,
            label: '420K',
        },
    ]

    return (
        <ListItem>
            <div className={classes.label}>
                <BiEuro />
            </div>
            <div className={classes.slider}>
                <Slider
                    value={inputValue}
                    onChange={handleChange}
                    step={5}
                    marks={marks}
                    min={minPrice}
                    max={maxPrice}
                    valueLabelDisplay="auto"
                    color="secondary"
                    getAriaValueText={valuetext}
                />
            </div>
        </ListItem>
    )
})
