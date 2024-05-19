import * as admin from 'firebase-admin';
import { Request, Response } from 'express'
// Initialize Firebase Admin SDK
const serviceAccount = require('./config/serviceAccountKey.json'); // Your service account key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestore database instance
const db = admin.firestore();

export const pairingStrangers = async () => {
  paringFreeToTalkStrangers()
  paringOppositeGenderStrangers()
  return 
}

const matchingStrangers = async (stranger1ID: string, stranger2ID: string) => {
  const conversationRef = db.collection('C_CONVERSATION').doc();
  const conversationData = {
    stranger1ID: stranger1ID,
    stranger2ID: stranger2ID,
    isSeen: false,
    isStranger1Chatting: false,
    isStranger2Chatting: false
  };
  await conversationRef.set(conversationData);
  updateUser(stranger1ID, {
    chatState: 'inConversation',
    conversationId: conversationRef.id,
  })
  updateUser(stranger2ID, {
    chatState: 'inConversation',
    conversationId: conversationRef.id,
  })

}

const updateUser = async (userId: string, userData: any) => {
  const userRef = db.collection('C_USER').doc(userId);
  await userRef.update(userData);
};


const paringFreeToTalkStrangers = async () => {
  console.log('paringFreeToTalkStrangers');

  const freeToTalkRef = db.collection('C_DATAMATCHING').doc('freeToTalk');
  const freeToTalkSnapshot = await freeToTalkRef.get();
  const freeToTalkData = freeToTalkSnapshot.data();
  if (freeToTalkData) {
    if ('queue' in freeToTalkData && freeToTalkData.queue !== undefined) {
      const queue: string[] = freeToTalkData.queue;
      if (queue.length % 2 === 1) { queue.pop() }
      for (let i = 0; i < queue.length / 2; i++) {
        let stranger1ID = queue[2 * i]
        let stranger2ID = queue[2 * i + 1]
        matchingStrangers(stranger1ID, stranger2ID)
        freeToTalkRef.update({
          queue: admin.firestore.FieldValue.arrayRemove(stranger1ID, stranger2ID)
        })
      }
    }
  }
}

const paringOppositeGenderStrangers = async () => {
  console.log('paringOppositeGenderStrangers');

  const oppositeGenderRef = db.collection('C_DATAMATCHING').doc('oppositeGender');
  const oppositeGenderSnapshot = await oppositeGenderRef.get();
  const oppositeGenderData = oppositeGenderSnapshot.data();
  var femaleQueue: string[] = []
  var maleQueue: string[] = []
  var otherQueue: string[] = []

  if (oppositeGenderData) {
    if ('femaleQueue' in oppositeGenderData && oppositeGenderData.femaleQueue !== undefined) {
      femaleQueue = oppositeGenderData.femaleQueue;
    }
    if ('maleQueue' in oppositeGenderData && oppositeGenderData.maleQueue !== undefined) {
      maleQueue = oppositeGenderData.maleQueue;
    }
    if ('otherQueue' in oppositeGenderData && oppositeGenderData.otherQueue !== undefined) {
      otherQueue = oppositeGenderData.otherQueue;
    }
    const femaleLength = femaleQueue.length;
    const maleLength = maleQueue.length;

    if (femaleLength > maleLength) {
      while (otherQueue.length > 0 && maleQueue.length < femaleLength) {
        maleQueue.push(otherQueue.shift() as string);
      }
      while (femaleQueue.length > maleQueue.length) {
        femaleQueue.pop();
      }
    } else if (femaleLength < maleLength) {
      while (otherQueue.length > 0 && femaleQueue.length < maleLength) {
        femaleQueue.push(otherQueue.shift() as string);
      }
      while (maleQueue.length > femaleQueue.length) {
        maleQueue.pop();
      }
    }

    for (let i = 0; i < maleQueue.length; i++) {
      let stranger1ID = maleQueue[i];
      let stranger2ID = femaleQueue[i];
      matchingStrangers(stranger1ID, stranger2ID)
      oppositeGenderRef.update({
        maleQueue: admin.firestore.FieldValue.arrayRemove(stranger1ID, stranger2ID),
        femaleQueue: admin.firestore.FieldValue.arrayRemove(stranger1ID, stranger2ID),
        otherQueue: admin.firestore.FieldValue.arrayRemove(stranger1ID, stranger2ID),
      })
    }
  }
}
