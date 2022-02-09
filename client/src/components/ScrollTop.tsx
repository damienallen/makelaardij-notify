import React from 'react'
import { observer } from 'mobx-react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import { Fab } from '@material-ui/core'
import { BiError } from 'react-icons/bi'

import { useStores } from '../stores/root'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: 'fixed',
            bottom: theme.spacing(10),
            right: theme.spacing(5),
        },
    })
)

export const ScrollTop: React.FC = observer(() => {
    const { ui } = useStores()
    const classes = useStyles()

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const anchor = ((event.target as HTMLDivElement).ownerDocument || document).querySelector(
            '#top-anchor'
        )
        if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'center' })
        ui.setAlertNew(false)
    }

    return ui.alertNew ? (
        <div onClick={handleClick} role="presentation" className={classes.root}>
            <Fab color="secondary" size="small" aria-label="back to top">
                <BiError />
            </Fab>
        </div>
    ) : null
})
