import { auth, doc, setDoc, db, onAuthStateChanged, getDoc, serverTimestamp } from "../../firebase-config.js";

let answered = false;
let switchedTo;
const root = document.documentElement;


// * lesson section types {current: imagesection, pickheardword, writeWord, lessonEnd } (new: pickwrittenword, picksoundheardword, speak and compare to acutal sound section etc)



let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    }
});

// Fetching data
let vocab;
const audioCache = {};
const imageCache = {}
const wordsShown = new Set();

async function fetchLessonData(){
    const basePath = window.location.hostname === '127.0.0.1' ? '/main' : '';
    const response = await fetch(`${basePath}/src/dictionary.json`);
    const data = await response.json();
    vocab = data;

    const audioFiles = Object.keys(vocab) // gets array of all vocab ids
      .filter(id => {
          return ((id.includes("w") || id.includes("p")) && id.startsWith(`t${topic.slice(-1)}`))
      })
      .map(id => `../../src/audio/${id}.mp3`);
    audioFiles.forEach(src => {
      const audio = new Audio(src);
      audio.load();
      audioCache[src] = audio;
    })
      
    Object.keys(vocab).filter(id => id.startsWith(`t${topic.slice(-1)}`)).forEach(id => {
      if (vocab[id].type === "image"){
          for (let i = 1; i <= 4; i++){
              const imagePath = `../../src/images/${id}/option${i}.png`;
              const img = new Image();
              img.src = imagePath;
              imageCache[imagePath] = img;
          }
      }
    })
    console.log("fetched lesson data")
};


// Lesson length and topic number
let lessonLengthValue;
let topic;
let lesson;

function lessonDetails(length, topicnum, lessonnum){
    lessonLengthValue = length;
    topic = topicnum;
    lesson = lessonnum; 

};

// Timer

let time;
let startTime;
let finalTime;
let timeSeconds;
let timeMinutes;
let sSecsTrue = "s"; 
let sMinsTrue = "s";

function timer(command){
    if (command === "start"){
        startTime = Date.now();
    }
    else if (command === "stop"){
        finalTime = Date.now();
        time = finalTime - startTime;
        timeSeconds = Math.floor(time/1000);
        timeMinutes = Math.floor(timeSeconds/60);
        if (timeMinutes = 1){
            sMinsTrue = "";
        }
        else if (timeSeconds = 1){
            sSecsTrue = "";
        }
        if (timeSeconds < 60){
            return `${timeSeconds} second${sSecsTrue}`
        }
        else{
            return `${timeMinutes} minute${sMinsTrue} ${timeSeconds % 60} second${sSecsTrue}`
        }
    }
}

// Change Lesson Section

const lessonHud = document.getElementById("hud");
const lessonEnd  = document.querySelector(".lesson_end");
const lessonOverlay = document.getElementById("lessonOverlay");

let displayedSection;

function switchSection(currentSection, nextSection) {
        currentSection.style.display = "none";
        currentSection.querySelectorAll(".clicked").forEach(el => el.classList.remove("clicked"));
        nextSection.style.display = "flex";
        displayedSection = nextSection;
        answered = false;
        resultBox.classList.remove("animated");
        resultBox.classList.add("notAnimated");
        sectionState = "answering";
        lessonOverlay.style.display = "none";
        clicked = 0;
        selectedFeedback = null;
        selectedElement = null;
        typedWordPointer.value = "";
        
        // Reset feedback buttons
        feedbackBtns.forEach(btn => {
            btn.classList.remove("feedbackClicked");
            btn.disabled = false;
        });
        
        if (nextSection === lessonEnd){
            lessonHud.style.display = "none";
            checkBtn.style.display = "none";
            lessonEnd.style.display = "flex";
            sectionState = "finished";
        }
        checkBtn.classList.remove("answered");
        selectorMessage.textContent = "";
};

// Setting question data + audio
const selectorMessage = document.getElementById("selectorMessage");

let answerLanguage;
let answerOption;
let sAnswer;

function questionData(vocabid, selector, wordElement, soundBtn, questionLanguage){
    const wordelement = document.getElementById(wordElement);
    const cachedProficiency = JSON.parse(localStorage.getItem("cachedProficiency")) || {};
    const soundbtn = displayedSection.querySelector(".soundBtn");

    if (questionLanguage){
        if (questionLanguage === "english"){
            answerLanguage = "tamlish"
        }
        else if (questionLanguage === "tamlish"){
            answerLanguage = "english"
        }
    };

    if (selector){
        // setting selector data e.g. image srcs
        const option1 = displayedSection.querySelector(".option1");
        const option2 = displayedSection.querySelector(".option2");
        const option3 = displayedSection.querySelector(".option3");
        const option4 = displayedSection.querySelector(".option4");
        let questionTextID;
        let sQuestionLanguage;
        questionTextID = vocab[vocabid].question[0];
        sQuestionLanguage = vocab[vocabid].question[1];
        answerOption = vocab[vocabid].answer;
        if(soundBtn){
            soundbtn.style.display = "block";
            const audiosrc = `../../src/audio/${questionTextID}.mp3`;
            const audio = audioCache[audiosrc];
            soundbtn.onclick = () => {
                if (audio){
                    audio.currentTime = 0;
                    audio.play();
                }
            };
        }
        else{
            soundbtn.style.display = "none";
        }
        if (vocab[vocabid].type === "image"){
            wordelement.textContent = vocab[questionTextID][sQuestionLanguage];

            option1.src = imageCache[`../../src/images/${vocabid}/option1.png`].src;
            option2.src = imageCache[`../../src/images/${vocabid}/option2.png`].src;
            option3.src = imageCache[`../../src/images/${vocabid}/option3.png`].src;
            option4.src = imageCache[`../../src/images/${vocabid}/option4.png`].src;

            wordsShown.add(questionTextID);
            selectorMessage.textContent = `${vocab[questionTextID].tamlish} means ${vocab[questionTextID].english}!`;
        }
        else if (vocab[vocabid].type === "heardWord"){
            option1.textContent = vocab[vocab[vocabid].questiondata[0]][sQuestionLanguage];
            option2.textContent = vocab[vocab[vocabid].questiondata[1]][sQuestionLanguage];
            option3.textContent = vocab[vocab[vocabid].questiondata[2]][sQuestionLanguage];
            option4.textContent = vocab[vocab[vocabid].questiondata[3]][sQuestionLanguage];
            
            sAnswer = vocab[questionTextID][sQuestionLanguage];

            const isNew = !wordsShown.has(questionTextID) && (!cachedProficiency || !cachedProficiency[questionTextID]);
            
            if (isNew) {
                wordsShown.add(questionTextID);
            }

            if (isNew){
                selectorMessage.textContent = `${vocab[questionTextID].tamlish} means ${vocab[questionTextID].english}!`;
            }
            else{
                selectorMessage.textContent = "";
            }

            const vocabTypeText = displayedSection.querySelector(".vocabType");

            if (questionTextID.includes("w")){
                vocabTypeText.textContent = "word";
            }
            else if (questionTextID.includes("p")){
                vocabTypeText.textContent = "phrase";
            }
        }
    }
    else{
        const qLanguage = displayedSection.querySelector(".Qlanguage");

        wordelement.textContent = vocab[vocabid][questionLanguage];
        
        if (questionLanguage === "tamlish"){
            qLanguage.textContent = "English"
        }
        else if (questionLanguage === "english"){
            qLanguage.textContent = "Tamlish"
        }

        if (soundBtn){
            soundbtn.style.display = "block";
            soundbtn.onclick = () => {
                const audiosrc = `/src/audio/${vocabid}.mp3`;
                const audio = audioCache[audiosrc];
                if (audio){
                    audio.currentTime = 0;
                    audio.play();
                }
            };
        }
        else{
            soundbtn.style.display = "none";
        }
    }
};

// Singular correct element selection logic
let selectedElement;
let elements;
function oneElementSelector(elementsClass) {
    elements = document.querySelectorAll(`.${elementsClass}`);
    elements.forEach(element => {
        element.addEventListener("click", () => {
            elements.forEach(elmnt => {
                elmnt.classList.remove("clicked");
            });
            element.classList.add("clicked");
            selectedElement = [...element.classList].find(c => c.startsWith("option"));;
            console.log(selectedElement);
            answered = true;
            checkBtn.classList.add("answered");
            console.log("answered:", answered);
        });
    });
};

// Escape key logic
const cancelLessonBox = document.getElementById("cancelLessonBox");
const quitLessonBtn = document.getElementById("quitLessonBtn");
const continueBtn = document.getElementById("cancelBtn");
const exitBtn = document.getElementById("exitbtn");

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape"){
        if (selectedElement && elements && lessonOverlay.style.display === "none"){
            elements.forEach(elmnt => {
            elmnt.classList.remove("clicked");
            });
            answered = false;
            selectedElement = null;
            checkBtn.classList.remove("answered");
        } 
        else if (document.activeElement.tagName === "INPUT"){
            document.activeElement.blur();
        }
        else if (cancelLessonBox.classList.contains("animated")){
            cancelLessonBox.classList.add("notAnimated");
            cancelLessonBox.classList.remove("animated");
        }
        else{
            cancelLessonBox.classList.remove("notAnimated");
            cancelLessonBox.classList.add("animated");
            console.log("tried to escape lesson");
        }
    }
});

quitLessonBtn.addEventListener("click", () =>{
    window.location.href = "../../public/lessons.html";
})

continueBtn.addEventListener("click", () =>{
    cancelLessonBox.classList.remove("animated");
    cancelLessonBox.classList.add("notAnimated");
})

exitBtn.addEventListener("click", () => {
    cancelLessonBox.classList.remove("notAnimated");
    cancelLessonBox.classList.add("animated");
})

// TODO fix enter and escape logic - bit buggy

// Section Marker
let currentAnswerID;
let currentAnswer;
let currentQuestionType;
let typedValue;
let switchedToSection;
let editDistance;
let currentEditDistance;
let correctLength;
let clicked = 0;
let sectionState = "answering";
let vocabData;
let selectedFeedback;
let listQuestionResults = [];
let maxLines = 5;
const checkBtn = document.querySelector(".checkBtn");
const typedWordPointer = document.querySelector(".typedWord");
const resultBox = document.querySelector(".resultBox");
const messageOverview = document.getElementById("messageBox");
const answerMessage = document.getElementById("answerMessage");
const userFeedbackBox = document.getElementById("userFeedbackBox");
const feedbackBtns = document.querySelectorAll(".feedbackBtn");
const imageSection = document.querySelector(".choose_picture");

function markSection(answerID, questionType, switchedToSectionpointer) {
    currentAnswerID = answerID;
    currentQuestionType = questionType;
    switchedToSection = switchedToSectionpointer;
};

function setColours(resultsBoxcolour, nextsectionBtncolour){
    root.style.setProperty("--resultBox-bg-colour", resultsBoxcolour);
    root.style.setProperty("--nextSectionBtn-bg-colour", nextsectionBtncolour)
}

function setMessages(messageoverview, answermessage){
    console.log("message set");
    messageOverview.textContent = messageoverview;
    answerMessage.textContent = answermessage;
}

feedbackBtns.forEach(button => {
    button.addEventListener("click", (event) =>{
        feedbackBtns.forEach(btn =>{
            btn.classList.remove("feedbackClicked");
            btn.disabled = true;
        })
        event.currentTarget.classList.add("feedbackClicked");
        const btnID = event.currentTarget.id;
        if (btnID === "goodProficiencyBtn"){
            selectedFeedback = "Good";
        }
        else if (btnID === "neutralProficiencyBtn"){
            selectedFeedback = "Neutral";
        }
        else if (btnID === "badProficiencyBtn"){
            selectedFeedback = "Bad";
        }
        addWordtoTopic("incorrect", currentAnswerID);
    })
})


async function addWordtoTopic(answerstatus, vocabID){
    if (answerstatus === "correct"){
        vocabData = "Good";
    }
    else if (answerstatus === "mostlyCorrect"){
        vocabData = "Neutral"
    }
    else if (answerstatus === "incorrect"){
        vocabData = selectedFeedback ?? "Bad";
    }

    if (currentUser){
        const userID = currentUser.uid;
        try{
            const wordsDocRef = doc(db, "users", userID, "topics", topic, "vocab", "words");
            const wordsDoc = await getDoc(wordsDocRef);
            const newWord = !wordsDoc.data()?.[vocabID];
            await setDoc(wordsDocRef, {
                [vocabID]: vocabData
            }, { merge: true });
            console.log(`added proficency of ${vocabData} to ${vocabID}`);
            const topicDocRef = doc(db, "users", userID, "topics", topic);
            await setDoc(topicDocRef, {
                "status": "active"
            }, { merge: true });

            // will only update server timestamp if new word is added, proficiency updates have no need to fetch from firestore
            if (newWord){
                await setDoc(doc(db, "users", currentUser.uid),{
                    vocabLastUpdatedTimestamp: serverTimestamp()
                }, { merge: true });
            }

            const cachedProficiency = JSON.parse(localStorage.getItem("cachedProficiency")) || {} // || {} to make sure no errors occur - empty object
            cachedProficiency[vocabID] = vocabData;
            localStorage.setItem("cachedProficiency", JSON.stringify(cachedProficiency));
        }
        catch (error){
            console.log("error with database", error)
        }
    }
};

typedWordPointer.addEventListener("input", () =>{
    typedValue = typedWordPointer.value.trim();
    if (typedValue.length > 0){
        answered = true;
        checkBtn.classList.add("answered");
    }
    else{
        answered = false;
        checkBtn.classList.remove("answered");
    }
})

typedWordPointer.addEventListener('keydown', (e) => {
    const lines = typedWordPointer.value.split('\n').length;
    if (e.key === 'Enter' && lines >= maxLines) {
        e.preventDefault(); // prevents new lines
    }
});
typedWordPointer.addEventListener('input', () => {
  if (typedWordPointer.scrollHeight > typedWordPointer.clientHeight) {
    typedWordPointer.value = typedWordPointer.value.slice(0, -1); // prevents further typing after cap
  } 
});

function mark(){
    if (sectionState !== "answering") return; //exits if mark has already been called once
    if (currentQuestionType === "typedInput"){
        currentAnswer = vocab[currentAnswerID][answerLanguage].toLowerCase().split(" ");
    }
    else if (currentQuestionType === "selection"){
        currentAnswer = answerOption;
    }
    typedValue = typedWordPointer.value.trim();
    if (answered){
        typedWordPointer.blur(); // deselects input box
        switchedTo = switchedToSection;
        if (currentQuestionType === "selection"){
            if (currentAnswer === selectedElement) {
                console.log("correct");
                setColours("rgb(5, 149, 15)", "rgb(0, 170, 11)");
                setMessages("Well Done!","");
                addWordtoTopic("correct", currentAnswerID);
                listQuestionResults.push("Correct");
                userFeedbackBox.style.display = "none";
            }
            else{
                console.log("incorrect");
                setColours("rgb(230, 0, 35)", "rgb(255, 66, 66)");
                if (displayedSection === imageSection){
                    let outputtedAnswer = currentAnswer.charAt(0).toUpperCase()+currentAnswer.slice(1)
                    setMessages("Incorrect",`The correct answer was ${outputtedAnswer.slice(0,-1)+" " + outputtedAnswer.slice(-1)}`);
                }
                else{
                    setMessages("Incorrect", `The correct answer was "${sAnswer}"`)
                }
                addWordtoTopic("incorrect", currentAnswerID);
                listQuestionResults.push("Incorrect");
                userFeedbackBox.style.display = "block";
            }
        }
        else if (currentQuestionType === "typedInput"){
            typedValue = typedValue.toLowerCase().split(" ");
            if (typedValue.length === currentAnswer.length){
                correctLength = true;
            }
            else{
                correctLength = false;
                console.log("incorrect");
                setColours("rgb(230, 0, 35)", "rgb(255, 66, 66)");
                setMessages("Incorrect",`The correct answer was "${currentAnswer.join(" ")}"`);
                userFeedbackBox.style.display = "block";
                addWordtoTopic("incorrect", currentAnswerID);
                listQuestionResults.push("Incorrect");
            }
            if (correctLength){
                let arrayDistances = [];
                for (let i = 0; i < typedValue.length; i++){
                    const wordI = typedValue[i];
                    const wordA = currentAnswer[i];
                    currentEditDistance = levenshtein(wordA, wordI).steps;
                    arrayDistances.push(currentEditDistance);
                }
                editDistance = Math.max(...arrayDistances) // ... spread operator converts array    into individual numbers
                console.log("edit distance: ", editDistance);
                if (editDistance === 1){
                    console.log("correct");
                    setColours("rgb(5, 149, 15)", "rgb(0, 170, 11)");
                    setMessages("Well Done!",`The complete correct answer is "${currentAnswer.join(" ")}"`);
                    userFeedbackBox.style.display = "none";
                    addWordtoTopic("mostlyCorrect", currentAnswerID);
                    listQuestionResults.push("Correct");
                }
                else if (editDistance === 0){
                    console.log("correct");
                    setColours("rgb(5, 149, 15)", "rgb(0, 170, 11)");
                    setMessages("Perfect","");
                    userFeedbackBox.style.display = "none";
                    addWordtoTopic("correct", currentAnswerID);
                    listQuestionResults.push("Correct");
                }
                else{
                    console.log("incorrect");
                    setColours("rgb(230, 0, 35)", "rgb(255, 66, 66)");
                    setMessages("Incorrect",`The correct answer was "${currentAnswer.join(" ")}"`);
                    userFeedbackBox.style.display = "block";
                    addWordtoTopic("incorrect", currentAnswerID);
                    listQuestionResults.push("Incorrect");
                }
            }
        }
        resultBox.classList.remove("notAnimated");
        resultBox.classList.add("animated");
        lessonOverlay.style.display = "block";
        clicked ++
        if (clicked === 1){
            increaseProgress(lessonLengthValue);
        }
        sectionState = "marked";
    }
};

checkBtn.addEventListener("click", () => {
    mark();
});


window.addEventListener("keydown", (event) => {
    if (cancelLessonBox.classList.contains("animated")) return;
    if (event.key === "Enter" && sectionState === "finished"){
        endLessonBtn.click();
        return;
    }
    if (sectionState === "finished") return;
    if (event.key === "Enter" && sectionState === "answering"){
        mark();
    }
    else if(event.key === "Enter" && sectionState === "marked"){
        window.dispatchEvent(new CustomEvent("enterKeyPressed"));
        if (switchedTo !== "lessonEnd"){
            sectionState = "answering"; // To allow more clicks for next sections
        }
        else{
            sectionState = "finished";
        }
    }
})

// Progress bar

const progressBar = document.getElementById("progressBar");
let progress = 0;

function increaseProgress(lessonLength) {
    if (progress < 100){
        progress += (100/lessonLength);
        progressBar.style.width = progress + '%';
    }
};

// End of the lesson

const endLessonBtn = document.getElementById("endLessonBtn");
const exampleLessonSection = document.getElementById("exampleLessonSection");
const exitExampleBtn = document.getElementById("exitExampleBtn");

endLessonBtn.addEventListener("click", async () =>{
    if (currentUser){
        try{
            const userID = currentUser.uid;
            const lessonStatusDocRef = doc(db, "users", userID, "lessonStatuses", "lessonStatus")
            await setDoc(lessonStatusDocRef, {
                [topic+lesson]: "completed"
            }, { merge: true });
        }   
        catch (error){
            console.log("error",error);
        }
        window.location.href = "../../public/lessons.html";
    }
    else{
        lessonEnd.style.display = "none";
        exampleLessonSection.style.display = "flex";
        exitExampleBtn.onclick = () => {window.location.href = "../../public/lessons.html"};
    }
});


const table = document.getElementById("questionMarks");
const averageBox = document.getElementById("average");
let markNum = 0;
let average;

function questionResults(){
    listQuestionResults.forEach((result, index) => {
        const tableRow = table.insertRow();
        tableRow.insertCell().textContent = `Q${index+1}`;
        tableRow.insertCell().textContent = result;
        const resultCell = tableRow.cells[1];
        if (result === "Correct"){
            markNum += 1
        }       
        if (result === "Correct"){
            resultCell.style.color = "green";
        } 
        else {
            resultCell.style.color = "red";
        }
    });
    average = markNum/lessonLengthValue;
    averageBox.textContent = `${Math.floor(average*100)}%`
}

function switchedSectionTo(){
    return switchedTo;
}

// Exporting Functions
export { switchSection, oneElementSelector, markSection, switchedSectionTo, lessonDetails, timer, questionData, fetchLessonData, questionResults };