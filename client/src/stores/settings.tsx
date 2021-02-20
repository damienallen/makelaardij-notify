import { action, computed, makeObservable, observable } from 'mobx'
import axios, { AxiosResponse, AxiosError } from 'axios'
import { onMessageListener } from '../firebase'

import { RootStore } from './root'

export class SettingStore {
    @observable host: string = 'https://aanbod.dallen.dev/api'
    @observable token: string | null = null

    @observable fcmToken: string = ''
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

    @action setFCMToken(value: string) {
        this.fcmToken = value
        if (value) {
            // Register message handler
            console.log('Registering FCM listener')
            onMessageListener()
                .then((payload: any) => {
                    console.log('FCM payload: ', payload)
                    this.root.ui.setAlertNew(true)
                    this.root.apartments.fetch()
                })
                .catch((err: any) => console.log('FCM failed: ', err))

            if (this.root.cookies.get('pushEnabled') !== 'false') {
                this.setPushEnabled(true)
            } else {
                this.updateSubscription()
            }
        }
    }

    updateSubscription() {
        if (this.fcmToken && this.root.filters) {
            const sub = {
                filter: {
                    price: {
                        high: this.root.filters.priceRange[1],
                        low: this.root.filters.priceRange[0],
                    },
                    area: {
                        high: this.root.filters.areaRange[1],
                        low: this.root.filters.areaRange[0],
                    },
                    year: {
                        high: this.root.filters.yearRange[1],
                        low: this.root.filters.yearRange[0],
                    },
                    availability: this.root.filters.availability,
                },
                token: this.root.settings.fcmToken,
                active: this.root.settings.pushEnabled,
            }

            axios
                .post(`${this.root.settings.host}/subs/`, sub)
                .then((response: AxiosResponse) => {
                    console.debug('Subscription updated:', response.data, sub)
                })
                .catch((error: AxiosError) => {
                    console.error(error.response)
                })
        }
    }

    @action setPushEnabled(value: boolean) {
        this.pushEnabled = value
        this.root.cookies.set('pushEnabled', this.pushEnabled, {
            path: '/',
            sameSite: 'lax',
            maxAge: 31536000,
        })
        this.updateSubscription()
    }

    @action togglePushEnabled() {
        this.setPushEnabled(!this.pushEnabled)
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

        const pushEnabled = root.cookies.get('pushEnabled')
        this.setPushEnabled(pushEnabled === 'true')
    }
}
