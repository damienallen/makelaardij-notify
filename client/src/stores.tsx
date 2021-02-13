import axios, { AxiosResponse, AxiosError } from 'axios'
import React from 'react'
// import Cookies from 'universal-cookie'
import { action, computed, makeObservable, observable } from 'mobx'
import { Theme } from '@material-ui/core/styles'

import { lightTheme, darkTheme } from './theme'

// const cookies = new Cookies()

export class RootStore {
    public apartments: ApartmentStore
    public filters: FilterStore
    public ui: UIStore
    public settings: SettingStore

    constructor() {
        this.apartments = new ApartmentStore(this)
        this.filters = new FilterStore(this)
        this.ui = new UIStore(this)
        this.settings = new SettingStore(this)
    }
}

export interface Building {
    year_constructed?: number
    building_type?: string
    roof_type?: string
    roof_material?: string
    num_floors?: number
    parking?: string
}

export interface Energy {
    heating?: string
    water?: string
    label?: string
}

export interface Unit {
    area: number
    volume?: number
    energy: Energy

    vve_cost?: number
    own_land?: boolean
    num_bathrooms?: number
    num_rooms?: number
    tags: string[]
}

export interface Apartment {
    makelaardij: string
    uuid: string
    asking_price: number
    address: string
    url: string
    photos: string[]
    available: boolean
    hidden: boolean

    unit: Unit
    building: Building

    entry_added: string
    entry_updated: string
    added: string
    updated?: string
}

export class ApartmentStore {
    @observable list: Apartment[] = []

    @action setList(value: Apartment[]) {
        this.list = value
        this.list.sort((a: Apartment, b: Apartment) => {
            return this.getSortDate(b) - this.getSortDate(a)
        })
    }

    getSortDate(a: Apartment) {
        return a.added ? Date.parse(a.added) : Date.parse(a.entry_added)
    }

    @computed get filteredList() {
        const query = this.root.filters.query.toLowerCase()
        return this.list.filter((a: Apartment) => {
            const queryMatch =
                query.length > 1
                    ? a.makelaardij.toLowerCase().includes(query) ||
                      a.address.toLowerCase().includes(query)
                    : true
            return queryMatch && (a.available || a.added)
        })
    }

    fetch() {
        const url = `${this.root.settings.host}/apartments/`
        console.log(`[GET] ${url}`)
        axios
            .get(url)
            .then((response: AxiosResponse) => {
                this.setList(response.data)
            })
            .catch((error: AxiosError) => {
                console.error(error.response)
            })
    }

    constructor(public root: RootStore) {
        makeObservable(this)
    }
}

export class FilterStore {
    @observable query: string = ''

    @action setQuery(value: string) {
        this.query = value
    }

    constructor(public root: RootStore) {
        makeObservable(this)
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
