// Centralized Application State & Reactive Subscriber System
export const AppState = {
  currentUser: null,
  language: localStorage.getItem('eugene_lang') || 'EN',
  inventory: [],
  cart: [],
  wishlist: new Set(),
  activeAuction: null,
  activeChatContext: null,
  notifications: [],
  listeners: new Map(),

  subscribe(key, callback) {
    if (!this.listeners.has(key)) this.listeners.set(key, []);
    this.listeners.get(key).push(callback);
  },

  notify(key, data) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(cb => cb(data));
    }
  },

  setState(key, val) {
    this[key] = val;
    this.notify(key, val);
  }
};