import { app, db, storage, EMAIL_FUNCTION_URL } from './firebase-init.js';
import { ref, push, set, onValue, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { ref as sref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const adminPanel = document.getElementById('admin-panel');
const accessDenied = document.getElementById('access-denied');

// Check admin_key query param
const urlParams = new URLSearchParams(window.location.search);
const adminKey = urlParams.get('admin_key');
if (adminKey !== 'admin-end') {
  accessDenied.style.display = 'block';
  adminPanel.style.display = 'none';
} else {
  adminPanel.style.display = 'block';
  initAdmin();
}

function initAdmin(){
  setupCardForm();
  setupMediaForm();
  loadSubscribers();
  setupNewsletter();
}

// Add card
function setupCardForm(){
  const cardForm = document.getElementById('card-form');
  const cardTitle = document.getElementById('card-title');
  const cardText = document.getElementById('card-text');
  const cardMsg = document.getElementById('card-msg');
  cardForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = cardTitle.value.trim();
    const text = cardText.value.trim();
    const cardsRef = ref(db,'content/cards');
    const newRef = push(cardsRef);
    await set(newRef, { title, text, createdAt: Date.now() });
    cardMsg.textContent = 'Card added.';
    cardTitle.value = ''; cardText.value = '';
    setTimeout(()=>cardMsg.textContent='','3000');
  });
}

// Upload media
function setupMediaForm(){
  const mediaForm = document.getElementById('media-form');
  const mediaType = document.getElementById('media-type');
  const mediaTitle = document.getElementById('media-title');
  const mediaFile = document.getElementById('media-file');
  const mediaMsg = document.getElementById('media-msg');

  mediaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = mediaType.value;
    const title = mediaTitle.value.trim();
    const file = mediaFile.files[0];
    if(!file) return;
    const path = `uploads/${type}/${Date.now()}_${file.name}`;
    const storageRef = sref(storage, path);
    mediaMsg.textContent = 'Uploading...';
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      const mediaRef = ref(db, 'content/media');
      const newRef = push(mediaRef);
      await set(newRef, {
        type,
        title,
        url,
        createdAt: Date.now(),
        filename: file.name
      });
      mediaMsg.textContent = 'Upload successful.';
      mediaForm.reset();
      setTimeout(()=>mediaMsg.textContent='','3000');
    } catch (err) {
      console.error(err);
      mediaMsg.textContent = 'Upload failed: '+err.message;
    }
  });
}

// Load subscribers
function loadSubscribers(){
  const subsRef = ref(db, 'subscribers');
  const list = document.getElementById('subscribers-list');
  onValue(subsRef, (snap) => {
    list.innerHTML = '';
    const data = snap.val();
    if(!data){
      list.innerHTML = '<p>No subscribers yet.</p>';
      return;
    }
    Object.entries(data).forEach(([id, sub]) => {
      const el = document.createElement('div');
      el.className = 'subscriber';
      el.innerHTML = `<span>${escapeHtml(sub.email || '')}</span>`;
      const btns = document.createElement('div');
      const sendBtn = document.createElement('button');
      sendBtn.textContent = 'Send message';
      sendBtn.addEventListener('click', ()=>sendDirect(sub.email));
      btns.appendChild(sendBtn);
      el.appendChild(btns);
      list.appendChild(el);
    });
  });
}

// Newsletter
function setupNewsletter(){
  const form = document.getElementById('newsletter-form');
  const subj = document.getElementById('newsletter-subject');
  const body = document.getElementById('newsletter-body');
  const msg = document.getElementById('newsletter-msg');
  const sendAllBtn = document.getElementById('send-newsletter-all');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newsletterRef = ref(db, 'newsletters');
    const newRef = push(newsletterRef);
    await set(newRef, {
      subject: subj.value.trim(),
      body: body.value.trim(),
      createdAt: Date.now(),
      sent: false
    });
    msg.textContent = 'Newsletter saved.';
    subj.value=''; body.value='';
    setTimeout(()=>msg.textContent='','3000');
  });

  sendAllBtn.addEventListener('click', async () => {
    msg.textContent = 'Sending...';
    // Get the latest newsletter (simple approach: get last child)
    const newslettersSnap = await get(ref(db, 'newsletters'));
    const newsletters = newslettersSnap.val();
    if (!newsletters) { msg.textContent = 'No saved newsletter to send.'; return; }
    // pick the last saved newsletter
    const lastKey = Object.keys(newsletters).pop();
    const newsletter = newsletters[lastKey];

    if (EMAIL_FUNCTION_URL) {
      // Call your Cloud Function to actually send emails
      try {
        const res = await fetch(EMAIL_FUNCTION_URL, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ action: 'sendNewsletter', newsletterId: lastKey })
        });
        const data = await res.json();
        msg.textContent = data?.message || 'Send initiated.';
      } catch (err) {
        console.error(err);
        msg.textContent = 'Failed to call email function: '+err.message;
      }
    } else {
      // Fallback: mark newsletter as waiting to be sent; Admin must deploy function to actually send emails.
      await set(ref(db, `newsletters/${lastKey}/queuedAt`), Date.now());
      msg.textContent = 'Newsletter queued in DB. To actually deliver emails, deploy the included Cloud Function and set EMAIL_FUNCTION_URL in firebase-init.js.';
    }
    setTimeout(()=>msg.textContent='','6000');
  });
}

// Send direct message to single email
async function sendDirect(email) {
  const body = prompt(`Compose direct message to ${email}:`);
  if (!body) return;
  if (EMAIL_FUNCTION_URL) {
    try {
      const res = await fetch(EMAIL_FUNCTION_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          action: 'sendSingle',
          to: email,
          subject: `Message from Spiritual Science`,
          body
        })
      });
      const data = await res.json();
      alert(data?.message || 'Send initiated');
    } catch (err) {
      console.error(err);
      alert('Failed to call email function: '+err.message);
    }
  } else {
    // fallback - open mailto (limited)
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Message from Spiritual Science')}&body=${encodeURIComponent(body)}`;
  }
}

// Utilities
function escapeHtml(str){
  if(!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}