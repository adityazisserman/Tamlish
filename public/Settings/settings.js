import { auth, onAuthStateChanged, db, getDoc, doc, setDoc, updateEmail, signInWithEmailAndPassword, sendPasswordResetEmail } from "../firebase-config.js";

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
                emailSection.style.display = "block"
                passwordSection.style.display = "block"
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
                loginpg.style.display = "none"
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

resetPasswordBtn.addEventListener("click", () => {
    const user = auth.currentUser;
    sendPasswordResetEmail(auth, user.email)
        .then(() => {
            console.log("Password reset email sent!");
        })
        .catch((error) => {
            console.error(error);
            alert(error.message);
        });
});