import { switchSection, oneElementSelector, markSection, switchedSectionTo, lessonDetails, timer, questionData, fetchLessonData } from "./lessonFunctions.js"; 

const continueBtn = document.getElementById("nextSectionBtn");
const imageSection = document.querySelector(".choose_picture");
const pickHeardWord = document.querySelector(".choose_heard_word");
const writeWord = document.querySelector(".writeWord")
const lessonEnd  = document.querySelector(".lesson_end");
const lessonTime = document.getElementById("lessonTime");
let time;

// TODO add selector ids

lessonDetails(4,"topic1", "lesson1");

async function startLesson(){
    await fetchLessonData();
    timer("start");
    switchSection(lessonEnd,imageSection)
    // Pick the correct image section
    oneElementSelector("imgs","img2");
    questionData("t1s1",true,"question1","soundBtn",null)
    markSection("", "selection", "pickHeardWord");
}

startLesson();

function continueLesson(){
    if (switchedSectionTo() === "pickHeardWord"){
        // Pick the correct heard word section
        switchSection(imageSection, pickHeardWord)
        questionData("t1s2", true, "question2", "soundBtn","null")
        oneElementSelector("heardWords","heardWord2")
        markSection("","selection", "writeEnglishWord1")
    }
    else if (switchedSectionTo() === "writeEnglishWord1"){
        // Write the english word section
        switchSection(pickHeardWord, writeWord)
        questionData("t1w1", false, "question3", "soundBtn", "tamlish")
        markSection("t1w1","typedInput","writeTamlishWord1")
    }
    else if (switchedSectionTo() === "writeTamlishWord1"){
        // Write the english word section
        switchSection(writeWord, writeWord)
        questionData("t1w1", false, "question3", "soundBtn", "english")
        markSection("t1w1","typedInput","lessonEnd")
    }
    else if (switchedSectionTo() === "lessonEnd"){
        // End of the lesson
        time = Math.floor(timer("stop")/1000);
        lessonTime.textContent = time + 's';
        switchSection(writeWord, lessonEnd)
    }
};

continueBtn.addEventListener("click", () => {
    continueLesson();
});

window.addEventListener("enterKeyPressed", () => {
    continueLesson();
});

