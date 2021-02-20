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

// Click listener
self.addEventListener('notificationclick', function (event) {
    event.notification.close()
    event.waitUntil(clients.openWindow(event.notification.data.FCM_MSG.data['url']))
})

// Retrieve firebase messaging
const messaging = firebase.messaging()
