import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import {SUPABASE_URL as U,SUPABASE_ANON_KEY as K} from './config.js';
import {START,moves,apply} from './engine.js';

const sb=createClient(U,K),$=s=>document.querySelector(s),show=id=>['auth','lobby','game'].forEach(x=>$('#'+x).classList.toggle('hide',x!==id));
let me,g,sel=null,ch;
const err=e=>$('#msg').textContent=e?.message||'';
$('#up').onclick=async()=>{const{error}=await sb.auth.signUp({email:$('#em').value,password:$('#pw').value,options:{data:{username:$('#un').value.trim()}}});err(error)};
$('#in').onclick=async()=>{const{error}=await sb.auth.signInWithPassword({email:$('#em').value,password:$('#pw').value});err(error)};
sb.auth.onAuthStateChange((_,s)=>{if(s?.user){me=s.user;boot()}else{me=null;show('auth')}});
async function boot(){const{data}=await sb.from('profiles').select('username').eq('id',me.id).single();
 $('#who').innerHTML=`${data?.username||''} <button class="alt" id="out">Log out</button>`;$('#out').onclick=()=>sb.auth.signOut();
 show('lobby');lobby();sb.channel('lb').on('postgres_changes',{event:'*',schema:'public',table:'friendships'},lobby).on('postgres_changes',{event:'*',schema:'public',table:'games'},()=>$('#lobby').classList.contains('hide')||lobby()).subscribe()}
async function lobby(){
 const{data:f}=await sb.from('friendships').select('*,a:profiles!friendships_requester_fkey(id,username),b:profiles!friendships_addressee_fkey(id,username)');
 const inc=(f||[]).filter(x=>x.status==='pending'&&x.addressee===me.id),ok=(f||[]).filter(x=>x.status==='accepted');
 $('#reqs').innerHTML=inc.map(x=>`<div class="row">${x.a.username} wants to be friends <button data-acc="${x.id}">Accept</button></div>`).join('');
 $('#friends').innerHTML=ok.map(x=>{const o=x.requester===me.id?x.b:x.a;return`<div class="row">${o.username}<button data-ch="${o.id}">Challenge</button></div>`}).join('')||'<p>No friends yet. Add one by username.</p>';
 const{data:gs}=await sb.from('games').select('*').or(`white.eq.${me.id},black.eq.${me.id}`).eq('status','active');
 $('#games').innerHTML=(gs||[]).map(x=>`<div class="row">${x.black?'vs player':'Waiting for opponent'} · ${x.turn===(x.white===me.id?'w':'b')?'your move':'their move'}<button data-g="${x.id}">Open</button></div>`).join('')||'<p>No active games.</p>'}
$('#lobby').onclick=async e=>{const d=e.target.dataset;
 if(d.acc)await sb.from('friendships').update({status:'accepted'}).eq('id',d.acc);
 if(d.ch){const{data}=await sb.from('games').insert({white:me.id,black:d.ch,board:START()}).select().single();open(data.id)}
 if(d.g)open(d.g)};
$('#fadd').onclick=async()=>{const{data:p}=await sb.from('profiles').select('id').eq('username',$('#fname').value.trim()).maybeSingle();
 if(!p||p.id===me.id)return alert('No such player.');const{error}=await sb.from('friendships').insert({requester:me.id,addressee:p.id});alert(error?'Request already exists.':'Request sent.');lobby()};
$('#quick').onclick=async()=>{const{data:o}=await sb.from('games').select('id').is('black',null).neq('white',me.id).eq('status','active').limit(1);
 if(o?.length){await sb.from('games').update({black:me.id}).eq('id',o[0].id);return open(o[0].id)}
 const{data}=await sb.from('games').insert({white:me.id,board:START()}).select().single();open(data.id)};
async function open(id){const{data}=await sb.from('games').select('*').eq('id',id).single();g=data;sel=null;show('game');draw();
 ch&&sb.removeChannel(ch);ch=sb.channel('g'+id).on('postgres_changes',{event:'UPDATE',schema:'public',table:'games',filter:`id=eq.${id}`},p=>{g=p.new;draw()}).subscribe()}
$('#back').onclick=()=>{show('lobby');lobby()};
const mine=()=>g.white===me.id?'w':g.black===me.id?'b':null;
function draw(){const c=mine(),flip=c==='b',b=g.board;
 $('#info').textContent=g.status==='done'?`${g.winner==='w'?'White':'Black'} captured the King and wins.`:!g.black?'Waiting for an opponent…':`${g.turn==='w'?'White':'Black'} to move — you are ${c==='w'?'White':'Black'}`;
 const t=sel!=null?moves(b,sel):[];let h='';
 for(let n=0;n<64;n++){const i=flip?63-n:n,r=i>>3,col=i&7;h+=`<div class="sq ${(r+col)%2?'d':''} ${i===sel?'sel':''} ${t.includes(i)?'mv':''}" data-i="${i}">${b[i]?`<img class="pc" src="Images/${b[i]}.svg" alt="${b[i]}" draggable="false">`:''}</div>`}
 $('#board').innerHTML=h}
$('#board').onclick=async e=>{const s=e.target.closest('.sq');if(!s||g.status!=='active'||!g.black)return;const i=+s.dataset.i,c=mine();if(g.turn!==c)return;
 if(sel!=null&&moves(g.board,sel).includes(i)){const r=apply(g.board,sel,i);sel=null;
  const{data}=await sb.from('games').update({board:r.board,turn:c==='w'?'b':'w',status:r.won?'done':'active',winner:r.won}).eq('id',g.id).eq('turn',c).select().single();if(data)g=data;return draw()}
 sel=g.board[i]?.[0]===c?i:null;draw()};
