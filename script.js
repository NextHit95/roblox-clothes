<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ClothHub</title>
<style>
  /* Reset */
  * { margin:0; padding:0; box-sizing:border-box; font-family: 'Arial', sans-serif; }

  body {
    height:100vh;
    overflow-x:hidden;
    background: linear-gradient(120deg, #0f0f0f, #1a1a1a);
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  /* Moving gradient background animation */
  @keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  body {
    background: linear-gradient(-45deg, #0f0f0f, #ff0000, #00ff00, #0000ff);
    background-size: 400% 400%;
    animation: gradientBG 15s ease infinite;
  }

  header {
    width:100%;
    padding: 1rem 2rem;
    display:flex;
    justify-content: space-between;
    align-items:center;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  header h1 {
    font-size: 2rem;
    color: #fff;
  }

  nav a {
    color:#fff;
    margin-left:1.5rem;
    text-decoration:none;
    font-weight: bold;
    transition: color 0.3s;
  }

  nav a:hover { color: #00ffcc; }

  /* Sections */
  section {
    width:90%;
    max-width:1200px;
    margin:2rem 0;
    padding:2rem;
    border-radius:12px;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(5px);
  }

  h2 {
    margin-bottom:1rem;
    font-size:1.8rem;
    color: #ff4c4c;
  }

  /* Gallery grid */
  .gallery {
    display:grid;
    grid-template-columns: repeat(auto-fill,minmax(200px,1fr));
    gap:1rem;
  }

  .item {
    position:relative;
    overflow:hidden;
    border-radius:10px;
    cursor:pointer;
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .item:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255,255,255,0.5);
  }

  .item img {
    width:100%;
    display:block;
    border-radius:10px;
  }

  /* Floating bubbles */
  .bubble {
    position:absolute;
    border-radius:50%;
    opacity:0.5;
    animation: floatBubble 15s linear infinite;
    pointer-events:none;
  }

  @keyframes floatBubble {
    0% { transform: translateY(100vh) scale(0.5); opacity:0.3; }
    50% { opacity:0.5; }
    100% { transform: translateY(-10vh) scale(1); opacity:0; }
  }

</style>
</head>
<body>

<header>
  <h1>ClothHub</h1>
  <nav>
    <a href="#today">Today's Pick</a>
    <a href="#trending">Trending</a>
    <a href="#new">New Releases</a>
  </nav>
</header>

<section id="today">
  <h2>Today's Pick</h2>
  <div class="gallery" id="todayGallery">
    <!-- Items will be inserted here -->
  </div>
</section>

<section id="trending">
  <h2>Trending</h2>
  <div class="gallery" id="trendingGallery">
    <!-- Items will be inserted here -->
  </div>
</section>

<section id="new">
  <h2>New Releases</h2>
  <div class="gallery" id="newGallery">
    <!-- Items will be inserted here -->
  </div>
</section>

<script>
  // Sample dynamic bubble creation
  for(let i=0;i<20;i++){
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.style.width = bubble.style.height = Math.random()*30 + 10 + 'px';
    bubble.style.background = ['#ff0000','#00ff00','#0000ff'][Math.floor(Math.random()*3)];
    bubble.style.left = Math.random()*100 + 'vw';
    bubble.style.animationDuration = (10 + Math.random()*10) + 's';
    document.body.appendChild(bubble);
  }

  // Sample function to load cloths (replace with real data)
  const sampleItems = [
    {id:1,title:"Red Shirt",img:"https://via.placeholder.com/200",likes:10,views:100},
    {id:2,title:"Blue Hoodie",img:"https://via.placeholder.com/200",likes:20,views:150}
  ];

  function loadGallery(id, items){
    const gallery = document.getElementById(id);
    items.forEach(item=>{
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<img src="${item.img}" alt="${item.title}"><p>${item.title}</p>`;
      gallery.appendChild(div);
    });
  }

  loadGallery('todayGallery', sampleItems);
  loadGallery('trendingGallery', sampleItems);
  loadGallery('newGallery', sampleItems);

</script>

</body>
</html>
