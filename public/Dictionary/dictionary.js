import { auth, onAuthStateChanged, db, doc, getDocs, getDoc, collection } from "../firebase-config.js";

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
let fuseWords;
let fusePhrases;
// add laoding scrren + no searhc results + no vocab leartn when not singed in

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const response = await fetch("dictionary.json");
        vocab = await response.json();
        await loadVocabProficiency();
        for (let id in vocab){
            if (id.includes("w")){
                wordsArray.push({ id: id, proficiency: vocabProficiencyData[id], english: vocab[id].english, tamlish: vocab[id].tamlish });
            }
            else if (id.includes("p")){
                phrasesArray.push({ id: id, proficiency: vocabProficiencyData[id], english: vocab[id].english, tamlish: vocab[id].tamlish });
            }
          }
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
    try{
        const topicsQuery = await getDocs(collection(db, "users", currentUser.uid, "topics"));
        for (const topic of topicsQuery.docs){
            const wordsProficiencyDocRef = doc(db, "users", currentUser.uid, "topics", topic.id, "vocab", "words");
            const wordsProficiencyDoc = await getDoc(wordsProficiencyDocRef);
            const topicVocabProficiencyData = wordsProficiencyDoc.data() || {};
            vocabProficiencyData = {...vocabProficiencyData, ...topicVocabProficiencyData};
        }
    }
    catch(error){
        console.log("error: ",error);
    }
}


function populateTable(array, table) {
    table.innerHTML = "";

    array.forEach(item => {
        const row = document.createElement("tr");
        row.id = item.id;

        const listenCell = document.createElement("td");
        const icon = document.createElement("span");
        icon.className = "material-symbols-outlined";
        icon.textContent = "volume_up";
        listenCell.appendChild(icon);
        row.appendChild(listenCell);

        const englishCell = document.createElement("td");
        englishCell.textContent = item.english;
        row.appendChild(englishCell);

        const tamlishCell = document.createElement("td");
        tamlishCell.textContent = item.tamlish;
        row.appendChild(tamlishCell);

        const proficencyCell = document.createElement("td");
        proficencyCell.textContent = vocabProficiencyData[item.id];
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
}


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
})

