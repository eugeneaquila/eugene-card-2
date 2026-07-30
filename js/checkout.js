import { AppState } from './app-state.js';

export const CheckoutEngine = {
  TAX_RATE: 0.02,
  QRIS_STRING: "00020101021126610014COM.GO-JEK.WWW01189360091430419400360210G0419400360303UMI51440014ID.CO.QRIS.WWW0215ID10265490344800303UMI5204594453033605802ID5925Eugene Card, Toko Kartu &6012TORAJA UTARA61059183162070703A0163048BD9", // Replace with your payload

  calculateTotals(items) {
    const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const tax = subtotal * this.TAX_RATE;
    const grandTotal = subtotal + tax;
    return { subtotal, tax, grandTotal };
  },

  async submitQRISOrder(proofImageData) {
    const { subtotal, tax, grandTotal } = this.calculateTotals(AppState.cart);
    
    const orderPayload = {
      buyerUid: AppState.currentUser.uid,
      buyerName: AppState.currentUser.name,
      items: AppState.cart,
      subtotal,
      tax,
      totalAmount: grandTotal,
      proofUrl: proofImageData,
      status: 'PENDING',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await firebase.firestore().collection('orders').add(orderPayload);
    AppState.setState('cart', []); // Clear cart on submit
    return docRef.id;
  }
};