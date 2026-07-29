// Firebase compatibility layer backed by Supabase
import { supabase } from './supabase.js';

window.supabaseClient = supabase;

function collection(name){
  return {
    async get(){
      const {data,error}=await supabase.from(name).select('*');
      if(error) throw error;
      return {docs:(data||[]).map(row=>({id:row.id,data:()=>row,ref:{}}))};
    },
    async add(data){
      const {data:row,error}=await supabase.from(name).insert(data).select().single();
      if(error) throw error;
      return {id:row.id};
    },
    where(){ return this; },
    order(){ return this; },
    limit(){ return this; },
    onSnapshot(){ return ()=>{}; }
  };
}

window.db = { collection };

window.auth = {
  currentUser:null,
  onAuthStateChanged(callback){
    supabase.auth.getSession().then(({data})=>callback(data.session?.user||null));
    return supabase.auth.onAuthStateChange((_event,session)=>callback(session?.user||null));
  },
  signOut(){ return supabase.auth.signOut(); }
};

window.loginWithSupabaseGoogle = async ()=>{
 return supabase.auth.signInWithOAuth({
  provider:'google',
  options:{redirectTo:window.location.origin}
 });
};
