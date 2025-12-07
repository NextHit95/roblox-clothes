import { db, auth } from './auth.js';
import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function loadItems() {
  const itemsCol = collection(db, "items");
  const q = query(itemsCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map(d => d.data());

  // Fill grids
  const todayPickGrid = document.getElementById("todayPickGrid");
  const trendingGrid = document.getElementById("trendingGrid");
  const newReleasesGrid = document.getElementById("newReleasesGrid");

  if(todayPickGrid) todayPickGrid.innerHTML = "";
  if(trendingGrid) trendingGrid.innerHTML = "";
  if(newReleasesGrid) newReleasesGrid.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<img src="${item.image}" alt="${item.title}"><div class="meta"><p>${item.title}</p></div>`;
    if(todayPickGrid && item.todayPick) todayPickGrid.appendChild(div);
    if(trendingGrid && item.likes > 0) trendingGrid.appendChild(div);
    if(newReleasesGrid) newReleasesGrid.appendChild(div);
  });
}

window.addEventListener("DOMContentLoaded", loadItems);
