// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("CalcoloScadenzeVerde");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("CalcoloScadenzeVerde");
import { useState } from "react";
import { Card, Button, TextInput, Select, Badge, useTable, usePrototype } from "../floware";
function giorno(testo) {__mk();
 const s=testo.trim(),it=s.includes("/"),p=s.split(it?"/":"-");
 if(p.length!==3)return null;
 const ia=it?2:0,ig=it?0:2;
 const a=Number(p[ia]),m=Number(p[1]),g=Number(p[ig]);
 if(a<1900||a>9999||!Number.isInteger(a)||!Number.isInteger(m)||!Number.isInteger(g))return null;
 const d=new Date(Date.UTC(a,m-1,g));
 return d.getUTCFullYear()===a&&d.getUTCMonth()===m-1&&d.getUTCDate()===g?d.getTime()/86400000:null;
}
function etichetta(n) {__mk();
 return new Date(n*86400000).toLocaleDateString("it-IT",{day:"2-digit",month:"2-digit",year:"numeric",timeZone:"UTC"});
}
function tratto(stato) {__mk();
 if(stato==="Da riprogrammare")return "dashed";
 if(stato==="Controllo da fare")return "dotted";
 if(stato==="Lavoro urgente")return "double";
 return "solid";
}
export default function CalcoloScadenzeVerde(props) {__mk();
 const t=useTable(props.pageId),{openDetail}=usePrototype();
 const [filtro,setFiltro]=useState("Tutti gli stati"),[cerca,setCerca]=useState(""),[scala,setScala]=useState("Compatta");
 if(!t)return null;
 if(["Area","Tipo intervento","Data intervento","Scadenza","Stato"].some(c=>(__mk(), t.column(c)<0)))return <Card title="Gantt degli interventi"><p>Servono le colonne Area, Tipo intervento, Data intervento, Scadenza e Stato.</p></Card>;
 const stati=Array.from(new Set(t.rows.map(r=>(__mk(), t.value(r,"Stato")||"Non indicato"))));
 const righe=t.rows.map((r,i)=>((__mk(), {i,area:t.value(r,"Area"),tipo:t.value(r,"Tipo intervento"),stato:t.value(r,"Stato")||"Non indicato",inizio:giorno(t.value(r,"Data intervento")),fine:giorno(t.value(r,"Scadenza"))})));
 const valide=righe.filter(r=>(__mk(), r.inizio!==null&&r.fine!==null&&r.fine>=r.inizio));
 const min=valide.reduce((n,r)=>(__mk(), Math.min(n,r.inizio)),valide.length?valide[0].inizio:0);
 const max=valide.reduce((n,r)=>(__mk(), Math.max(n,r.fine)),min);
 const durata=max-min+1;
 const visibili=righe.filter(r=>(__mk(), (filtro==="Tutti gli stati"||r.stato===filtro)&&(r.area+" "+r.tipo).toLowerCase().includes(cerca.trim().toLowerCase())));
 const posizioni=[0,0.25,0.5,0.75,1];
 return <Card title="Gantt degli interventi sul verde"><div className="space-y-4">
 <p className="text-(--mk-muted)">Ogni barra comprende il giorno iniziale e quello di scadenza. Apri un’attività per consultare o modificare la programmazione nella scheda esistente.</p>
 <div className="grid gap-3 md:grid-cols-3"><TextInput label="Cerca area o tipo intervento" value={cerca} onChange={setCerca}/><Select label="Stato" value={filtro} options={["Tutti gli stati",...stati]} onChange={setFiltro}/><Select label="Scala del diagramma" value={scala} options={["Compatta","Estesa"]} onChange={setScala}/></div>
 <div className="flex flex-wrap gap-3" aria-label="Legenda degli stati">{stati.map(s=>(__mk(), <div key={s} className="rounded border-4 border-(--mk-border) px-2 py-1 text-sm" style={{borderStyle:tratto(s)}}><Badge tone={s==="Lavoro urgente"?"danger":s==="In programma"?"primary":"neutral"}>{s}</Badge></div>))}</div>
 <p className="text-sm text-(--mk-muted)">{visibili.length} attività visualizzate. {valide.length>0?"Periodo: "+etichetta(min)+" – "+etichetta(max):"Nessun intervallo valido."} La scala rimane invariata cambiando filtro.</p>
 {visibili.length===0&&<p>Nessun intervento corrisponde ai filtri.</p>}
 <div className="overflow-x-auto" aria-label="Diagramma di Gantt"><div style={{minWidth:scala==="Estesa"?"1500px":"900px"}}>
 <div className="grid gap-4 border-b border-(--mk-divider) pb-3" style={{gridTemplateColumns:"260px 1fr"}}><strong>Area e tipo intervento</strong><div className="flex justify-between text-xs text-(--mk-muted)">{valide.length>0&&posizioni.map((p,i)=>(__mk(), <span key={i}>{etichetta(min+Math.round((durata-1)*p))}</span>))}</div></div>
 {visibili.map(r=>{__mk();
 const valida=r.inizio!==null&&r.fine!==null&&r.fine>=r.inizio;
 const sinistra=valida?(r.inizio-min)/durata*100:0;
 const larghezza=valida?(r.fine-r.inizio+1)/durata*100:0;
 return <div key={r.i} className="grid items-center gap-4 border-b border-(--mk-divider) py-3" style={{gridTemplateColumns:"260px 1fr"}}>
 <div className="space-y-1"><Button variant="link" onClick={()=>(__mk(), openDetail(props.pageId,r.i))}>{r.area||"Area non indicata"}</Button><p className="text-sm">{r.tipo}</p><Badge tone={r.stato==="Lavoro urgente"?"danger":r.stato==="In programma"?"primary":"neutral"}>{r.stato}</Badge></div>
 <div>{valida?<><div className="rounded bg-(--mk-subtle) py-2"><div className="rounded border-4 border-(--mk-border) bg-(--mk-surface) p-1" style={{marginLeft:String(sinistra)+"%",width:String(larghezza)+"%",borderStyle:tratto(r.stato)}} title={r.area+" · "+r.tipo+" · "+r.stato+" · "+etichetta(r.inizio)+" – "+etichetta(r.fine)}><Button variant="secondary" onClick={()=>(__mk(), openDetail(props.pageId,r.i))}>Apri</Button></div></div><p className="mt-1 text-xs text-(--mk-muted)">{etichetta(r.inizio)} – {etichetta(r.fine)} · {r.stato}</p></>:<p className="text-(--mk-danger)">Intervallo non valido: correggi le date nella scheda.</p>}</div>
 </div>;
 })}
 </div></div>
 <p className="text-xs text-(--mk-muted)">Le modifiche nelle schede aggiornano il diagramma e restano in memoria.</p>
 </div></Card>;
}
