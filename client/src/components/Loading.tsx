import React from 'react'
import { observer } from 'mobx-react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'

import { useStores } from '../stores/root'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '100%',
            textAlign: 'center',
            '& img': {
                margin: '0 auto 64px auto',
                width: '80%',
                maxWidth: 420,
            },
        },
    })
)

export const Loading: React.FC = observer(() => {
    const { apartments } = useStores()
    const classes = useStyles()

    // TODO: show 'loading' vs 'no matches' text

    return apartments.filteredList.length === 0 ? (
        <div className={classes.container}>
            <img src="assets/empty_street.svg" alt="Nothing to see here" />
        </div>
    ) : null
})
