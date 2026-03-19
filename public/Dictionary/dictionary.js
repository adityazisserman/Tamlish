import { auth, onAuthStateChanged, db, doc, getDocs, getDoc, collection, serverTimestamp } from "../firebase-config.js";

const wordsTableBody = document.getElementById("wordsTable").querySelector("tbody");
const phrasesTableBody = document.getElementById("phrasesTable").querySelector("tbody");
const wordsTable = document.getElementById("wordsTable");
const phrasesTable = document.getElementById("phrasesTable");
const wordsSwitchBtn = document.getElementById("wordsSwitchBtn");
const phrasesSwitchBtn = document.getElementById("phrasesSwitchBtn");
const backBtn = document.getElementById("backBtn");
let currentUser = null;
let vocab = {}; 
let wordsArray = [];
let phrasesArray = [];
const audioCache = {};
let fuseWords;
let fusePhrases;

// TODO add laoding scrren + no searhc results + no vocab leartn when not singed in, as well as potentially caching vocab so loading time improves.

const tableCache = {
    vocab: "cachedVocab",
    vocabVersion: "cachedVocabVersion",
    proficiency: "cachedProficiency"
};
const APP_VERSION = "1.0"

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const serverVocabVersion = userDoc.data()?.vocabLastUpdatedTimestamp ?? null;
        const localVocabVersion = localStorage.getItem(tableCache.vocabVersion);

        // caching vocab data
        if (serverVocabVersion !== localVocabVersion || !localStorage.getItem(tableCache.vocab)){
            const response = await fetch(`dictionary.json?v=${APP_VERSION}`);
            vocab = await response.json();
            localStorage.setItem(tableCache.vocab, JSON.stringify(vocab));
            if (serverVocabVersion) {
                localStorage.setItem(tableCache.vocabVersion, serverVocabVersion)
            }
            localStorage.removeItem(tableCache.proficiency)
        }
        else{
            vocab = JSON.parse(localStorage.getItem(tableCache.vocab));
        }
        await loadVocabProficiency();
        console.log("vocab:", vocab);
        console.log("vocabProficiencyData:", vocabProficiencyData);
        console.log("serverVocabVersion:", serverVocabVersion);
        console.log("localVocabVersion:", localVocabVersion);
                
        // fetching relevant vocab
        for (let id in vocab){
            if (id.includes("w") && vocabProficiencyData[id] !== undefined){
                wordsArray.push({ id: id, proficiency: vocabProficiencyData[id], english: vocab[id].english, tamlish: vocab[id].tamlish });
            }
            else if (id.includes("p") && vocabProficiencyData[id] !== undefined){
                phrasesArray.push({ id: id, proficiency: vocabProficiencyData[id], english: vocab[id].english, tamlish: vocab[id].tamlish });
            }
        }
        console.log("wordsArray:", wordsArray);
        console.log("phrasesArray:", phrasesArray);
        for (let id in vocab) {
            if (id.includes("w") || id.includes("p")){
                const audio = new Audio(`../Audio/${id}.mp3`);
                audio.load();
                audioCache[id] = audio;
            }
        };
        populateTable(wordsArray, wordsTableBody);
        populateTable(phrasesArray, phrasesTableBody);
        fuseWords = new Fuse(wordsArray, options);
        fusePhrases = new Fuse(phrasesArray, options);
    }
    else{
        const settingsLi = document.getElementById("settingsLi");
        settingsLi.style.display = "none";
    }
});

wordsSwitchBtn.addEventListener("click", () => {
  wordsTable.style.display = "block";
  phrasesTable.style.display = "none";
});

phrasesSwitchBtn.addEventListener("click", () => {
  wordsTable.style.display = "none";
  phrasesTable.style.display = "block";
});

let vocabProficiencyData = [];

async function loadVocabProficiency(){
    const cachedProficiency = localStorage.getItem(tableCache.proficiency)
    if (cachedProficiency){
        vocabProficiencyData = JSON.parse(cachedProficiency);
        return
    };
    try{
        const topicsQuery = await getDocs(collection(db, "users", currentUser.uid, "topics"));
        for (const topic of topicsQuery.docs){
            const wordsProficiencyDocRef = doc(db, "users", currentUser.uid, "topics", topic.id, "vocab", "words");
            const wordsProficiencyDoc = await getDoc(wordsProficiencyDocRef);
            const topicVocabProficiencyData = wordsProficiencyDoc.data() || {};
            vocabProficiencyData = {...vocabProficiencyData, ...topicVocabProficiencyData};
        }
        localStorage.setItem(tableCache.proficiency, JSON.stringify(vocabProficiencyData)); // adding proficiency data to local cache
    }
    catch(error){
        console.log("error: ",error);
    }
}

function playAudio(vocabid){
    const audio = audioCache[vocabid];
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
};

function populateTable(array, table) {
    table.innerHTML = "";

    array.forEach(item => {
        const row = document.createElement("tr");
        row.id = item.id;

        const listenCell = document.createElement("td");
        const soundBtn = document.createElement("span");
        soundBtn.className = "material-symbols-outlined";
        soundBtn.classList.add("soundBtns");
        soundBtn.textContent = "volume_up";
        soundBtn.addEventListener("click", () => {
            playAudio(item.id);
        });
        listenCell.appendChild(soundBtn);
        row.appendChild(listenCell);

        const englishCell = document.createElement("td");
        englishCell.textContent = item.english;
        row.appendChild(englishCell);

        const tamlishCell = document.createElement("td");
        tamlishCell.textContent = item.tamlish;
        row.appendChild(tamlishCell);

        const proficencyCell = document.createElement("td");
        proficencyCell.textContent = vocabProficiencyData[item.id] ?? "N/A";
        row.appendChild(proficencyCell);
        
        table.appendChild(row);
    });
};  

const options = {
  keys: ["proficiency","english", "tamlish"],
//   threshold: 0.9, 
};

function search(query){
    const wordsResults = fuseWords.search(query).map(result => result.item); // only gets the results not other data like score
    const phrasesResults = fusePhrases.search(query).map(result => result.item);
    populateTable(wordsResults, wordsTableBody);
    populateTable(phrasesResults, phrasesTableBody);
    backBtn.style.display = "block";

  console.log("Words:", wordsResults);
  console.log("Phrases:", phrasesResults);
};

const searchBtn = document.getElementById("searchBtn");
const searchQuery = document.getElementById("searchBox");

searchBtn.addEventListener("click", () => {
    if (searchQuery.value){
        search(searchQuery.value);
    }
    else{
        console.log("no search value inputted");
    }
});

backBtn.addEventListener("click", () => {
    populateTable(wordsArray, wordsTableBody);
    populateTable(phrasesArray, phrasesTableBody);
    backBtn.style.display = "none";
    searchQuery.value = "";
}); 

