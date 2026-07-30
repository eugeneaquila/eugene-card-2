/* Eugene Card - Unified Supabase Data Layer */

async function getCurrentUser(){
  const {data} = await supabaseClient.auth.getUser();
  return data.user;
}

async function getProfile(){
  const user = await getCurrentUser();
  if(!user) return null;

  const {data,error} = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if(error) console.error(error);
  return data;
}

/* Marketplace */
async function loadMarketplace(){
  return await supabaseClient
    .from("cards")
    .select("*")
    .eq("status","available");
}

/* Auction */
async function loadAuctions(){
  return await supabaseClient
    .from("auctions")
    .select("*, bids(*)")
    .order("created_at",{ascending:false});
}

async function placeBid(auctionId, amount){
  return await supabaseClient
    .from("bids")
    .insert({
      auction_id: auctionId,
      amount: amount
    });
}

/* Trade */
async function loadTradeRequests(){
  return await supabaseClient
    .from("trade_requests")
    .select("*")
    .order("created_at",{ascending:false});
}

/* Sell Back */
async function sellBack(cardId, price){
  return await supabaseClient
    .from("sell_back_requests")
    .insert({
      card_id: cardId,
      offer_price: price,
      status: "pending"
    });
}

/* Admin */
async function loadAdminAnalytics(){
  return await supabaseClient
    .from("analytics")
    .select("*");
}

async function loadRevenue(){
  return await supabaseClient
    .from("transactions")
    .select("*");
}