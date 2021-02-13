import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { ListItem, Slider } from '@material-ui/core'
import { BiHomeAlt } from 'react-icons/bi'

import { useStores, minYear, maxYear } from '../../stores'

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

export const YearRange: React.FC = observer(() => {
    const { filters } = useStores()
    const classes = useStyles()

    const setYearRange = (event: any, value: number | number[]) => {
        filters.setYearRange(value as number[])
    }

    const valuetext = (value: number) => {
        return `€${value}`
    }

    const marks = [
        {
            value: 1930,
            label: '1930',
        },
        {
            value: 1990,
            label: '1990',
        },
    ]

    return (
        <ListItem>
            <div className={classes.label}>
                <BiHomeAlt />
            </div>
            <div className={classes.slider}>
                <Slider
                    value={filters.yearRange}
                    onChange={setYearRange}
                    step={10}
                    marks={marks}
                    min={minYear}
                    max={maxYear}
                    valueLabelDisplay="auto"
                    getAriaValueText={valuetext}
                />
            </div>
        </ListItem>
    )
})
