# Admin Panel Setup

Three things to do in the Firebase Console before `/admin` works and is actually secure.

## 1. Enable Google Sign-In
Firebase Console → your project → **Authentication** → **Sign-in method** → enable **Google**.

## 2. Add your domain as authorized
Same **Authentication** section → **Settings** → **Authorized domains** → add:
- `altamashahmad.in`
- `localhost` (for local testing — usually already there by default)

## 3. Firestore Security Rules — this is the real lock, not the UI
The `ADMIN_EMAIL` check in the app is just UX. Anyone could technically call Firestore directly.
**This is what actually stops writes from anyone but you.**

Firebase Console → **Firestore Database** → **Rules** → replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email == "altamashahmad910@gmail.com";
    }

    match /projects/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /certificates/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /experience/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /site-settings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

Publish the rules. Public visitors can still *read* everything (that's how the site displays), but only a request authenticated as `altamashahmad910@gmail.com` can write.

Your **comments** collection (`firebase-comment.js`, a separate Firebase project) is untouched by this — it keeps its own public-write rules since anyone should be able to leave a comment.

## Using it
1. Deploy the site with your real `.env` values.
2. Go to `https://altamashahmad.in/admin` (redirects to `/admin/login` if not signed in).
3. Sign in with `altamashahmad910@gmail.com`.
4. Add your projects, certificates, and experience — the public site reads them live from Firestore, no redeploy needed.

First-time content: the site currently has no `site-settings/main` document, so About will show your original hardcoded avatar/tagline/CV link until you save something in **Admin → Settings**.
