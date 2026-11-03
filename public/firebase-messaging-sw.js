/* eslint-disable no-undef */

// Firebase compat libraries (REQUIRED for service worker)
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

// 🔥 SAME CONFIG AS lib/firebase.js
firebase.initializeApp({
  // apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  // appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,

  apiKey: "AIzaSyAPFJAG00vtnPvKOpa1QW2qFtigZMPbipY",
  authDomain: "salon-e5ed8.firebaseapp.com",
  projectId: "salon-e5ed8",
  storageBucket: "salon-e5ed8.firebasestorage.app",
  messagingSenderId: "464248896179",
  appId: "1:464248896179:web:e318cdcd075414f10d8ec6",
});

// Initialize messaging

const messaging = firebase.messaging();

// 🔔 BACKGROUND NOTIFICATION
messaging.onBackgroundMessage((payload) => {
  const title = payload.data.title;
  const options = {
    body: payload.data.body,
    data: {
      url: payload.data.clickUrl,
    },
  };

  self.registration.showNotification(title, options);
});

// 👉 CLICK → SHOP HOME PAGE
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data.url || "/pages/home";
  event.waitUntil(clients.openWindow(url));
});
