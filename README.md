<img width="1640" height="856" alt="logo" src="https://github.com/user-attachments/assets/895d1bac-7a9e-4a0d-b3e9-86196af0ec9c" />

## Overview

Tamlish is a website designed for tourists to teach spoken Tamil in a easy and acceisibele way with relevant vocabulary and native audio.

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

and sign up / log in

Then:

```
firebase projects:create
```

Choose a project id, and then:

```
firebase use --add
```

Choose the project id you just created

### Local Development with Emulation

To start emulators:

```
firebase emulators:start
```

The website will be found at `127.0.0.1:5000` or `localhost:5000`

To see Firestore (database), and authentication details e.g. local user emails, go to `127.0.0.1:4000` or `localhost:4000`

Once emulators are ended all user data is cleared (as well as database)

### Deployment

Once you are satisfied with local version, deploy website with:

```
firebase deploy
```

Your website can be found at `https://your-project-id.web.app` or `https://your-project-id.firebaseapp.com`

## Contributing

Any issues or bugs can be reported [here](https://github.com/adityazisserman/Tamlish/issues) and additions are welcome. Just make a pull request [here](https://github.com/adityazisserman/Tamlish/pulls).
