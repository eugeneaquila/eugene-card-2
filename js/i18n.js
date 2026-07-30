export const Dictionary = {
  EN: {
    marketplace: "Marketplace",
    vault: "My Vault",
    trading: "Trading",
    auctions: "Auctions",
    inbox: "Inbox",
    commandCenter: "Command Center",
    totalIncTax: "Total (Inc. 2% Tax)"
  },
  ID: {
    marketplace: "Marketplace",
    vault: "Koleksi Saya",
    trading: "Pertukaran",
    auctions: "Lelang",
    inbox: "Kotak Masuk",
    commandCenter: "Pusat Kendali",
    totalIncTax: "Total (Termasuk Pajak 2%)"
  }
};

export function t(key) {
  const lang = AppState.language;
  return Dictionary[lang]?.[key] || key;
}

export function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
}