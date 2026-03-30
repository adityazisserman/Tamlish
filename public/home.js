import { auth, onAuthStateChanged } from "./firebase-config.js";

const settingsLi = document.getElementById("settingsLi");
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    }
    else{
        settingsLi.style.display = "none";
    }
});

// conversation

const touristBubble = document.getElementById("touristBubble");
const localBubble = document.getElementById("localBubble");
const touristText = document.getElementById("touristText");
const localText = document.getElementById("localText");
const conversationBanner = document.getElementById("conversation");
const afterBtn = document.getElementById("afterbtn");
const beforeBtn = document.getElementById("beforebtn");
const slider = document.getElementById("slider");

let conversationVisible = false;

function triggerConversationAnimation(){
  const conversationPos = conversationBanner.getBoundingClientRect().top;
  if (!conversationVisible && conversationPos < window.innerHeight) {
    conversationVisible = true;
    beforeBtn.classList.add("activeConversation")
    setTimeout(() => {
      touristText.textContent = "";
      touristBubble.style.animation = "growLocal 2s forwards";
      touristBubble.addEventListener("animationend", ()=>{
          touristText.textContent = `[Expressive hand articulations attempting to mime train station]`;
        }, { once: true })
    }, 400)
    setTimeout(() => {
      localText.textContent = "";
      localBubble.style.animation = "growTourist 2s forwards";
      localBubble.addEventListener("animationend", () =>{
          localText.textContent = `"Mannikkavum ninkal enna colla varukirirkal enru puriyavillai (I'm sorry I do not understand what you are trying to say)`;
        }, { once: true })
    }, 1000);
  }
}

window.addEventListener("load", triggerConversationAnimation);

document.addEventListener("scroll", triggerConversationAnimation);

function conversationAnimate(state) {
  touristBubble.style.visibility = "hidden";
  localBubble.style.visibility = "hidden";
  if (state === "before"){{
    beforeBtn.classList.add("activeConversation")
    afterBtn.classList.remove("activeConversation")
      setTimeout(() => {
        touristText.textContent = "";
        touristBubble.style.animation = "none";
        void touristBubble.offsetWidth;
        touristBubble.style.animation = "growLocal 2s forwards";
        touristBubble.style.visibility = "visible";
        touristBubble.addEventListener("animationend", ()=>{
          touristText.textContent = `[Expressive hand articulations attempting to mime train station]`;
        }, { once: true })
      },0)
      setTimeout(() => {
        localText.textContent = "";
        localBubble.style.animation = "none";
        void localBubble.offsetWidth;
        localBubble.style.animation = "growTourist 2s forwards";
        localBubble.style.visibility = "visible";
        localBubble.addEventListener("animationend", () =>{
          localText.textContent =  `"Mannikkavum ninkal enna colla varukirirkal enru puriyavillai (I'm sorry I do not understand what you are trying to say)`;
        }, { once: true })
      }, 500);
      }
  }
  else{
    beforeBtn.classList.remove("activeConversation")
    afterBtn.classList.add("activeConversation")
    setTimeout(() => {
      touristText.textContent = "";
      touristBubble.style.animation = "none";
      void touristBubble.offsetWidth;
      touristBubble.style.animation = "growLocal 2s forwards";
      touristBubble.style.visibility = "visible";
      touristBubble.addEventListener("animationend", ()=>{
          touristText.textContent = `"Nan eppati rayil nilaiyattirku celvatu
" (How do I get to the train station)`;
        }, { once: true })
    }, 0)
    setTimeout(() => {
      localText.textContent = "";
      localBubble.style.animation = "none";
      void localBubble.offsetWidth;
      localBubble.style.animation = "growTourist 2s forwards";
      localBubble.style.visibility = "visible";
      localBubble.addEventListener("animationend", () =>{
          localText.textContent = `"Teruvil, valatupuram cenru, neraka cellunkal" (Down the street, turn right, then go straight)`;
        }, { once: true })
    }, 500);
  }
};


afterBtn.onclick = function() {
  conversationAnimate("after");
  slider.classList.add("after");
  afterBtn.classList.add("activeConversation");
  beforeBtn.classList.remove("activeConversation");
}
beforeBtn.onclick = function() {
  conversationAnimate("before");
  slider.classList.remove("after");
  beforeBtn.classList.add("activeConversation");
  afterBtn.classList.remove("activeConversation");
}


// Animating cursor particles in banner

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const banner = document.getElementById("banner");
let particles = [];

canvas.width = canvas.offsetWidth; // matches display size
canvas.height = canvas.offsetHeight;

const colors = ["#0000FF", "#1E90FF", "#00BFFF", "#4169E1"];

function spawnParticle(x, y) {
  particles.push({
    x, y, // mouse coords
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    size: Math.random() * 2.5 + 1.5,
    age: 20,
    life: Math.random() * 0.2 + 0.15,
    color: colors[Math.floor(Math.random() * colors.length)]
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clears canvas, so no trails, only current position shown
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.age -= p.life;
    if (p.age <= 10) { particles.splice(i, 1); continue; } // if particle has exceeded a certain lifespan, remove from array
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(animate); // runs animation every screen refresh - recursive
}

animate(); // calls the function at the beginning

let lastX = 0, lastY = 0;
banner.addEventListener('mousemove', (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const dist = Math.hypot(x - lastX, y - lastY);
  if (dist > 5) {
    for (let i = 0; i < 2; i++) spawnParticle(x, y); // spawning particle behind mouse cursor
    lastX = x; lastY = y;
  }
});

window.addEventListener('resize', () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
});

//styling navbar
const navbar = document.getElementById("header");
navbar.style.boxShadow  = "none";

document.addEventListener("scroll", () =>{
  window.scrollY > 100 ? navbar.style.boxShadow = "0.5px 0.5px 0.5px rgb(174, 200, 255)": navbar.style.boxShadow = "none";
})