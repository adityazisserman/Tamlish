import { auth, onAuthStateChanged, getDoc, db, doc } from "../firebase-config.js";

const exampleLessonSection = document.getElementById("exampleLessonBanner");
const actualLessons = document.querySelectorAll(".actualLessons");
let currentUser;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        exampleLessonSection.style.display = "none";
        actualLessons.forEach(lesson => {
            lesson.classList.remove("greyedOut");
        });

        const userID = currentUser.uid;
        const lessonStatusDoc = await getDoc(doc(db, "users", userID, "lessonStatuses", "lessonStatus"))

        
        if (lessonStatusDoc.exists()){
            const lessonStatusesData = lessonStatusDoc.data();
            actualLessons.forEach(lesson => {
                const lessonid = lesson.id
                if (lessonStatusesData[lessonid] === "completed"){
                    lesson.classList.add("completed");
                    lesson.querySelector(".completedBool").textContent = "(Review)";
                }
            })
            
        }
        else{
            console.log("no lesson status doc")
        }
    }
    else{
        const settingsLi = document.getElementById("settingsLi");
        settingsLi.style.display = "none";
        exampleLessonSection.style.display = "block";
        actualLessons.forEach(lesson => {
            lesson.classList.add("greyedOut");
        });
    }
});
