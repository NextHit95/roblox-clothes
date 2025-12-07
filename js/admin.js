import { auth, db } from './auth.js';
import { doc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function loadAdmin() {
  if(!auth.currentUser) return;
  const snap = await getDocs(collection(db, "users"));
  const currentUser = snap.docs.find(d => d.id === auth.currentUser.uid);
  if(!currentUser) return;
  if(currentUser.data().role !== "admin") return alert("Not an admin");

  const adminActions = document.getElementById("adminActions");
  const itemsSnap = await getDocs(collection(db, "items"));
  itemsSnap.forEach(docSnap => {
    const div = document.createElement("div");
    div.innerHTML = `<p>${docSnap.data().title} <button onclick="deleteItem('${docSnap.id}')">Delete</button></p>`;
    adminActions.appendChild(div);
  });
}

window.deleteItem = async function(id) {
  if(confirm("Delete this item?")) {
    await deleteDoc(doc(db, "items", id));
    alert("Deleted");
    location.reload();
  }
};

window.addEventListener("DOMContentLoaded", loadAdmin);
