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
        return this.list.filter((a: Apartment) => this.root.filters.matchesFilter(a))
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

export const minPrice = 150
export const maxPrice = 500

export const minArea = 50
export const maxArea = 125

export const minYear = 1900
export const maxYear = 2020

export class FilterStore {
    @observable query: string = ''

    @observable priceRange: number[] = [minPrice, maxPrice]
    @observable areaRange: number[] = [minArea, maxArea]
    @observable yearRange: number[] = [minYear, maxYear]

    @observable availability: string = 'available'

    matchesFilter(a: Apartment) {
        const query = this.query.toLowerCase()
        const queryMatch =
            query.length > 1
                ? a.makelaardij.toLowerCase().includes(query) ||
                  a.address.toLowerCase().includes(query)
                : true

        const aboveMinPrice =
            this.priceRange[0] <= minPrice ? true : a.asking_price > this.priceRange[0]
        const belowMaxPrice =
            this.priceRange[1] >= maxPrice ? true : a.asking_price < this.priceRange[1]
        const priceRangeMatch = aboveMinPrice && belowMaxPrice

        const aboveMinArea = this.areaRange[0] <= minArea ? true : a.unit.area > this.areaRange[0]
        const belowMaxArea = this.areaRange[1] >= maxArea ? true : a.unit.area < this.areaRange[1]
        const areaRangeMatch = aboveMinArea && belowMaxArea

        let yearRangeMatch = true
        if (a.building.year_constructed) {
            const aboveMinYear =
                this.yearRange[0] <= minYear
                    ? true
                    : a.building.year_constructed > this.yearRange[0]
            const belowMaxYear =
                this.yearRange[1] >= maxYear
                    ? true
                    : a.building.year_constructed < this.yearRange[1]
            yearRangeMatch = aboveMinYear && belowMaxYear
        }

        const availabilityMatch =
            this.availability === 'all'
                ? true
                : (this.availability === 'available' && a.available) ||
                  (this.availability === 'sold' && !a.available)

        return (
            queryMatch && priceRangeMatch && areaRangeMatch && yearRangeMatch && availabilityMatch
        )
    }

    @action setQuery(value: string) {
        this.query = value
    }

    @action setPriceRange(value: number[]) {
        this.priceRange = value
        this.root.cookies.set('priceRange', value)
    }

    @action setAreaRange(value: number[]) {
        this.areaRange = value
        this.root.cookies.set('areaRange', value)
    }

    @action setYearRange(value: number[]) {
        this.yearRange = value
        this.root.cookies.set('yearRange', value)
    }

    @action setAvailability(value: string) {
        this.availability = value
        this.root.cookies.set('availability', value)
    }

    constructor(public root: RootStore) {
        makeObservable(this)

        const priceRange = root.cookies.get('priceRange')
        if (priceRange) this.setPriceRange(priceRange)

        const areaRange = root.cookies.get('areaRange')
        if (areaRange) this.setAreaRange(areaRange)

        const yearRange = root.cookies.get('yearRange')
        if (yearRange) this.setYearRange(yearRange)

        const availability = root.cookies.get('availability')
        if (availability) this.setAvailability(availability)
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
