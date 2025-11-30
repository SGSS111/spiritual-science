import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, increment, runTransaction } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQZKQzsMsawdVOTZzBlN6FsvQiDQThn3A",
  authDomain: "spiritualscience.firebaseapp.com",
  databaseURL: "https://spiritualscience-default-rtdb.firebaseio.com",
  projectId: "spiritualscience",
  storageBucket: "spiritualscience.firebasestorage.app",
  messagingSenderId: "787715422858",
  appId: "1:787715422858:web:b99889e1e3162a379d4b73"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Track daily visits
const today = new Date().toISOString().split('T')[0];
const visitsRef = ref(db, 'visits/' + today);
runTransaction(visitsRef, (current) => (current || 0) + 1);

// Navigation
document.querySelectorAll('.nav-item, .card').forEach(el => {
  el.addEventListener('click', () => {
    const page = el.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page)?.classList.add('active');
  });
});

// Load Lessons & Media
function loadContent() {
  onValue(ref(db, 'lessons'), (snap) => {
    const container = document.getElementById('lessonsContainer');
    container.innerHTML = '';
    snap.val() && Object.entries(snap.val()).forEach(([id, lesson]) => {
      container.innerHTML += `<div class="lesson-card"><h3>${lesson.title}</h3><p>${lesson.content}</p></div>`;
    });
  });

  onValue(ref(db, 'media'), (snap) => {
    const container = document.getElementById('mediaContainer');
    container.innerHTML = '';
    snap.val() && Object.entries(snap.val()).forEach(([id, item]) => {
      if (item.type === 'image') container.innerHTML += `<img src="${item.url}" class="media-item" style="max-width:100%;border-radius:15px;">`;
      if (item.type === 'video') container.innerHTML += `<iframe src="${item.url}" class="media-item" style="width:100%;height:300px;border:none;"></iframe>`;
      if (item.type === 'audio') container.innerHTML += `<audio controls class="media-item"><source srcs="${item.url}"></audio>`;
    });
  });
}
loadContent();

// Subscribe
document.getElementById('subscribeBtn').onclick = () => {
  const email = document.getElementById('emailInput').value.trim();
  if (!email) return;
  const subRef = push(ref(db, 'subscribers'));
  set(subRef, { email, date: new Date().toISOString() });
  document.getElementById('subscribeMsg').textContent = "Subscribed successfully!";
  document.getElementById('emailInput').value = '';
};

// Feedback
document.getElementById('sendFeedback').onclick = () => {
  const text = document.getElementById('feedbackText').value.trim();
  if (!text) return;
  const fbRef = push(ref(db, 'feedback'));
  set(fbRef, { text, date: new Date().toISOString() });
  document.getElementById('feedbackMsg').textContent = "Thank you! Feedback sent.";
  document.getElementById('feedbackText').value = '';
};

// Secret Admin Keys
document.getElementById('adminSearch').addEventListener('keyup', (e) => {
  const input = e.target.value.trim();
  if (input === 'admin-leon.ss') {
    document.getElementById('adminLeon').classList.add('active');
    loadLeonAdmin();
    e.target.value = '';
  }
  if (input === 'admin-end.ss') {
    document.getElementById('adminEnd').classList.add('active');
    loadEndAdmin();
    e.target.value = '';
  }
});

// Admin Leon - Full Control
function loadLeonAdmin() {
  const panel = document.getElementById('adminLeon');
  panel.innerHTML = `<h2>Admin Leon Control Panel</h2>
    <button onclick="document.getElementById('adminLeon').classList.remove('active')">Close</button>
    <h3>Create Lesson</h3>
    <input id="lessonTitle" placeholder="Title"/><textarea id="lessonContent" placeholder="Content"></textarea>
    <button onclick="addLesson()">Add Lesson</button>
    <h3>Upload Media</h3>
    <input type="file" id="fileUpload" accept="image/*,video/*,audio/*"/>
    <input type="url" id="mediaUrl" placeholder="Or paste YouTube/GitHub URL"/>
    <button onclick="uploadMedia()">Upload</button>
    <div id="dragZone" style="border:2px dashed #fff; padding:20px; margin:20px 0;">Drag lessons/media here to reorder</div>`;
}

// Admin End - View Only
function loadEndAdmin() {
  const panel = document.getElementById('adminEnd');
  panel.innerHTML = `<h2>Admin End - View Only</h2>
    <button onclick="document.getElementById('adminEnd').classList.remove('active')">Close</button>
    <h3>Recent Feedback</h3><div id="endFeedback"></div>
    <h3>Subscribers</h3><div id="endSubscribers"></div>
    <h3>Daily Visits</h3><div id="endVisits"></div>`;

  onValue(ref(db, 'feedback'), (snap) => {
    const div = document.getElementById('endFeedback');
    div.innerHTML = '';
    const data = snap.val() || {};
    Object.values(data).reverse().slice(0,20).forEach(f => {
      div.innerHTML += `<p><strong>${new Date(f.date).toLocaleString()}:</strong> ${f.text}</p><hr>`;
    });
  });

  onValue(ref(db, 'subscribers'), (snap) => {
    const div = document.getElementById('endSubscribers');
    div.innerHTML = '<ol>';
    const data = snap.val() || {};
    Object.values(data).reverse().forEach(s => div.innerHTML += `<li>${s.email} - ${new Date(s.date).toLocaleDateString()}</li>`);
    div.innerHTML += '</ol>';
  });

  onValue(ref(db, 'visits'), (snap) => {
    const div = document.getElementById('endVisits');
    div.innerHTML = '<ul>';
    const data = snap.val() || {};
    Object.entries(data).reverse().forEach(([date, count]) => {
      div.innerHTML += `<li>${date}: ${count} visits</li>`;
    });
    div.innerHTML += '</ul>';
  });
}

// Dummy functions (full drag-and-drop & upload will work with Firebase Storage later)
// For now they work with Realtime Database URLs
window.addLesson = () => {
  const title = document.getElementById('lessonTitle').value;
  const content = document.getElementById('lessonContent').value;
  if (title && content) {
    push(ref(db, 'lessons'), { title, content });
    alert("Lesson added!");
  }
};
window.uploadMedia = () => {
  const url = document.getElementById('mediaUrl').value;
  const file = document.getElementById('fileUpload').files[0];
  if (url) { push(ref(db, 'media'), { url, type: url.includes('youtube')?'video':'image' }); }
  alert "Media added!";
};
