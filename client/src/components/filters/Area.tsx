import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { ListItem, Slider } from '@material-ui/core'
import { BiArea } from 'react-icons/bi'

import { useStores } from '../../stores'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        label: {
            fontSize: '2em',
            flex: 0,
        },
        slider: {
            flex: 1,
            marginTop: theme.spacing(1),
            marginLeft: theme.spacing(3),
        },
    })
)

export const Area: React.FC = observer(() => {
    const { filters } = useStores()
    const classes = useStyles()

    const setArea = (event: any, value: number | number[]) => {
        filters.setArea(value as number)
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
                    value={filters.area}
                    onChange={setArea}
                    step={10}
                    marks={marks}
                    min={50}
                    max={125}
                    valueLabelDisplay="auto"
                    getAriaValueText={valuetext}
                />
            </div>
        </ListItem>
    )
})
