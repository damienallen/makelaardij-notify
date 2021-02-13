import axios, { AxiosResponse, AxiosError } from 'axios'
import React from 'react'
import Cookies from 'universal-cookie'
import { action, computed, makeObservable, observable } from 'mobx'
import { Theme } from '@material-ui/core/styles'

import { lightTheme, darkTheme } from './theme'

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

    @observable priceRange: number[] = [0, 500]
    @observable area: number = 125
    @observable yearRange: number[] = [1900, 2020]

    @observable available: boolean = true
    @observable sold: boolean = false

    @action setQuery(value: string) {
        this.query = value
    }

    @action setPriceRange(value: number[]) {
        this.priceRange = value
        this.root.cookies.set('priceRange', value)
    }

    @action setArea(value: number) {
        this.area = value
        this.root.cookies.set('area', value)
    }

    @action setYearRange(value: number[]) {
        this.yearRange = value
        this.root.cookies.set('yearRange', value)
    }

    @action setAvailability(key: string, value: boolean) {
        if (key === 'available') {
            this.available = value
            this.root.cookies.set('available', value)
        } else if (key === 'sold') {
            this.sold = value
            this.root.cookies.set('sold', value)
        }
    }

    constructor(public root: RootStore) {
        makeObservable(this)

        const priceRange = root.cookies.get('priceRange')
        if (priceRange) this.setPriceRange(priceRange)

        const area = root.cookies.get('area')
        if (area) this.setArea(area)

        const yearRange = root.cookies.get('yearRange')
        if (yearRange) this.setYearRange(yearRange)

        const available = root.cookies.get('available')
        if (available) this.setAvailability('available', available)

        const sold = root.cookies.get('sold')
        if (sold) this.setAvailability('sold', sold)
    }
}

export class UIStore {
    @observable filtersOpen: boolean = true

    @observable dark: boolean = false
    @observable theme: Theme = lightTheme

    @action setFiltersOpen(value: boolean) {
        this.filtersOpen = value
    }

    @action setDark(value: boolean) {
        this.dark = value
        this.root.cookies.set('dark', value)

        this.theme = this.dark ? darkTheme : lightTheme
    }

    @action toggleDark() {
        this.setDark(!this.dark)
    }

    constructor(public root: RootStore) {
        makeObservable(this)

        const isDark = root.cookies.get('dark')
        if (isDark) this.setDark(true)
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
