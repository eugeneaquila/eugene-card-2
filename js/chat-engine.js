import { AppState } from './app-state.js';

export const ChatEngine = {
  subscribeToThread(chatId, onUpdate) {
    return firebase.firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('timestamp', 'asc')
      .onSnapshot(snapshot => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        onUpdate(messages);
      });
  },

  async sendMessage(chatId, text, attachmentUrl = null) {
    if (!AppState.currentUser) return;

    const message = {
      senderUid: AppState.currentUser.uid,
      senderName: AppState.currentUser.name,
      text,
      attachmentUrl,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };

    const batch = firebase.firestore().batch();
    const msgRef = firebase.firestore().collection('chats').doc(chatId).collection('messages').doc();
    const chatRef = firebase.firestore().collection('chats').doc(chatId);

    batch.set(msgRef, message);
    batch.set(chatRef, {
      lastMessage: text || 'Attachment sent',
      lastSender: AppState.currentUser.name,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    return batch.commit();
  }
};