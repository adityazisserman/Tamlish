<div align="center">
    <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/    983f2151-dcf2-491d-bb74-7bc73397e4b6"/>
    <a href="https://tamlish-dev.web.app" target="_blank"><img alt="Image" height=150px width= 500px src="https://github.com/user-attachments/assets/983f2151-dcf2-491d-bb74-7bc73397e4b6" /></a>
    </picture>
</div>

## Overview

Tamlish is a website designed for tourists to teach spoken Tamil in a easy and accessible way with relevant vocabulary and native audio.

Main features include:

- Lessons split into topics, with each topic focusing on a different content area
- Dictionary, where learners can search all the vocabulary they have learnt
- Authentication i.e. learners can sign up/log in to save progress
- Marking algorithm designed to accomadate errors such as mistypes

## Development

### Initialisation

Hosted on Firebase, so first install Firebase CLI tools:

```
npm install -g firebase-tools
```

Within Tamlish directory:

```
firebase login
```

> and sign up / log in

To create your Firebase project:

```
firebase projects:create
```

> Decide on a project id (globally unique across all Firebase projects, so your desired project id may be taken)

To connect the code to the project:

```
firebase use --add
```

> Choose the project id you just created

To connect your project to Firebase:

```
firebase apps:sdkconfig WEB
```

Copy all config and paste into [firebase-config_demo.js](https://github.com/adityazisserman/Tamlish/blob/main/main/src/firebase-config_demo.js)

Be sure to rename file to `firebase-config.js` after all details filled out

### Local Development with Emulation

To start emulators:

```
firebase emulators:start
```

The website will be found at `127.0.0.1:5000` or `localhost:5000`

To see Firestore (database), and authentication details e.g. local user emails, go to `127.0.0.1:4000` or `localhost:4000`

> Once emulators are ended all user data is cleared (as well as database)

### Deployment

Once you are satisfied with your local version, deploy website with:

```
firebase deploy
```

Your website can be found at `https://your-project-id.web.app` or `https://your-project-id.firebaseapp.com`

To access the Firebase console (to see actual database and authenticaiton data) go to https://console.firebase.google.com sign in, and navigate to your project

## Contributing

Any issues or bugs can be reported [here](https://github.com/adityazisserman/Tamlish/issues) and any additions are welcome. Just make a pull request [here](https://github.com/adityazisserman/Tamlish/pulls).
