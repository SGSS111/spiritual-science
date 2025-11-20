// Firebase Cloud Function to send newsletters / single emails using SendGrid.
// Deploy this function (Firebase Functions) and set SENDGRID_API_KEY in environment variables.
// This function expects POST requests with JSON body:
// { action: 'sendNewsletter', newsletterId: '<id>' } OR
// { action: 'sendSingle', to: 'email@example.com', subject: '...', body: '...' }

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();
const db = admin.database();

exports.sendNewsletter = functions.https.onRequest(async (req, res) => {
  try {
    const { action } = req.body || {};
    const SENDGRID_KEY = functions.config().sendgrid?.key || process.env.SENDGRID_API_KEY;
    if (!SENDGRID_KEY) {
      return res.status(500).json({ error: 'SendGrid API key not configured.' });
    }
    sgMail.setApiKey(SENDGRID_KEY);

    if (action === 'sendNewsletter') {
      const { newsletterId } = req.body;
      if (!newsletterId) return res.status(400).json({ error: 'newsletterId required' });

      const newsletterSnap = await db.ref(`newsletters/${newsletterId}`).once('value');
      const newsletter = newsletterSnap.val();
      if (!newsletter) return res.status(404).json({ error: 'Newsletter not found' });

      const subsSnap = await db.ref('subscribers').once('value');
      const subs = subsSnap.val();
      if (!subs) return res.status(200).json({ message: 'No subscribers to send to' });

      const emails = Object.values(subs).map(s => s.email).filter(Boolean);

      // Batch send (SendGrid has rate limits; for many recipients, send in batches or use templates)
      const msgs = emails.map(email => ({
        to: email,
        from: 'no-reply@yourdomain.com', // change to verified sender
        subject: newsletter.subject || 'Spiritual Science Newsletter',
        text: newsletter.body || '',
        html: `<div>${newsletter.body || ''}</div>`
      }));

      // Send messages in small batches to reduce failures
      const batchSize = 50;
      for (let i = 0; i < msgs.length; i += batchSize) {
        const batch = msgs.slice(i, i + batchSize);
        await sgMail.send(batch);
      }

      await db.ref(`newsletters/${newsletterId}/sentAt`).set(Date.now());
      return res.json({ message: `Sent to ${emails.length} subscribers` });
    } else if (action === 'sendSingle') {
      const { to, subject, body } = req.body;
      if (!to || !subject || !body) return res.status(400).json({ error: 'to, subject and body required' });
      const msg = {
        to: to,
        from: 'no-reply@yourdomain.com', // change to verified sender
        subject: subject,
        text: body,
        html: `<div>${body}</div>`
      };
      await sgMail.send(msg);
      return res.json({ message: `Message sent to ${to}` });
    } else {
      return res.status(400).json({ error: 'Unknown action' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || err });
  }
});