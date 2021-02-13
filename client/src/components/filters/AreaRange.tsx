import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { ListItem, Slider } from '@material-ui/core'
import { BiArea } from 'react-icons/bi'

import { useStores, minArea, maxArea } from '../../stores'

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

    const setArea = (event: any, value: number | number[]) => {
        filters.setAreaRange(value as number[])
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
                    value={filters.areaRange}
                    onChange={setArea}
                    step={10}
                    marks={marks}
                    min={minArea}
                    max={maxArea}
                    valueLabelDisplay="auto"
                    getAriaValueText={valuetext}
                />
            </div>
        </ListItem>
    )
})
