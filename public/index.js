
// login/signup

import { auth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, db, collection, doc, getDoc, setDoc, addDoc, getDocs, sendPasswordResetEmail } from "./firebase-config.js";

const loginpg = document.getElementById("loginpg");
const LIexitBtn = document.getElementById("LIexitBtn");
const SUexitBtn = document.getElementById("SUexitBtn");
const signinBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const signuppg = document.getElementById("signuppg");
const resetPasswordpg = document.getElementById("resetPasswordpg");
const signUp = document.getElementById("signUp");
const login = document.getElementById("login");
const wrapper = document.getElementById("wrapper");
const signoutBtn = document.getElementById("signoutBtn");
const getStartedBtn = document.getElementById("getStartedBtn");
const haveAccountBtn = document.getElementById("signinBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const sendPasswordResetEmailBtn = document.getElementById("sendPasswordResetEmailBtn");
const RPexitBtn = document.getElementById("RPexitBtn");
const sign_in_email = loginpg.querySelector("input[type='email']");
const sign_in_password = loginpg.querySelector("input[type='password']");
const sign_up_email = signuppg.querySelector("input[type='email']");
const sign_up_password = signuppg.querySelector("input[type='password']");
const utilitiesNavbar = document.getElementById("utilities");
const passwordResetEmail = document.getElementById("passwordResetEmail");
const stats = document.getElementById('statsGUI');
const errorpage1 = document.getElementById("errorPage1");
const errorpage2 = document.getElementById("errorPage2");

document.addEventListener("keydown", (event) =>{
  if (event.key === "Escape"){
    if (document.activeElement.tagName === "INPUT"){
      document.activeElement.blur();
    }
    else{
      loginpg.style.display = "none";
      signuppg.style.display = "none";
      resetPasswordpg.style.display = "none";
    }
  }
})

document.addEventListener("mousedown", (event) =>{
  if (stats.style.display !== "none"  && !stats.contains(event.target)){
    stats.style.display = "none";
  }
})

signinBtn.addEventListener("click", () => {
    loginpg.style.display = "flex";
    errorpage1.textContent = ""
    errorpage2.textContent = ""
    document.body.style.overflow = "hidden" // disables scrolling
});

if (document.title === "Tamlish"){
  getStartedBtn.addEventListener("click", () => {
    signuppg.style.display = "flex";
    document.body.style.overflow = "hidden"
});
}

haveAccountBtn.addEventListener("click", () =>{
  signuppg.style.display = "none";
  loginpg.style.display = "flex";
})

LIexitBtn.addEventListener("click", () => {
    loginpg.style.display = "none";
    document.body.style.overflow = "auto";
});

signupBtn.addEventListener("click", () => {
    loginpg.style.display = "none";
    signuppg.style.display = "flex";
});

SUexitBtn.addEventListener("click", () => {
    signuppg.style.display = "none";
    document.body.style.overflow = "auto";
});

async function generateUserFile(user){
  const userID = user.uid;
  await setDoc(doc(db, "users", userID), {
    username: ""
  });
}

signUp.addEventListener("click", () => {
  createUserWithEmailAndPassword(auth, sign_up_email.value, sign_up_password.value)
  .then(async (userCredential) => {
    // Signed up 
    const user = userCredential.user;
    await generateUserFile(user);
    console.log("User created:", user.email);
    document.body.style.overflow = "auto";
    signuppg.style.display = "none"  
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.error("Registration error:", errorCode, errorMessage);
    errorpage2.textContent = errorMessage
  });
});

login.addEventListener("click", () => {
  signInWithEmailAndPassword(auth, sign_in_email.value, sign_in_password.value)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    console.log("User signed in:", user.email); 
    document.body.style.overflow = "auto";
    loginpg.style.display = "none" })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log("Sign in error:", errorCode, errorMessage)
    errorpage1.textContent = errorMessage
  });
})

forgotPasswordBtn.addEventListener("click", () =>{
  resetPasswordpg.style.display = "flex";
  loginpg.style.display = "none";
  const resetEmailMessage = document.getElementById("confirmationMessage");
  sendPasswordResetEmailBtn.addEventListener("click", ()=>{
    sendPasswordResetEmail(auth, passwordResetEmail.value)
    .then(async () => {
      resetEmailMessage.textContent = "Reset email sent"
    })
    .catch((error) =>{
      console.log(error);
      resetEmailMessage.textContent("Error: ", error.message)
    })
  })
})

RPexitBtn.addEventListener("click", () =>{
  resetPasswordpg.style.display = "none";
})

let displayName;

function getProviderDisplayName(user){
    for (const profile of user.providerData) {
    const providerId = profile.providerId;
    console.log("Provider ID:", providerId);
    if (providerId === "password") {
      const name = user.email.split("@")[0];
      console.log("Display name from email:", name);
      return name;
    } 
    else if (providerId === "google.com") {
      const name = user.displayName;
      console.log("Display name from Google:", name);
      return name;
    }
  } 
}

onAuthStateChanged(auth, (user) => {
  if (user !== null) {
    const userFileRef = doc(db, "users", user.uid);
    getDoc(userFileRef).then((snap) =>{
      if (snap.exists() && snap.data().username !== ""){
        displayName = snap.data().username;
      }
      else if ((snap.exists() && snap.data().username === "") || (!snap.exists())){
        displayName = getProviderDisplayName(user);
      }
      signinBtn.textContent = displayName;
      signinBtn.id = "displayNameBtn";
      wrapper.id = "wrapper1"
      const wrapper1 = document.getElementById("wrapper1")
      wrapper1.style.width = `${displayName.length * 1.1}ch`;

      const statsexitBtn = document.getElementById("statsexitBtn")

      utilitiesNavbar.style.display = "flex";

      const settingsLi = document.getElementById("settingsLi");
      settingsLi.style.display = "block";

      wrapper1.addEventListener("click", async (e) => {
            console.log("wrapper1 clicked, stats display:", stats.style.display) // ← add this
        if (auth.currentUser){
          if (stats.style.display !== "flex"){
            stats.style.display = "flex"

            // loading user stats

            const wordsGoodLearnt = document.getElementById("wordsGoodLearnt");
            const wordsNeutralLearnt = document.getElementById("wordsNeutralLearnt");
            const wordsBadLearnt = document.getElementById("wordsBadLearnt");
            const lessonsCompleted = document.getElementById("lessonsCompleted");
            const topicsCollectionRef = await getDocs(collection(db, "users", user.uid, "topics"));
            const lessonStatusesDocRef = await getDoc(doc(db, "users", user.uid, "lessonStatuses",  "lessonStatus"));
            let wordsGoodLearntNum = 0;
            let wordsNeutralLearntNum = 0;
            let wordsBadLearntNum = 0;
            let lessonsCompletedNum = 0;

            for (const topic of topicsCollectionRef.docs){
              const wordsDocRef = await getDoc(doc(db, "users", user.uid, "topics", topic.id,   "vocab", "words"));
              if (!wordsDocRef.exists()) continue;
              const wordsData = wordsDocRef.data();
            
              for (const [wordID, proficency] of Object.entries(wordsData)){
                if (wordID.includes("w") || wordID.includes("p")){
                  if(proficency === "Good"){
                    wordsGoodLearntNum += 1;
                  }
                  else if (proficency === "Neutral"){
                    wordsNeutralLearntNum += 1;
                  }
                  else if (proficency === "Bad"){
                    wordsBadLearntNum += 1;
                  }
                }
              
              }
            };

            if (lessonStatusesDocRef.exists()){
              const lessonStatuses = lessonStatusesDocRef.data();
              for (const [lessonId, lessonStatus] of Object.entries(lessonStatuses)){
                if (lessonStatus === "completed"){
                  lessonsCompletedNum += 1;
                }
              }
            }

            wordsGoodLearnt.textContent = wordsGoodLearntNum;
            wordsNeutralLearnt.textContent = wordsNeutralLearntNum;
            wordsBadLearnt.textContent = wordsBadLearntNum;
            lessonsCompleted.textContent = lessonsCompletedNum;
          }
          else{
            stats.style.display = "none";
          }
        }
      })

      wrapper1.addEventListener("mousedown", (e) => {
          e.stopPropagation();
      });

      stats.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      statsexitBtn.addEventListener("click", (e) => {
        e.stopPropagation();   // stop the click from reaching wrapper1
        stats.style.display = "none";
      })

      signoutBtn.addEventListener("click", () => {
        signOut(auth)
          .then(() => {
            console.log("User signed out");
            signinBtn.id = "signinBtn"
            signinBtn.textContent = "Sign In"
            wrapper.id = "wrapper"
            stats.style.display = "none"
            signinBtn.style.visibility = "visible";
            location.reload();
          })
          .catch((error) => {
            console.error(error);
          });
      })
  })
  }
  else {
    signinBtn.style.visibility = "visible";
    utilitiesNavbar.style.display = "flex";
    const settingsLi = document.getElementById("settingsLi");
    settingsLi.style.display = "none";
  }
})

const provider = new GoogleAuthProvider();
const googleBtns = document.querySelectorAll(".googleLoginBtn")

googleBtns.forEach((googleBtn) =>{
  googleBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(async (result) => {
      // This gives you a Google Access Token. You can use it to access the Google API
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info
      const user = result.user;

      const userFileRef = doc(db, "users", user.uid);
      const snap = await getDoc(userFileRef);
      if (!snap.exists()){
        await generateUserFile(user)
      }

      console.log("User signed in:", result.user.displayName)
      loginpg.style.display = "none"
      signuppg.style.display = "none"
      document.body.style.overflow = "auto";
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // The AuthCredential type that was used
      const credential = GoogleAuthProvider.credentialFromError(error)
      console.log("Error:", errorCode, error.message)
      errorpage1.textContent = errorMessage
      errorpage2.textContent = errorMessage
    });

})
})
