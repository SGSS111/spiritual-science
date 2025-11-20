```markdown
# Spiritual Science — Web App (HTML/CSS/JS + Firebase)

This is a simple web app for "Spiritual Science" which supports:
- Public index page listing motivational text cards and media (images, songs, videos)
- Newsletter subscription (emails saved to Firebase Realtime Database)
- Admin page (accessed by entering the admin key "admin-end" in the search bar)
  - Add motivational text cards
  - Upload images/audio/video (stored in Firebase Storage, metadata in Realtime DB)
  - View subscribers
  - Create newsletters and queue/send them
  - Send direct messages to individual subscribers

Important: All app data (cards, media metadata, subscribers, newsletters) is saved to Firebase Realtime Database. Uploaded media files are saved to Firebase Storage.

## Files included
- index.html — Public app page
- admin.html — Admin interface (only accessible with the admin key 'admin-end' via index search)
- styles.css — Basic styling
- js/firebase-init.js — Firebase initialization (replace with your config)
- js/app.js — Frontend logic for index page
- js/admin.js — Admin page logic
- functions/* — (Optional) Firebase Cloud Function code to actually send emails via SendGrid (see below)

## Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable:
   - Realtime Database (in test mode while developing)
   - Storage (set rules permissive for testing; tighten before production)
3. Copy your Firebase config object and replace the placeholder in `js/firebase-init.js`.
4. (Optional but recommended) To enable real email delivery:
   - Deploy the provided Cloud Function (see functions/ files).
   - Provide a SendGrid API key in the Cloud Function environment variable (SENDGRID_API_KEY).
   - Set EMAIL_FUNCTION_URL in `js/firebase-init.js` to your Cloud Function endpoint URL.
5. Serve the files from a static host (local testing with simple static server or just open index.html).

## How admin access works
- From index.html, type `admin-end` in the search input and click Go.
- The app will redirect to `admin.html?admin_key=admin-end`.
- admin.html checks URL param and will only show the admin panel if the key matches `admin-end`.
- Note: This is a simple client-side gating. For production, use Firebase Authentication (not included) or other server-side auth.

## Sending emails
- The frontend can store newsletters and create a "queued" flag in the DB, but to actually send emails you should deploy the included Cloud Function `functions/index.js` which uses SendGrid to deliver messages.
- The Cloud Function reads subscribers from Realtime Database and sends emails through SendGrid.
- If you don't want to deploy a function, the admin UI provides a mailto fallback for single recipients (manual) but it cannot reliably send bulk emails from client-side only.

## Security and production notes
- This example uses client-side gating for admin access (admin key in URL). For any real deployment, do NOT rely on this for security. Use Firebase Authentication and secure your Realtime DB and Storage rules.
- Configure Realtime Database and Storage rules to restrict writes to authenticated admin users.
- For email delivery, keep SendGrid API keys secret — store them only on server-side (Cloud Functions).

```