````markdown
```markdown
# Spiritual Science — Web App (HTML/CSS/JS + Firebase)

This is a simple web app for "Spiritual Science" which supports:
- Public index page listing motivational text cards and media (images, songs, videos)
- Newsletter subscription (emails saved to Firebase Realtime Database)
- Admin page (accessed by entering the admin key "admin-end" in the search bar)
  - Add motivational text cards
  - Upload images/audio/video (stored directly as base64 data URLs in Realtime DB)
  - View subscribers
  - Create newsletters and queue/send them
  - Send direct messages to individual subscribers

Important: All app data (cards, media data URLs, subscribers, newsletters) is saved to Firebase Realtime Database; Firebase Storage is not used.

## Files included
- index.html — Public app page
- admin.html — Admin interface (only accessible with the admin key 'admin-end' via index search)
- styles.css — Basic styling
- js/firebase-init.js — Firebase initialization (replace with your config)
- js/app.js — Frontend logic for index page
- js/admin.js — Admin page logic

## Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Realtime Database (in test mode while developing).
3. Copy your Firebase config object and ensure databaseURL is set in `js/firebase-init.js`.
4. Serve the files from a static host (local testing with a simple static server or open index.html).

## Notes
- This version stores uploaded media as base64 data URLs directly in the Realtime Database. That works for small files and testing but is not suitable for large files or production.
- For production, consider using Firebase Storage or another file host and secure your database rules.
````