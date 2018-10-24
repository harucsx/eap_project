const functions = require('firebase-functions');

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
const admin = require('firebase-admin');
admin.initializeApp();

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

exports.countNameChanges = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {
    // Retrieve the current and previous value
    const data = change.after.data();
    const previousData = change.before.data();

    // We'll only update if the name has changed.
    // This is crucial to prevent infinite loops.
    if (data.name == previousData.name) return null;

    // Retrieve the current count of name changes
    let count = data.name_change_count;
    if (!count) {
      count = 0;
    }

    // Then return a promise of a set operation to update the count
    return change.after.ref.set({
      name_change_count: count + 1
    }, {merge: true});
  });

// exports.increasePresentCount = functions.firestore
//   .document('subjects/{subjectId}')
//   .onUpdate((change, context) => {
//     const data = change.after.data();
//     const previousData = change.before.data();
//
//     if (data.passcode.code == previousData.passcode.code) return null;
//
//     const today = new Date();
//     const docId = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
//
//     let docRef = admin.firestore().collection("subjects").doc(this.state.subjectId)
//       .collection("attendance").doc(docId);
//
//     docRef.get().then((doc) => {
//       let present_code = doc.data().present_code;
//
//       return docRef.set({
//         present_code: present_code + 1
//       }, {merge: true});
//     });
//   });
