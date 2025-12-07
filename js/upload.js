import { auth, db } from './auth.js';
import { ref, getStorage, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const uploadForm = document.getElementById("uploadForm");
if(uploadForm) {
  uploadForm.addEventListener("submit", async e => {
    e.preventDefault();
    if(!auth.currentUser) return alert("Login to upload!");

    const title = uploadForm.title.value;
    const file = document.getElementById("image").files[0];
    if(!file) return alert("Select an image");

    const storage = getStorage();
    const fileRef = ref(storage, "items/" + Date.now() + "_" + file.name);
    await uploadBytes(fileRef, file);
    const imgURL = await getDownloadURL(fileRef);

    await addDoc(collection(db, "items"), {
      title,
      image: imgURL,
      creator: auth.currentUser.uid,
      likes: 0,
      views: 0,
      createdAt: serverTimestamp(),
      todayPick: false
    });

    alert("Uploaded!");
    uploadForm.reset();
  });
}
