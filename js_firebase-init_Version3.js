// Firebase initialization (modular SDK v9). This file is tuned to the rest of the app
// which uses Firebase v9-style modular imports. Replace values only if they differ
// in your Firebase Console.
//
// NOTE: I set databaseURL to the value you provided so the Realtime Database calls
// will work. Confirm the storageBucket value in your Console; the common bucket form
// is "<project>.appspot.com". If your Console shows a different bucket, replace it.

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// Firebase config (from your project; databaseURL set to the value you supplied)
const firebaseConfig = {
  apiKey: "AIzaSyDNSca7BztkIR75EVUC5f8_z-pGVNQEI_4",
  authDomain: "spiritual-science.firebaseapp.com",
  // Realtime Database URL you provided:
  databaseURL: "https://spiritual-science-default-rtdb.firebaseio.com/",
  projectId: "spiritual-science",
  // Confirm this in Console; change if your Console shows a different bucket name
  storageBucket: "spiritual-science.appspot.com",
  messagingSenderId: "539686245926",
  appId: "1:539686245926:web:b3b54f98d50e998687f8e7",
  measurementId: "G-F92Z7TDRWJ"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const storage = getStorage(app);

// If you deploy the Cloud Function that sends emails, set the function URL here so admin.js
// can call it. Leave empty if you are not using the server-side function.
export const EMAIL_FUNCTION_URL = ""; // e.g. "https://us-central1-<project>.cloudfunctions.net/sendNewsletter"