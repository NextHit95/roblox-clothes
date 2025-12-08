// ====== Supabase Initialization ======
const supabaseUrl = 'https://iigkeuxdshtssbdguhbm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZ2tldXhkc2h0c3NiZGd1aGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDk4MTAsImV4cCI6MjA4MDc4NTgxMH0.9To1RY6hOLwqiBp8AMHsS58VCIm3KVh8Mm9';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ====== DOM Elements ======
const loginButton = document.getElementById('loginGoogle');
const uploadButton = document.getElementById('uploadShirt');
const likeButtons = document.querySelectorAll('.likeButton');

// ====== Helper: Update UI based on login ======
async function updateUI() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    console.log('Logged in as:', session.user.email);
    if (uploadButton) uploadButton.style.display = 'inline-block';
    loginButton.style.display = 'none';
  } else {
    console.log('Guest browsing');
    if (uploadButton) uploadButton.style.display = 'none';
    loginButton.style.display = 'inline-block';
  }
}

// ====== Google Sign-In ======
loginButton.onclick = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href, shouldCreateUser: true }
  });

  if (error) console.error('Login error:', error.message);
  else console.log('Login initiated:', data);
};

// ====== Logout Function ======
async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Logout error:', error.message);
  else updateUI();
}

// ====== Like Shirt Function ======
async function likeShirt(shirtId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return alert('Login required to like shirts.');

  // Add your logic here: increment like counter in Supabase table
  console.log(`User ${session.user.email} liked shirt ${shirtId}`);
}

// Attach like buttons
likeButtons.forEach(btn => {
  btn.onclick = () => likeShirt(btn.dataset.shirtId);
});

// ====== Initialize UI on page load ======
window.onload = () => {
  updateUI();

  // Optional: monitor auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    updateUI();
  });
};
