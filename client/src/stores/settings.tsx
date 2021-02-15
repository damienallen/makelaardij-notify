import { action, computed, makeObservable, observable } from 'mobx'

import { RootStore } from './root'

export class SettingStore {
    @observable host: string = 'https://aanbod.dallen.dev/api'
    @observable token: string | null = null

    @observable pushAllowed: boolean = false
    @observable pushEnabled: boolean = false

    @action setHost(value: string) {
        this.host = value
    }

    @action setToken(value: string) {
        this.token = value
    }

    @action clearToken() {
        this.token = null
    }

    @action setPushAllowed(value: boolean) {
        this.pushAllowed = value
    }

    @action setPushEnabled(value: boolean) {
        this.pushEnabled = value
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
