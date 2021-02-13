import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { Radio, FormControlLabel, RadioGroup, ListItem } from '@material-ui/core'

import { useStores } from '../../stores'

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
        group: {
            width: '100%',
            display: 'flex',
        },
        control: {
            flex: 1,
        },
    })
)

export const Availability: React.FC = observer(() => {
    const { filters } = useStores()
    const classes = useStyles()

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        filters.setAvailability((event.target as HTMLInputElement).value)
    }

    return (
        <ListItem>
            <RadioGroup
                value={filters.availability}
                onChange={handleChange}
                className={classes.group}
                row
            >
                <FormControlLabel
                    control={<Radio />}
                    className={classes.control}
                    label="all"
                    value="all"
                />
                <FormControlLabel
                    control={<Radio />}
                    className={classes.control}
                    label="available"
                    value="available"
                />
                <FormControlLabel
                    control={<Radio />}
                    className={classes.control}
                    label="sold"
                    value="sold"
                />
            </RadioGroup>
        </ListItem>
    )
})
