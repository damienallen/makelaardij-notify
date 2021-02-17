import { action, computed, makeObservable, observable } from 'mobx'
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
            this.pushEnabled = true
        }
    }

    @action setPushEnabled(value: boolean) {
        this.pushEnabled = value
    }

    @action togglePushEnabled() {
        this.pushEnabled = !this.pushEnabled
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
