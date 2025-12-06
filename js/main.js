/* main.js — front-end MVP app logic
   Uses localStorage so admin changes persist in your browser.
   Admin credentials (MVP): username=admin password=password
*/

let state = {
  items: {},
  creators: {},
  isAdmin: false,
  adminUser: "admin",
  adminPass: "password"
};

function initApp(){
  // bootstrap data or load from storage
  const saved = localStorage.getItem("ct_state_v1");
  if(saved){
    try{ state = JSON.parse(saved); }
    catch(e){ console.error("bad saved state", e); }
  } else {
    seedData();
    saveState();
  }
  updateAdminUI();
}

/* ---------- seed sample data ---------- */
function seedData(){
  state.items = {
    "1001": { id:"1001", name:"Classic Black Hoodie", creatorId:"2001", likes:420, views:8800, createdAt:"2025-10-20", image:"https://via.placeholder.com/320x320/111827/ffffff?text=Hoodie", featured:false, removed:false },
    "1002": { id:"1002", name:"Red Retro Tee", creatorId:"2002", likes:240, views:4500, createdAt:"2025-11-05", image:"https://via.placeholder.com/320x320/ef4444/fff?text=Red+Tee", featured:true, removed:false },
    "1003": { id:"1003", name:"Blue Denim Jacket", creatorId:"2003", likes:150, views:3200, createdAt:"2025-11-20", image:"https://via.placeholder.com/320x320/3b82f6/fff?text=Denim", featured:false, removed:false },
    "1004": { id:"1004", name:"Aesthetic Crop", creatorId:"2002", likes:95, views:900, createdAt:"2025-11-28", image:"https://via.placeholder.com/320x320/7c3aed/fff?text=Crop", featured:false, removed:false }
  };

  state.creators = {
    "2001": { id:"2001", name:"Pro95", pfp:"https://via.placeholder.com/64/0ea5e9/fff?text=P1", removed:false },
    "2002": { id:"2002", name:"FashionKid", pfp:"https://via.placeholder.com/64/f97316/fff?text=FK", removed:false },
    "2003": { id:"2003", name:"StylePro", pfp:"https://via.placeholder.com/64/10b981/fff?text=SP", removed:false }
  };
}

/* ---------- persistence ---------- */
function saveState(){
  localStorage.setItem("ct_state_v1", JSON.stringify(state));
}

/* ---------- helpers ---------- */
function q(s){ return document.querySelector(s); }
function qAll(s){ return Array.from(document.querySelectorAll(s)); }
function getParam(name){
  const u = new URLSearchParams(location.search);
  return u.get(name);
}

/* ---------- scoring and lists ---------- */
function itemScore(it){
  // trending formula: likes*2 + views*0.3
  return (it.likes||0)*2 + (it.views||0)*0.3;
}

function getItemsArray(){
  return Object.values(state.items || {});
}

function todaysPicks(){
  return getItemsArray().filter(i => i.featured && !i.removed);
}
function trendingList(limit=12){
  return getItemsArray().filter(i => !i.removed).sort((a,b)=> itemScore(b) - itemScore(a)).slice(0,limit);
}
function newReleases(limit=12){
  return getItemsArray().filter(i=>!i.removed).sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).slice(0,limit);
}

/* ---------- render home ---------- */
function renderHome(){
  if(!q("#todays-picks")) return; // not on this page
  // clear
  q("#todays-picks").innerHTML = "";
  q("#trending").innerHTML = "";
  q("#new-releases").innerHTML = "";

  todaysPicks().forEach(it => {
    q("#todays-picks").appendChild(renderItemCard(it, {showAdminToggles:true}));
  });

  trendingList().forEach(it => {
    q("#trending").appendChild(renderItemCard(it));
  });

  newReleases().forEach(it => {
    q("#new-releases").appendChild(renderItemCard(it));
  });

  updateAdminUI();
}

/* ---------- render item card (small) ---------- */
function renderItemCard(it, opts={}) {
  const div = document.createElement("div");
  div.className = "item card-item";
  div.innerHTML = `
    <a href="item.html?id=${encodeURIComponent(it.id)}" style="text-decoration:none;color:inherit;">
      <div class="item-thumb"><img src="${it.image||'https://via.placeholder.com/320x320?text=No+Image'}" alt="${escapeHtml(it.name)}"></div>
      <div class="meta">
        <div style="font-weight:700">${escapeHtml(it.name)}</div>
        <div class="small">${escapeHtml((state.creators[it.creatorId]||{name:'Unknown'}).name)}</div>
        <div class="small">♥ ${it.likes} • 👁 ${it.views}</div>
      </div>
    </a>
  `;
  // admin toggles
  if(state.isAdmin){
    const adminArea = document.createElement("div");
    adminArea.style.padding = "8px";
    if(!it.featured){
      const fbtn = document.createElement("button");
      fbtn.className = "btn";
      fbtn.textContent = "Feature";
      fbtn.onclick = ()=> { featureItem(it.id); renderHome(); };
      adminArea.appendChild(fbtn);
    } else {
      const ufbtn = document.createElement("button");
      ufbtn.className = "btn";
      ufbtn.textContent = "Unfeature";
      ufbtn.onclick = ()=> { unfeatureItem(it.id); renderHome(); };
      adminArea.appendChild(ufbtn);
    }
    const rem = document.createElement("button");
    rem.className = "btn";
    rem.textContent = "Remove";
    rem.onclick = ()=> { removeItem(it.id); renderHome(); };
    adminArea.appendChild(rem);

    const restore = document.createElement("button");
    restore.className = "btn";
    restore.textContent = "Restore";
    restore.onclick = ()=> { restoreItem(it.id); renderHome(); };
    adminArea.appendChild(restore);

    div.appendChild(adminArea);
  }
  return div;
}

/* ---------- escape ---------- */
function escapeHtml(s){ if(!s) return ""; return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

/* ---------- Render item page ---------- */
function renderItemPage(){
  const id = getParam("id");
  const container = q("#item-block");
  if(!container) return;
  container.innerHTML = "";
  const item = state.items[id];
  if(!item || item.removed){
    container.innerHTML = `<div class="card"><h3>Item not found or removed</h3></div>`; return;
  }
  // view counting (local only)
  item.views = (item.views||0) + 1;
  saveState();

  const creator = state.creators[item.creatorId] || {name:"Unknown", pfp:"https://via.placeholder.com/64?text=U"};
  const html = document.createElement("div");
  html.className = "card";
  html.innerHTML = `
    <div style="display:flex;gap:16px">
      <img src="${item.image||'https://via.placeholder.com/320x320?text=No+Image'}" alt="${escapeHtml(item.name)}" style="width:320px;height:320px;object-fit:cover;border-radius:6px">
      <div style="flex:1">
        <h2>${escapeHtml(item.name)}</h2>
        <div class="small">By <a href="creator.html?id=${item.creatorId}">${escapeHtml(creator.name)}</a></div>
        <div style="margin-top:8px">♥ <span id="like-count">${item.likes}</span> • 👁 <span id="view-count">${item.views}</span></div>
        <div style="margin-top:12px">
          <button class="btn" id="like-btn">Like</button>
          <a class="btn" href="https://www.roblox.com/catalog/${item.id}" target="_blank">Open in Roblox</a>
        </div>
        <div style="margin-top:12px" class="small">Item ID: ${item.id} • Created: ${item.createdAt}</div>
      </div>
    </div>
  `;
  container.appendChild(html);

  // admin controls
  if(state.isAdmin){
    const a = document.createElement("div");
    a.style.marginTop="12px";
    a.innerHTML = `
      <button class="btn" id="admin-feature">${ item.featured ? 'Unfeature' : 'Feature' }</button>
      <button class="btn" id="admin-remove">${ item.removed ? 'Restore' : 'Remove' }</button>
      <button class="btn" id="admin-remove-creator">Remove Creator</button>
    `;
    container.appendChild(a);
    q("#admin-feature").onclick = ()=>{ item.featured = !item.featured; saveState(); renderItemPage(); updateAdminUI(); };
    q("#admin-remove").onclick = ()=>{ item.removed = !item.removed; saveState(); renderItemPage(); renderHome(); updateAdminUI(); };
    q("#admin-remove-creator").onclick = ()=>{ removeCreator(item.creatorId); renderItemPage(); renderHome(); updateAdminUI(); };
  }

  // like button (local)
  q("#like-btn").onclick = ()=>{
    item.likes = (item.likes||0) + 1; saveState();
    q("#like-count").textContent = item.likes;
    updateHomeIfPresent();
  };

  // similar items
  const similarList = q("#similar-list");
  similarList.innerHTML = "";
  getItemsArray().filter(i => i.id !== id && !i.removed).slice(0,6).forEach(s=>{
    const el = document.createElement("div");
    el.className="item";
    el.innerHTML = `
      <a href="item.html?id=${s.id}" style="text-decoration:none;color:inherit;">
        <img src="${s.image}">
        <div class="meta"><div style="font-weight:700">${escapeHtml(s.name)}</div><div class="small">${escapeHtml((state.creators[s.creatorId]||{name:''}).name)}</div></div>
      </a>
    `;
    similarList.appendChild(el);
  });
}

/* ---------- Render creator page ---------- */
function renderCreatorPage(){
  const id = getParam("id");
  const cont = q("#creator-block"); if(!cont) return;
  cont.innerHTML = "";
  const creator = state.creators[id];
  if(!creator || creator.removed){ cont.innerHTML = "<div class='card'><h3>Creator not found or removed</h3></div>"; return; }

  const itemsBy = getItemsArray().filter(i=>i.creatorId===id && !i.removed);
  const div = document.createElement("div");
  div.className="card";
  div.innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      <img src="${creator.pfp}" style="width:96px;height:96px;border-radius:8px">
      <div>
        <h2>${escapeHtml(creator.name)}</h2>
        <div class="small">Items: ${itemsBy.length}</div>
      </div>
    </div>
    <hr/>
    <div id="creator-items" class="grid"></div>
  `;
  cont.appendChild(div);

  const grid = q("#creator-items");
  itemsBy.forEach(it => grid.appendChild(renderItemCard(it)));
  if(state.isAdmin){
    const adminArea = document.createElement("div");
    adminArea.style.marginTop="8px";
    const remBtn = document.createElement("button");
    remBtn.className="btn";
    remBtn.textContent="Remove Creator (and all items)";
    remBtn.onclick = ()=>{ removeCreator(id); renderCreatorPage(); renderHome(); updateAdminUI(); };
    adminArea.appendChild(remBtn);
    div.appendChild(adminArea);
  }
}

/* ---------- Admin functions ---------- */
function adminLogin(user, pass){
  if(user === state.adminUser && pass === state.adminPass){
    state.isAdmin = true;
    saveState();
    updateAdminUI();
    return true;
  }
  return false;
}
function adminLogout(){
  state.isAdmin = false; saveState(); updateAdminUI();
}

function featureItem(itemId){ if(state.items[itemId]){ state.items[itemId].featured = true; saveState(); } }
function unfeatureItem(itemId){ if(state.items[itemId]){ state.items[itemId].featured = false; saveState(); } }
function removeItem(itemId){ if(state.items[itemId]){ state.items[itemId].removed = true; saveState(); } }
function restoreItem(itemId){ if(state.items[itemId]){ state.items[itemId].removed = false; saveState(); } }

function removeCreator(creatorId){
  if(!state.creators[creatorId]) return;
  state.creators[creatorId].removed = true;
  Object.values(state.items).forEach(it => { if(it.creatorId === creatorId) it.removed = true; });
  saveState();
}
function restoreCreator(creatorId){
  if(!state.creators[creatorId]) return;
  state.creators[creatorId].removed = false;
  Object.values(state.items).forEach(it => { if(it.creatorId === creatorId) it.removed = false; });
  saveState();
}

/* ---------- admin page rendering ---------- */
function renderAdminPage(){
  // show login or dashboard
  const loginArea = q("#admin-login-area");
  const dash = q("#admin-dashboard");
  if(state.isAdmin){
    loginArea.style.display = "none";
    dash.style.display = "block";
    renderAdminDashboard();
  } else {
    loginArea.innerHTML = `
      <form id="admin-login-form" class="form">
        <input name="user" placeholder="admin user" value="admin" required />
        <input name="pass" placeholder="password" type="password" value="password" required />
        <button type="submit">Login</button>
      </form>
    `;
    const form = q("#admin-login-form");
    form.onsubmit = (e)=>{ e.preventDefault(); const f = new FormData(form); if(adminLogin(f.get('user'), f.get('pass'))){ alert('Admin logged in'); renderAdminPage();} else { alert('bad creds'); } };
    dash.style.display = "none";
  }
  updateAdminUI();
}

function renderAdminDashboard(){
  // Today's picks editor
  const ap = q("#admin-todays-picks"); ap.innerHTML = "";
  getItemsArray().forEach(it=>{
    const row = document.createElement("div");
    row.style.display="flex"; row.style.gap="8px"; row.style.alignItems="center"; row.style.margin="6px 0";
    row.innerHTML = `<div style="flex:1">${escapeHtml(it.name)} <span class="small">(${escapeHtml((state.creators[it.creatorId]||{name:'?' }).name)})</span></div>`;
    const feat = document.createElement("button");
    feat.className="btn"; feat.textContent = it.featured ? 'Unfeature' : 'Feature';
    feat.onclick = ()=>{ it.featured = !it.featured; saveState(); renderAdminDashboard(); renderHome(); };
    row.appendChild(feat);
    const rem = document.createElement("button"); rem.className="btn"; rem.textContent = it.removed ? 'Restore' : 'Remove';
    rem.onclick = ()=>{ it.removed = !it.removed; saveState(); renderAdminDashboard(); renderHome(); };
    row.appendChild(rem);
    ap.appendChild(row);
  });

  // Manage Items
  const ai = q("#admin-manage-items"); ai.innerHTML = "";
  getItemsArray().forEach(it=>{
    const r = document.createElement("div");
    r.style.margin="6px 0";
    r.innerHTML = `<div style="font-weight:700">${escapeHtml(it.name)}</div>
      <div class="small">ID:${it.id} • ${escapeHtml((state.creators[it.creatorId]||{name:'?' }).name)} • ♥${it.likes} • 👁 ${it.views}</div>`;
    ai.appendChild(r);
  });

  // Manage Creators
  const ac = q("#admin-manage-creators"); ac.innerHTML = "";
  Object.values(state.creators).forEach(c=>{
    const cr = document.createElement("div");
    cr.style.display="flex"; cr.style.justifyContent="space-between"; cr.style.alignItems="center"; cr.style.margin="6px 0";
    cr.innerHTML = `<div>${escapeHtml(c.name)} <span class="small">(${c.id})</span></div>`;
    const b = document.createElement("div");
    const rem = document.createElement("button"); rem.className="btn"; rem.textContent=c.removed ? 'Restore' : 'Remove';
    rem.onclick = ()=>{ c.removed = !c.removed; if(c.removed){ Object.values(state.items).forEach(it=>{ if(it.creatorId===c.id) it.removed=true; }); } saveState(); renderAdminDashboard(); renderHome(); updateAdminUI();};
    b.appendChild(rem);
    ac.appendChild(cr); cr.appendChild(b);
  });

  // Add item form
  const form = q("#admin-add-item");
  form.onsubmit = (e)=>{ e.preventDefault(); const fd = new FormData(form); const id = fd.get('id'); if(!id){ alert('id'); return; } const obj = { id, name:fd.get('name'), creatorId:fd.get('creatorId'), image:fd.get('image')||('https://via.placeholder.com/320x320?text='+encodeURIComponent(fd.get('name'))), likes:0, views:0, createdAt:fd.get('createdAt')||new Date().toISOString().slice(0,10), featured:false, removed:false }; state.items[id]=obj; if(!state.creators[obj.creatorId]) state.creators[obj.creatorId]={id:obj.creatorId,name:obj.creatorId,pfp:'https://via.placeholder.com/64?text='+obj.creatorId,removed:false}; saveState(); form.reset(); renderAdminDashboard(); renderHome(); };
}

/* ---------- upload form (UI only) ---------- */
function setupUploadForm(){
  const f = q("#upload-form");
  if(!f) return;
  f.onsubmit = (e)=>{ e.preventDefault(); const fd = new FormData(f); const id = fd.get('id'); if(!id){ alert('enter id'); return; } if(state.items[id]){ alert('item exists'); return; } const obj = { id, name:fd.get('name'), creatorId:fd.get('creatorId'), image:fd.get('image')||('https://via.placeholder.com/320x320?text='+encodeURIComponent(fd.get('name'))), likes:0, views:0, createdAt:new Date().toISOString().slice(0,10), featured:false, removed:false }; state.items[id]=obj; if(!state.creators[obj.creatorId]) state.creators[obj.creatorId]={id:obj.creatorId,name:obj.creatorId,pfp:'https://via.placeholder.com/64?text='+obj.creatorId,removed:false}; saveState(); alert('uploaded (local)'); f.reset(); renderHome(); };
}

/* ---------- search ---------- */
function setupSearch(){
  const form = q("#search-form"); if(!form) return;
  form.onsubmit = (e)=>{ e.preventDefault(); const qv = new FormData(form).get('q')||''; const results = getItemsArray().filter(it => (!it.removed) && (it.name.toLowerCase().includes(qv.toLowerCase()) || (state.creators[it.creatorId] && state.creators[it.creatorId].name.toLowerCase().includes(qv.toLowerCase())))); const el = q("#search-results"); el.innerHTML=""; results.forEach(r=> el.appendChild(renderItemCard(r))); };
}

/* ---------- leaderboard ---------- */
function renderLeaderboard(){
  const el = q("#leaderboard"); if(!el) return;
  el.innerHTML = "";
  // compute top creators by total views across non-removed items
  const scores = {};
  Object.values(state.creators).forEach(c => scores[c.id] = { id:c.id, name:c.name, views:0, likes:0 });
  getItemsArray().filter(i=>!i.removed).forEach(it => { if(!scores[it.creatorId]) scores[it.creatorId]={id:it.creatorId,name:state.creators[it.creatorId]?.name||it.creatorId,views:0,likes:0}; scores[it.creatorId].views += (it.views||0); scores[it.creatorId].likes += (it.likes||0); });
  const list = Object.values(scores).sort((a,b)=> b.views - a.views).slice(0,20);
  list.forEach(c => {
    const d = document.createElement("div");
    d.className="card";
    d.innerHTML = `<div style="display:flex;align-items:center;gap:12px"><div style="font-weight:700">${escapeHtml(c.name)}</div><div class="small">Views: ${c.views} • Likes: ${c.likes}</div><div style="margin-left:auto"><a class="btn" href="creator.html?id=${c.id}">View</a></div></div>`;
    el.appendChild(d);
  });
}

/* ---------- small helpers ---------- */
function updateAdminUI(){
  // update small admin area across pages
  qAll(".admin-area").forEach(el=>{
    if(state.isAdmin){
      el.innerHTML = `<span class="small">Admin</span> <button class="btn" onclick="adminLogout();renderHome();renderAdminPage();">Logout</button>`;
    } else {
      el.innerHTML = `<button class="btn" onclick="promptAdminLogin()">Admin Login</button>`;
    }
  });
}

function promptAdminLogin(){
  const user = prompt("admin user", "admin");
  if(user===null) return;
  const pass = prompt("admin pass", "password");
  if(pass===null) return;
  if(adminLogin(user, pass)){ alert("logged in"); updateAdminUI(); renderHome(); renderAdminPage(); } else alert("bad cred");
}

function updateHomeIfPresent(){ try{ renderHome(); }catch(e){} }

/* ---------- utility to ensure functions are global for inline onclick usage ---------- */
window.initApp = initApp;
window.renderHome = renderHome;
window.renderItemPage = renderItemPage;
window.renderCreatorPage = renderCreatorPage;
window.renderAdminPage = renderAdminPage;
window.renderAdminDashboard = renderAdminDashboard;
window.setupUploadForm = setupUploadForm;
window.setupSearch = setupSearch;
window.renderLeaderboard = renderLeaderboard;
window.promptAdminLogin = promptAdminLogin;
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.featureItem = featureItem;
window.unfeatureItem = unfeatureItem;
window.removeItem = removeItem;
window.restoreItem = restoreItem;
window.removeCreator = removeCreator;
window.restoreCreator = restoreCreator;
window.saveState = saveState;
