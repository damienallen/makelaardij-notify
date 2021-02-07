import React from 'react'
// import Cookies from 'universal-cookie'
import { observable, computed } from 'mobx'
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

    setDark(value: boolean) {
        this.dark = value
        this.theme = this.dark ? darkTheme : lightTheme
    }

    constructor(public root: RootStore) {}
}

export class SettingStore {
    @observable host: string = 'https://aanbod.dallen.dev/api'
    @observable token: string | null = null

    setHost(value: string) {
        this.host = value
    }

    setToken(value: string) {
        this.token = value
    }

    clearToken() {
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

    constructor(public root: RootStore) {}
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
