import React from 'react'
// import Cookies from 'universal-cookie'
import { action, computed, makeObservable, observable } from 'mobx'
import { Theme } from '@material-ui/core/styles'

import { lightTheme, darkTheme } from './theme'

// const cookies = new Cookies()

export class RootStore {
    public ui: UIStore
    public settings: SettingStore

    constructor() {
        this.ui = new UIStore(this)
        this.settings = new SettingStore(this)
    }
}

export class UIStore {
    @observable dark: boolean = false
    @observable theme: Theme = lightTheme

    @action setDark(value: boolean) {
        this.dark = value
        this.theme = this.dark ? darkTheme : lightTheme
        console.debug(`Theme set to '${this.theme.palette.type}'`)
    }

    @action toggleDark() {
        this.setDark(!this.dark)
    }

    constructor(public root: RootStore) {
        makeObservable(this)
    }
}

export class SettingStore {
    @observable host: string = 'https://aanbod.dallen.dev/api'
    @observable token: string | null = null

    @action setHost(value: string) {
        this.host = value
    }

    @action setToken(value: string) {
        this.token = value
    }

    @action clearToken() {
        this.token = null
    }

    @computed get authenticated() {
        return this.token !== null
    }

    @computed get authHeader() {
        return {
            headers: { Authorization: `Bearer ${this.token}` },
        }
    }

    constructor(public root: RootStore) {
        makeObservable(this)
    }
}

// Store helpers
export const rootStore = new RootStore()
const StoreContext = React.createContext(rootStore)

interface IStoreProvider {
    children: any
}

export const StoreProvider = ({ children }: IStoreProvider) => (
    <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
)

// Hook to use store in any functional component
export const useStores = () => React.useContext(StoreContext)
