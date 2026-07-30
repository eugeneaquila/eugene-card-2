export function calculateCollectorStats(ownedCards, serverStats) {
  const xp = serverStats.xp || 0;
  const level = Math.max(1, Math.floor(xp / 100) + 1);
  const totalValue = ownedCards.reduce((sum, card) => sum + Number(card.price || 0), 0);
  
  const achievements = [
    { title: 'FIRST CARD', unlocked: ownedCards.length >= 1 },
    { title: 'BETA COLLECTOR', unlocked: ownedCards.length >= 3 },
    { title: 'TRADER', unlocked: (serverStats.completedTrades || 0) >= 1 },
    { title: 'AUCTION MASTER', unlocked: (serverStats.auctionWins || 0) >= 1 },
    { title: 'ELITE COLLECTOR', unlocked: xp >= 1000 }
  ];

  return { level, xp, totalValue, achievements };
}