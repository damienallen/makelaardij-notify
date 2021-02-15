import { action, makeObservable, observable } from 'mobx'

import { Apartment } from './apartments'
import { RootStore } from './root'

export const minPrice = 150
export const maxPrice = 500

export const minArea = 50
export const maxArea = 125

export const minYear = 1900
export const maxYear = 2020

export const debounceDelay = 50

export class FilterStore {
    @observable query: string = ''

    @observable priceRange: number[] = [minPrice, maxPrice]
    @observable areaRange: number[] = [minArea, maxArea]
    @observable yearRange: number[] = [minYear, maxYear]
    @observable availability: string = 'available'

    @observable debounceTimeout: any = {}

    matchesFilter(a: Apartment) {
        // TODO: debounce inputs

        const query = this.query.toLowerCase()
        const queryMatch =
            query.length > 1
                ? a.makelaardij.toLowerCase().includes(query) ||
                  a.address.toLowerCase().includes(query)
                : true

        const aboveMinPrice =
            this.priceRange[0] <= minPrice ? true : a.asking_price / 1000 > this.priceRange[0]
        const belowMaxPrice =
            this.priceRange[1] >= maxPrice ? true : a.asking_price / 1000 < this.priceRange[1]
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
        this.root.cookies.set('priceRange', value, { path: '/', sameSite: 'lax', maxAge: 31536000 })
    }

    @action setAreaRange(value: number[]) {
        this.areaRange = value
        this.root.cookies.set('areaRange', value, { path: '/', sameSite: 'lax', maxAge: 31536000 })
    }

    @action setYearRange(value: number[]) {
        this.yearRange = value
        this.root.cookies.set('yearRange', value, { path: '/', sameSite: 'lax', maxAge: 31536000 })
    }

    @action setAvailability(value: string) {
        this.availability = value
        this.root.cookies.set('availability', value, {
            path: '/',
            sameSite: 'lax',
            maxAge: 31536000,
        })
    }

    @action setDebounceTimeout(key: string, value: any) {
        this.debounceTimeout[key] = value
    }

    @action clearDebounceTimeout(key: string) {
        this.debounceTimeout[key] = null
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
