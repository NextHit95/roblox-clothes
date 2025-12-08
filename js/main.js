import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://iigkeuxdshtssbdguhbm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZ2tldXhkc3NiZGd1aGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDk4MTAsImV4cCI6MjA4MDc4NTgxMH0.9To1RY6hOLwqiBp8AMHsS58VCIm3KVh8Mm9';
const supabase = createClient(supabaseUrl, supabaseKey);

const loginButton = document.getElementById('loginGoogle');
const logoutButton = document.getElementById('logout');
const uploadButton = document.getElementById('uploadShirt');
const userGreeting = document.getElementById('userGreeting');
const guestControls = document.getElementById('guestControls');
const userControls = document.getElementById('userControls');
const likeButtons = document.querySelectorAll('.likeButton');

async function updateUI() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    if (guestControls) guestControls.style.display = 'none';
    if (userControls) userControls.style.display = 'block';
    if (userGreeting) userGreeting.textContent = `Hello, ${session.user.email}`;
    if (uploadButton) uploadButton.style.display = 'inline-block';
  } else {
    if (guestControls) guestControls.style.display = 'block';
    if (userControls) userControls.style.display = 'none';
    if (uploadButton) uploadButton.style.display = 'none';
  }
}

if (loginButton) {
  loginButton.onclick = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href, shouldCreateUser: true }
    });
    if (error) console.error('Login error:', error.message);
  };
}

if (logoutButton) {
  logoutButton.onclick = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error.message);
    updateUI();
  };
}

likeButtons.forEach(btn => {
  btn.onclick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alert('Login required to like shirts.');
    const shirtId = btn.parentElement.dataset.shirtId;
    console.log(`User ${session.user.email} liked shirt ${shirtId}`);
  };
});

if (uploadButton) {
  uploadButton.onclick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return alert('Login required to upload shirts.');
    alert('Upload form opens here.');
  };
}

window.onload = () => {
  updateUI();
  supabase.auth.onAuthStateChange((_event, session) => updateUI());
};
