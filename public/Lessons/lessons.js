import { auth, onAuthStateChanged } from "../firebase-config.js";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    }
    else{
        const settingsLi = document.getElementById("settingsLi");
        settingsLi.style.display = "none";
    }
    const exampleLessonSection = document.getElementById("exampleLessonBanner");
    const actualLessons = document.querySelectorAll(".actualLessons");

    if (currentUser){
        actualLessons.forEach(lesson => {
            lesson.classList.remove("greyedOut");
        });
    }
    else{
        exampleLessonSection.style.display = "block";
        actualLessons.forEach(lesson => {
            lesson.classList.add("greyedOut");
        });
    }
});

