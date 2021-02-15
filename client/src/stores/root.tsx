import React from 'react'
import Cookies from 'universal-cookie'

import { ApartmentStore } from './apartments'
import { FilterStore } from './filters'
import { UIStore } from './ui'
import { SettingStore } from './settings'

export class RootStore {
    public cookies: Cookies
    public apartments: ApartmentStore
    public filters: FilterStore
    public ui: UIStore
    public settings: SettingStore

    constructor() {
        this.cookies = new Cookies()

        this.apartments = new ApartmentStore(this)
        this.filters = new FilterStore(this)
        this.ui = new UIStore(this)
        this.settings = new SettingStore(this)
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
