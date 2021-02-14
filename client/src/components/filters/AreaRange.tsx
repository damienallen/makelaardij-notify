import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { ListItem, Slider } from '@material-ui/core'
import { BiArea } from 'react-icons/bi'

import { useStores, debounceDelay, minArea, maxArea } from '../../stores'

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

export const AreaRange: React.FC = observer(() => {
    const { filters } = useStores()
    const classes = useStyles()
    const [inputValue, setInputValue] = useState(filters.areaRange)

    const handleChange = (event: any, value: number | number[]) => {
        // Update input immediately
        setInputValue(value as number[])

        // Debounce store update
        clearTimeout(filters.debounceTimeout['area'])
        filters.setDebounceTimeout(
            'area',
            setTimeout(function () {
                filters.clearDebounceTimeout('area')
                filters.setAreaRange(value as number[])
            }, debounceDelay)
        )
    }

    const valuetext = (value: number) => {
        return `€${value}`
    }

    const marks = [
        {
            value: 75,
            label: '75 m²',
        },
        {
            value: 100,
            label: '100 m²',
        },
    ]

    return (
        <ListItem>
            <div className={classes.label}>
                <BiArea />
            </div>
            <div className={classes.slider}>
                <Slider
                    value={inputValue}
                    onChange={handleChange}
                    step={5}
                    marks={marks}
                    min={minArea}
                    max={maxArea}
                    valueLabelDisplay="auto"
                    color="secondary"
                    getAriaValueText={valuetext}
                />
            </div>
        </ListItem>
    )
})
