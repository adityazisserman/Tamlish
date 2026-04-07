import { auth, onAuthStateChanged, db, getDoc, doc, setDoc, updateEmail, signInWithEmailAndPassword, updatePassword } from "../firebase-config.js";

const usernameSection = document.getElementById("usernameSection");
const emailSection = document.getElementById("emailSection");
const passwordSection = document.getElementById("passwordSection");
const setUsernameBtn = document.getElementById("setUsernameBtn");
const setEmailBtn = document.getElementById("setEmailBtn");
const nameInput = document.getElementById("usernameChange");
const emailInput = document.getElementById("emailChange");

// TODO add forgot password option + update auth error messages

onAuthStateChanged(auth, (user) => {
    if (user != null) {
        user.providerData.forEach((profile) => {
            if (profile.providerId !== "google.com") {
                emailSection.style.display = "flex"
                passwordSection.style.display = "flex"
            }
        });
    }
});


setUsernameBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    const userFileRef = doc(db, "users", user.uid);
    const newUsername = {
        username: nameInput.value
    }
    await setDoc(userFileRef, newUsername, { merge: true });
})

const EVpg = document.getElementById("loginpg1");
const sign_in_email = EVpg.querySelector("input[type='email']");
const sign_in_password = EVpg.querySelector("input[type='password']");
const EVBtn = document.getElementById("EVBtn");
const EVexitBtn = document.getElementById("EVexitBtn");
const errorPages1 = document.getElementById("errorPages1");
const errorPages2 = document.getElementById("errorPages2");

setEmailBtn.addEventListener("click", () => {
    EVpg.style.display = "flex";
    EVexitBtn.addEventListener("click", () => {
        EVpg.style.display = "none"
    })
    EVBtn.addEventListener("click", () => {
        signInWithEmailAndPassword(auth, sign_in_email.value, sign_in_password.value)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log("User signed in:", user.email);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log("Sign in error:", errorCode, errorMessage)
                errorPages1.textContent = errorMessage
            });
        const user = auth.currentUser;

        updateEmail(user, emailInput.value)
            .then(() => {
                console.log("Email updated!");
                EVpg.style.display = "none";
            })
            .catch((error) => {
                const errorMessage = error.message;
                console.log(error);
                errorPages2.textContent = errorMessage;
            });
    })
});

const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const newPassword = document.getElementById("newPassword");
const PVpg = document.getElementById("loginpg2");
const passwordEmailVerifier = PVpg.querySelector("input[type='email']");
const passwordPasswordVerifier = PVpg.querySelector("input[type='password']");
const PVBtn = document.getElementById("PVBtn");
const PVexitBtn = document.getElementById("PVexitBtn");
const errorPagess1 = document.getElementById("errorPagess1");
const errorPagess2 = document.getElementById("errorPagess2");

resetPasswordBtn.addEventListener("click", () => {
    PVpg.style.display = "flex";
    PVexitBtn.addEventListener("click", () => {
        PVpg.style.display = "none"
    })
    PVBtn.addEventListener("click", () => {
        signInWithEmailAndPassword(auth, passwordEmailVerifier.value, passwordPasswordVerifier.value)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log("User signed in:", user.email);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log("Sign in error:", errorCode, errorMessage)
                errorPagess1.textContent = errorMessage;
            });
        const user = auth.currentUser;

        updatePassword(user, newPassword.value)
            .then(() => {
                console.log("Password updated!");
                PVpg.style.display = "none";
            })
            .catch((error) => {
                const errorMessage = error.message;
                console.log(error);
                errorPagess2.textContent = errorMessage;
            });
    })
});