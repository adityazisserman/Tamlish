import { auth, onAuthStateChanged, db, doc, getDocs, getDoc, collection, serverTimestamp } from "../firebase-config.js";

const wordsTableBody = document.getElementById("wordsTable").querySelector("tbody");
const phrasesTableBody = document.getElementById("phrasesTable").querySelector("tbody");
const wordsTable = document.getElementById("wordsTable");
const phrasesTable = document.getElementById("phrasesTable");
const wordsSwitchBtn = document.getElementById("wordsSwitchBtn");
const phrasesSwitchBtn = document.getElementById("phrasesSwitchBtn");
const backBtn = document.getElementById("backBtn");
const wordsTableMessageBox = document.getElementById("wordsTableMessage");
const phrasesTableMessageBox = document.getElementById("phrasesTableMessage");
const audioCache = {};
let vocab = {}; 
let wordsArray = [];
let phrasesArray = [];
let currentWordsResults = [];
let currentPhrasesResults = [];
let currentUser = null;
let fuseWords;
let fusePhrases;
let activeTab;
let isSearchActive;
let messageBox;

const tableCache = {
    vocab: "cachedVocab",
    vocabVersion: "cachedVocabVersion",
    proficiency: "cachedProficiency"
};
const VOCAB_VERSION = "1.2.2"

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        activeTab = "words";
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const serverVocabVersion = userDoc.data()?.vocabLastUpdatedTimestamp ?? null;
        const localVocabVersion = localStorage.getItem(tableCache.vocabVersion);

        // caching vocab data
        if (serverVocabVersion !== localVocabVersion || !localStorage.getItem(tableCache.vocab)){
            try {
                const response = await fetch(`/src/dictionary.json?v=${VOCAB_VERSION}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                vocab = await response.json();
                localStorage.setItem(tableCache.vocab, JSON.stringify(vocab));
                if (serverVocabVersion) {
                    localStorage.setItem(tableCache.vocabVersion, serverVocabVersion)
                }
                localStorage.removeItem(tableCache.proficiency)
            } catch (error) {
                console.error("Error fetching dictionary:", error);
            }
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
                const audio = new Audio(`/src/audio/${id}.mp3`);
                audio.load();
                audioCache[id] = audio;
            }
        };
        populateTable(wordsArray, wordsTableBody);
        populateTable(phrasesArray, phrasesTableBody);
        fuseWords = new Fuse(wordsArray, options);
        fusePhrases = new Fuse(phrasesArray, options);
        updateMessage(wordsArray, phrasesArray, false);
    }
    else{
        wordsArray = [];
        phrasesArray = [];
        currentWordsResults = [];
        currentPhrasesResults = [];
        vocabProficiencyData = [];
        isSearchActive = false;

        wordsTableBody.innerHTML = "";
        phrasesTableBody.innerHTML = "";

        backBtn.style.display = "none";
        searchQuery.value = "";

        const settingsLi = document.getElementById("settingsLi");
        settingsLi.style.display = "none";
        wordsTableMessageBox.textContent = "Sign in to view your vocabulary";
        activeTab = "words";
    }
});

wordsSwitchBtn.addEventListener("click", () => {
    wordsTable.style.display = "table";
    phrasesTable.style.display = "none";
    phrasesSwitchBtn.classList.remove("current");
    wordsSwitchBtn.classList.add("current");
    wordsTableMessageBox.style.display = "block";
    phrasesTableMessageBox.style.display = "none";
    activeTab = "words";
    if (!currentUser && isSearchActive){ 
        wordsTableMessageBox.textContent = "Sign in to search your vocabulary";
        return; 
    }
    else if (!currentUser && !isSearchActive){
        wordsTableMessageBox.textContent = "Sign in to view your vocabulary";
        return; 
    }    updateMessage(
        isSearchActive ? currentWordsResults : wordsArray,
        isSearchActive ? currentPhrasesResults : phrasesArray,
        isSearchActive
    )
});

phrasesSwitchBtn.addEventListener("click", () => {
    wordsTable.style.display = "none";
    phrasesTable.style.display = "table";
    wordsSwitchBtn.classList.remove("current");
    phrasesSwitchBtn.classList.add("current");
    wordsTableMessageBox.style.display = "none";
    phrasesTableMessageBox.style.display = "block";
    activeTab = "phrases"
    if (!currentUser && isSearchActive){ 
        phrasesTableMessageBox.textContent = "Sign in to search your vocabulary";
        return; 
    }
    else if (!currentUser && !isSearchActive){
        phrasesTableMessageBox.textContent = "Sign in to view your vocabulary";
        return; 
    }
    updateMessage(
        isSearchActive ? currentWordsResults : wordsArray,
        isSearchActive ? currentPhrasesResults : phrasesArray,
        isSearchActive
    )
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
        if (vocabProficiencyData[item.id] === "Bad"){
            proficencyCell.style.color = "red";
        }
        else{
            proficencyCell.style.color = "green";
        }
        row.appendChild(proficencyCell);
        
        table.appendChild(row);
    });
};  

const options = {
  keys: ["proficiency","english", "tamlish"],
  threshold: 0.4, 
};

function search(query){
    isSearchActive = true;
    if (currentUser){
        currentWordsResults = fuseWords.search(query).map(result => result.item); // only gets the  results not other data like score
        currentPhrasesResults = fusePhrases.search(query).map(result => result.item);
        populateTable(currentWordsResults, wordsTableBody);
        populateTable(currentPhrasesResults, phrasesTableBody);
        backBtn.style.display = "block";
        updateMessage(currentWordsResults, currentPhrasesResults, true);
        console.log("Words:", currentWordsResults);
        console.log("Phrases:", currentPhrasesResults);
    }
    else{
        backBtn.style.display = "block";
        messageBox = activeTab === "words" & isSearchActive ? wordsTableMessageBox : phrasesTableMessageBox;
        messageBox.textContent = "Sign in to search your vocab";
    }
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
    isSearchActive = false;
    backBtn.style.display = "none";
    searchQuery.value = "";
    if (!currentUser){
        messageBox = activeTab === "words" ? wordsTableMessageBox : phrasesTableMessageBox;
        messageBox.textContent = "Sign in to view your vocabulary";
        return;
    }
    populateTable(wordsArray, wordsTableBody);
    populateTable(phrasesArray, phrasesTableBody);
    updateMessage(wordsArray, phrasesArray, false)
}); 

function updateMessage(wordsData, phrasesData, isSearch = false){
    if (activeTab === "words"){
        if (wordsData.length === 0){
            wordsTableMessageBox.textContent = isSearch ? "No words found" : "No words learned yet";
        } else {
            wordsTableMessageBox.textContent = "";
        }
    } else {
        if (phrasesData.length === 0){
            phrasesTableMessageBox.textContent = isSearch ? "No phrases found" : "No phrases learned yet";
        } else {
            phrasesTableMessageBox.textContent = "";
        }
    }
}

