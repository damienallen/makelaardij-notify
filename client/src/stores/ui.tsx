import { action, makeObservable, observable } from 'mobx'
import { Theme } from '@material-ui/core/styles'

import { lightTheme, darkTheme } from '../theme'
import { RootStore } from './root'

export class UIStore {
    @observable filtersOpen: boolean = false

    @observable dark: boolean = false
    @observable theme: Theme = lightTheme

    @action setFiltersOpen(value: boolean) {
        this.filtersOpen = value
    }

    @action setDark(value: boolean) {
        this.dark = value

        const theme = value ? 'dark' : 'light'
        this.root.cookies.set('theme', theme, { path: '/', sameSite: 'lax', maxAge: 31536000 })

        this.theme = this.dark ? darkTheme : lightTheme
    }

    @action toggleDark() {
        this.setDark(!this.dark)
    }

    constructor(public root: RootStore) {
        makeObservable(this)

        const theme = root.cookies.get('theme')
        if (theme) this.setDark(theme === 'dark')
    }
}
