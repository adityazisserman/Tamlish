import { switchSection, oneElementSelector, markSection, switchedSectionTo, lessonDetails, timer, questionData, fetchLessonData, questionResults } from "./lessonFunctions.js"; 

const continueBtn = document.getElementById("nextSectionBtn");
const imageSection = document.querySelector(".choose_picture");
const pickHeardWord = document.querySelector(".choose_heard_word");
const writeWord = document.querySelector(".writeWord")
const lessonEnd  = document.querySelector(".lesson_end");
const lessonTime = document.getElementById("lessonTime");

lessonDetails(11,"t1", "l1");

async function startLesson(){
    await fetchLessonData();
    timer("start");
    // Pick the correct image section
    switchSection(lessonEnd,imageSection)
    oneElementSelector("imgs");
    questionData("t1s1",true,"question1","soundBtn",null)
    markSection("t1s1", "selection", "pickHeardWord1");
}

startLesson();

function continueLesson(){
    if (switchedSectionTo() === "pickHeardWord1"){
        // Pick the correct heard word section
        switchSection(imageSection, pickHeardWord)
        questionData("t1s2", true, "question2", "soundBtn","null")
        oneElementSelector("heardWords")
        markSection("t1s2","selection", "pickCorrectImage")
    }
    else if (switchedSectionTo() === "pickCorrectImage"){
        // Pick the correct image section
        switchSection(pickHeardWord,imageSection)
        oneElementSelector("imgs");
        questionData("t1s3",true,"question1","soundBtn",null)
        markSection("t1s3", "selection", "pickHeardWord2");
    }
    else if (switchedSectionTo() === "pickHeardWord2"){
        // Pick the correct heard word section
        switchSection(imageSection, pickHeardWord)
        questionData("t1s4", true, "question2", "soundBtn","null")
        oneElementSelector("heardWords")
        markSection("t1s4","selection", "writeTamlishWord1")
    }
    else if (switchedSectionTo() === "writeTamlishWord1"){
        // Write the tamlish word section
        switchSection(pickHeardWord, writeWord)
        questionData("t1w1", false, "question3", "soundBtn", "english")
        markSection("t1w1","typedInput","writeEnglishWord1")
    }
    else if (switchedSectionTo() === "writeEnglishWord1"){
        // Write the english word section
        switchSection(writeWord, writeWord)
        questionData("t1w2", false, "question3", "soundBtn", "tamlish")
        markSection("t1w2","typedInput","writeEnglishWord2")
    }
    else if (switchedSectionTo() === "writeEnglishWord2"){
        // Write the english word section
        switchSection(writeWord, writeWord)
        questionData("t1w1", false, "question3", "soundBtn", "tamlish")
        markSection("t1w1","typedInput","writeTamlishWord2")
    }
    else if (switchedSectionTo() === "writeTamlishWord2"){
        // Write the tamlish word section
        switchSection(writeWord, writeWord)
        questionData("t1w2", false, "question3", "soundBtn", "english")
        markSection("t1w2","typedInput","hearPhrase1")
    }
    else if (switchedSectionTo() === "hearPhrase1"){
        // Hear the phrase section
        switchSection(writeWord, pickHeardWord)
        questionData("t1s5", true, "question2", "soundBtn", "english")
        markSection("t1s5","selection","writeTamlishPhrase1")
    }
    else if (switchedSectionTo() === "writeTamlishPhrase1"){
        // Write the tamlish phrase section
        switchSection(pickHeardWord, writeWord)
        questionData("t1p1", false, "question3", "soundBtn", "english")
        markSection("t1p1","typedInput","writeEnglishPhrase1")
    }
    else if (switchedSectionTo() === "writeEnglishPhrase1"){
        // Write the english phrase section
        switchSection(writeWord, writeWord)
        questionData("t1p1", false, "question3", "soundBtn", "tamlish")
        markSection("t1p1","typedInput","lessonEnd")
    }
    else if (switchedSectionTo() === "lessonEnd"){
        // End of the lesson
        lessonTime.textContent = timer("stop");
        questionResults();
        switchSection(writeWord, lessonEnd)
    }
};

continueBtn.addEventListener("click", () => {
    continueLesson();
});

window.addEventListener("enterKeyPressed", () => {
    continueLesson();
});

