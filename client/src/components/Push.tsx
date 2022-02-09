import React from 'react'
import { observer } from 'mobx-react'
import { Badge, IconButton } from '@material-ui/core'
import { BiBell, BiBellOff } from 'react-icons/bi'

import { useStores } from '../stores/root'
import { getToken } from '../firebase'

export const Push: React.FC = observer(() => {
    const { settings } = useStores()

    const checkPermission = () => {
        getToken((token: string) => settings.setFCMToken(token))
    }

    const noTokenIcon = (
        <IconButton color="inherit" onClick={() => checkPermission()}>
            <Badge color="error" variant="dot">
                <BiBellOff />
            </Badge>
        </IconButton>
    )

    const icon = (
        <IconButton color="inherit" onClick={() => settings.togglePushEnabled()}>
            {settings.pushEnabled ? <BiBell /> : <BiBellOff />}
        </IconButton>
    )

    return settings.fcmToken === '' ? noTokenIcon : icon
})
