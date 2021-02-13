import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { ListItem, Slider } from '@material-ui/core'
import { BiEuro } from 'react-icons/bi'

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
                    min={150}
                    max={500}
                    valueLabelDisplay="auto"
                    getAriaValueText={valuetext}
                />
            </div>
        </ListItem>
    )
})
