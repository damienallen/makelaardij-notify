import firebase from 'firebase/app'
import 'firebase/messaging'

// Init firebase for push notifications
const firebaseConfig = {
    apiKey: 'AIzaSyDYe0PWsuGe7v971oRQTnGTgKXbP52hhI0',
    authDomain: 'aanbod-30521.firebaseapp.com',
    projectId: 'aanbod-30521',
    storageBucket: 'aanbod-30521.appspot.com',
    messagingSenderId: '870794108318',
    appId: '1:870794108318:web:1c7fa8bf873aba6c530a8f',
}
firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()
const messagingKey =
    'BAE1htPUauAQLnOX9eXvBV0C-56pT9aWopiIvhJTCjSsLJf_IBU5iQju458cpOSCFfT_8N_PAf6zn4nHmt8cSAU'

export const getToken = (setToken: any) => {
    return messaging
        .getToken({ vapidKey: messagingKey })
        .then((currentToken) => {
            if (currentToken) {
                console.debug('FCM client token: ')
                console.debug(currentToken)
                setToken(currentToken)
            } else {
                console.debug('No registration token available, requesting permission...')
                setToken('')
            }
        })
        .catch((err) => {
            console.log('An error occurred while retrieving token. ', err)
        })
}

export const onMessageListener = () =>
    new Promise((resolve) => {
        messaging.onMessage((payload) => {
            resolve(payload)
        })
    })
