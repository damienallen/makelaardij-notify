import axios, { AxiosResponse, AxiosError } from 'axios'
import { action, computed, makeObservable, observable } from 'mobx'

import { RootStore } from './root'

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
