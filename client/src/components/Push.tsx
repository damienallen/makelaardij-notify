import React from 'react'
import { observer } from 'mobx-react'
import { Badge, IconButton } from '@material-ui/core'
import { BiBell, BiBellOff } from 'react-icons/bi'

import { useStores } from '../stores/root'
import { getToken } from '../firebase'

export const Push: React.FC = observer(() => {
    const { settings } = useStores()

    const checkPermission = () => {
        getToken((found: boolean) => settings.setPushAllowed(found))
    }

    return !settings.pushAllowed ? (
        <IconButton color="inherit" onClick={() => checkPermission()}>
            <Badge color="secondary" variant="dot">
                <BiBellOff />
            </Badge>
        </IconButton>
    ) : (
        <IconButton color="inherit" onClick={() => settings.togglePushEnabled()}>
            {settings.pushEnabled ? <BiBell /> : <BiBellOff />}
        </IconButton>
    )
})
