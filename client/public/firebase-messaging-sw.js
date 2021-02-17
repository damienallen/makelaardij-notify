// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.7/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.2.7/firebase-messaging.js')

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
    apiKey: 'AIzaSyDYe0PWsuGe7v971oRQTnGTgKXbP52hhI0',
    authDomain: 'aanbod-30521.firebaseapp.com',
    projectId: 'aanbod-30521',
    storageBucket: 'aanbod-30521.appspot.com',
    messagingSenderId: '870794108318',
    appId: '1:870794108318:web:1c7fa8bf873aba6c530a8f',
}

firebase.initializeApp(firebaseConfig)

// Retrieve firebase messaging
const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
    console.log('Received background message ', payload)

    const notificationTitle = payload.notification.title
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image,
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
})
