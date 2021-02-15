import React from 'react'
import { observer } from 'mobx-react'
import { Badge, IconButton } from '@material-ui/core'
import { BiBell, BiBellOff } from 'react-icons/bi'

import { useStores } from '../stores/root'

export const Push: React.FC = observer(() => {
    const { settings } = useStores()

    const promptAllow = () => {
        console.log('NOTE')
    }

    return !settings.pushAllowed ? (
        <IconButton color="inherit" onClick={() => promptAllow()}>
            <Badge color="secondary" variant="dot">
                <BiBellOff />
            </Badge>
        </IconButton>
    ) : (
        <IconButton color="inherit" onClick={() => promptAllow()}>
            <Badge color="secondary" variant="dot">
                {settings.pushEnabled ? <BiBell /> : <BiBellOff />}
            </Badge>
        </IconButton>
    )
})
