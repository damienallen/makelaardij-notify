import React from 'react'
import { observer } from 'mobx-react'
import { IconButton } from '@material-ui/core'
import { BiMoon, BiSun } from 'react-icons/bi'

import { useStores } from '../stores'

export const ThemeToggle: React.FC = observer(() => {
    const { ui } = useStores()

    return (
        <IconButton edge="end" color="inherit" onClick={() => ui.toggleDark()}>
            {ui.dark ? <BiSun /> : <BiMoon />}
        </IconButton>
    )
})
