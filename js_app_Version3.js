import { db } from './firebase-init.js';
import { ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const subscribeForm = document.getElementById('subscribe-form');
const emailInput = document.getElementById('email-input');
const subscribeMsg = document.getElementById('subscribe-msg');
const cardsContainer = document.getElementById('cards');
const mediaList = document.getElementById('media-list');

searchBtn.addEventListener('click', () => {
  const val = searchInput.value.trim();
  if (val === 'admin-end') {
    // redirect to admin page with a query param so admin page checks it
    window.location.href = `admin.html?admin_key=${encodeURIComponent(val)}`;
  } else {
    alert('Search is currently only used to enter admin key. Try "admin-end" if you are admin.');
  }
});

// Subscribe
subscribeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) return;
  const subsRef = ref(db, 'subscribers');
  const newSubRef = push(subsRef);
  await set(newSubRef, {
    email,
    createdAt: Date.now()
  });
  subscribeMsg.textContent = 'Thanks for subscribing!';
  emailInput.value = '';
  setTimeout(()=>subscribeMsg.textContent='','4000');
});

// Load cards
const cardsRef = ref(db, 'content/cards');
onValue(cardsRef, (snapshot) => {
  cardsContainer.innerHTML = '';
  const data = snapshot.val();
  if (!data) {
    cardsContainer.innerHTML = '<p>No motivational texts yet.</p>';
    return;
  }
  Object.entries(data).forEach(([id, card]) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h3>${escapeHtml(card.title||'')}</h3><p>${escapeHtml(card.text||'')}</p>`;
    cardsContainer.appendChild(div);
  });
});

// Load media
const mediaRef = ref(db, 'content/media');
onValue(mediaRef, (snapshot) => {
  mediaList.innerHTML = '';
  const data = snapshot.val();
  if (!data) {
    mediaList.innerHTML = '<p>No media yet.</p>';
    return;
  }
  Object.entries(data).forEach(([id, item]) => {
    const div = document.createElement('div');
    div.className = 'media-item';
    const title = `<strong>${escapeHtml(item.title||'Untitled')}</strong><br/>`;
    if (item.type === 'image') {
      div.innerHTML = `${title}<img src="${item.url}" alt="${escapeHtml(item.title||'')}" style="max-width:100%;height:auto;border-radius:6px"/>`;
    } else if (item.type === 'audio') {
      div.innerHTML = `${title}<audio controls src="${item.url}" style="width:100%"></audio>`;
    } else if (item.type === 'video') {
      div.innerHTML = `${title}<video controls src="${item.url}" style="width:100%"></video>`;
    } else {
      div.innerHTML = `${title}<a href="${item.url}" target="_blank">Open</a>`;
    }
    mediaList.appendChild(div);
  });
});

// Utility
function escapeHtml(str){
  if(!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}