// Decks rules: 8x8. Win by capturing the enemy King. Index = row*8+col, row 0 = black side.
export const START=()=>{const b=Array(64).fill(null),k='AJXQKXJA';for(let c=0;c<8;c++){b[c]='b'+k[c];b[8+c]='bP';b[48+c]='wP';b[56+c]='w'+k[c];}return b};
const D=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
export function moves(b,i){const p=b[i];if(!p)return[];const col=p[0],t=p[1],r=i>>3,c=i&7,out=[];
const add=(rr,cc)=>{if(rr<0||rr>7||cc<0||cc>7)return 0;const q=b[rr*8+cc];if(q&&q[0]===col)return 0;out.push(rr*8+cc);return q?0:1};
const slide=ds=>ds.forEach(([a,d])=>{let k=1;while(add(r+a*k,c+d*k))k++});
if(t==='A')slide(D.slice(0,4));
if(t==='X'){slide(D.slice(4));D.slice(0,4).forEach(([a,d])=>add(r+a,c+d))} // Joker: diagonal slide + 1 step straight
if(t==='Q')slide(D);
if(t==='K')D.forEach(([a,d])=>add(r+a,c+d));
if(t==='J')[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([a,d])=>add(r+a,c+d));
if(t==='P'){const f=col==='w'?-1:1,s=col==='w'?6:1,n=(r+f)*8+c;
 if(r+f>=0&&r+f<8){if(!b[n]){out.push(n);if(r===s&&!b[n+f*8])out.push(n+f*8)}
 [-1,1].forEach(d=>{const q=b[n+d];if(c+d>=0&&c+d<8&&q&&q[0]!==col)out.push(n+d)})}}
return out}
export function apply(b,from,to){const n=[...b],cap=n[to];n[to]=n[from];n[from]=null;
 if(n[to][1]==='P'&&(to>>3===0||to>>3===7))n[to]=n[to][0]+'Q'; // Chip promotes to Queen
 return{board:n,won:cap&&cap[1]==='K'?cap[0]==='w'?'b':'w':null}}
