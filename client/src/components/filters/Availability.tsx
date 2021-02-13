import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { Checkbox, FormControlLabel, FormGroup, ListItem } from '@material-ui/core'

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
        filters.setAvailability(event.target.name, event.target.checked)
    }

    return (
        <ListItem>
            <FormGroup row className={classes.group}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={filters.available}
                            onChange={handleChange}
                            name="available"
                        />
                    }
                    className={classes.control}
                    label="available"
                />
                <FormControlLabel
                    control={
                        <Checkbox checked={filters.sold} onChange={handleChange} name="sold" />
                    }
                    className={classes.control}
                    label="sold"
                />
            </FormGroup>
        </ListItem>
    )
})
