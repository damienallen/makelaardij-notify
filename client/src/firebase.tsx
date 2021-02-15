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

export const messaging = firebase.messaging()
const messagingKey =
    'BAE1htPUauAQLnOX9eXvBV0C-56pT9aWopiIvhJTCjSsLJf_IBU5iQju458cpOSCFfT_8N_PAf6zn4nHmt8cSAU'

export const getToken = (setTokenFound: any) => {
    return messaging
        .getToken({ vapidKey: messagingKey })
        .then((currentToken) => {
            if (currentToken) {
                console.log('current token for client: ', currentToken)
                setTokenFound(true)
                // Track the token -> client mapping, by sending to backend server
                // show on the UI that permission is secured
            } else {
                console.log('No registration token available. Request permission to generate one.')
                setTokenFound(false)
                // shows on the UI that permission is required
            }
        })
        .catch((err) => {
            console.log('An error occurred while retrieving token. ', err)
            // catch error while creating client token
        })
}
