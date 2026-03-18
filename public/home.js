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


const touristBubble = document.getElementById("touristBubble");
const localBubble = document.getElementById("localBubble");
const touristText = document.getElementById("touristText");
const localText = document.getElementById("localText");
const conversationBanner = document.getElementById("conversation");

conversationBanner.onclick = function(){
    
    touristText.textContent = "tourist text"
    localText.textContent = "local text"
};

