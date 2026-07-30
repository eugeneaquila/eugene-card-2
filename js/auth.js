async function getProfile(){
 const {data:{user}} = await supabaseClient.auth.getUser();
 if(!user) return null;
 const {data} = await supabaseClient.from('profiles').select('*').eq('id',user.id).single();
 return data;
}
