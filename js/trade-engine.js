import { AppState } from './app-state.js';

export const TradeEngine = {
  PLATFORM_FEE: 0.02,

  // Create a listing or direct card trade proposal
  async createTradeProposal({ requestedCardId, offerType, offeredCardId = null, plusAmount = 0, notes = '' }) {
    if (!AppState.currentUser) throw new Error("Authentication required.");

    const payload = {
      requesterUid: AppState.currentUser.uid,
      requesterName: AppState.currentUser.name,
      requestedCardId,
      offerType, // 'BUY', 'TRADE', or 'TRADE_PLUS_CASH'
      offeredCardId,
      plusAmount: Number(plusAmount),
      platformFee: Number(plusAmount) * this.PLATFORM_FEE,
      notes,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    return firebase.firestore().collection('trade_requests').add(payload);
  },

  // Submit counter offer
  async submitCounterOffer(requestId, counterNotes, revisedAmount = 0) {
    return firebase.firestore().collection('trade_requests').doc(requestId).update({
      status: 'COUNTERED',
      counterNotes,
      revisedAmount: Number(revisedAmount),
      updatedAt: new Date().toISOString()
    });
  }
};