// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("SchedaProgrammazioneFeriale");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("SchedaProgrammazioneFeriale");
import { useState, useEffect } from "react";
import { Button, Drawer, TextInput, Select, Field, useTable, usePrototype, type DetailProps } from "../floware";
const memoria: Record<string, string> = {};
function data(t: string) {__mk();
  const it = t.includes("/"), p = t.trim().split(it ? "/" : "-");
  if (p.length !== 3) return null;
  const ig = it ? 0 : 2;
  const ia = it ? 2 : 0;
  const g = Number(p[ig]), m = Number(p[1]), a = Number(p[ia]);
  const d = new Date(a, m - 1, g);
  return Number.isInteger(a) && a >= 1900 && a <= 9999 && d.getFullYear() === a && d.getMonth() === m - 1 && d.getDate() === g ? d : null;
}
function settimana(d: Date) {__mk(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7); }
function ore(t: string) {__mk(); return Number(t.trim().replace(",", ".")); }
function carico(table, leggi, esclusa: number) {__mk();
  const colonne = ["Tecnico incaricato", "Data intervento", "Durata prevista (ore)"];
  if (colonne.some((c) => (__mk(), table.column(c) < 0))) return "Mancano le colonne necessarie al controllo degli incarichi.";
  const tecnico = leggi(colonne[0]).trim();
  if (!["Rivo", "Mira", "Timo", "Leda"].includes(tecnico)) return "Tecnico incaricato: scegli Rivo, Mira, Timo o Leda.";
  const d = data(leggi(colonne[1]));
  if (!d || d.getDay() === 0 || d.getDay() === 6) return "Data intervento: indica una data valida dal lunedì al venerdì.";
  const h = ore(leggi(colonne[2]));
  if (!Number.isFinite(h) || h <= 0) return "Durata prevista (ore): indica un numero maggiore di zero.";
  let totale = h;
  const giorni = new Set([d.getTime()]);
  let errore = "";
  table.rows.forEach((r, i) => {__mk();
    if (i === esclusa || table.value(r, colonne[0]).trim() !== tecnico) return;
    const altra = data(table.value(r, colonne[1]));
    if (!altra) { errore = "Correggi una data intervento non valida negli incarichi esistenti di " + tecnico + "."; return; }
    if (settimana(altra) !== settimana(d)) return;
    giorni.add(altra.getTime());
    const durata = ore(table.value(r, colonne[2]));
    if (!Number.isFinite(durata) || durata <= 0) errore = "Correggi la durata non numerica o non positiva di un incarico esistente di " + tecnico + " nella stessa settimana.";
    else if (altra.getTime() === d.getTime()) totale += durata;
  });
  if (errore) return errore;
  if (totale > 2) return tecnico + ": " + totale + " ore nel giorno selezionato. Il limite è 2 ore complessive al giorno.";
  if (giorni.size > 5) return tecnico + ": incarichi in " + giorni.size + " giorni distinti nella settimana. Il limite è 5 giorni, da lunedì a domenica.";
  return "";
}
export default function SchedaProgrammazioneFeriale({ pageId, rowIndex, close }: DetailProps) {__mk();
  const table = useTable(pageId);
  const { notify } = usePrototype();
  const [bozza, setBozza] = useState<Record<string, string>>({});
  const [guardrail, setGuardrail] = useState("");
  const [errore, setErrore] = useState("");
  const chiave = pageId + "|" + (table && table.column("Area") >= 0 ? table.value(rowIndex, "Area") : "") + "|" + (table && table.column("Indirizzo") >= 0 ? table.value(rowIndex, "Indirizzo") : "");
  useEffect(() => {__mk(); setBozza({}); setErrore(""); setGuardrail(memoria[chiave] || ""); }, [pageId, rowIndex, chiave]);
  if (!table || !table.rows[rowIndex]) return null;
  const leggi = (c: string) => (__mk(), bozza[c] !== undefined ? bozza[c] : table.value(rowIndex, c));
  const ciglio = pageId === "registro-interventi" && table.column("Tipo intervento") >= 0 && leggi("Tipo intervento") === "Sfalcio ciglio stradale";
  const attrezzo = guardrail === "Presente" ? "Decespugliatore" : guardrail === "Assente" ? "Trattore" : "Indicare il guardrail";
  const salva = () => {__mk();
    let messaggio = "";
    if (table.column("Turno") >= 0 && leggi("Turno").trim() !== "Mattina") messaggio = "Turno: è consentita solo Mattina.";
    ["Data sopralluogo", "Scadenza", "Nuova scadenza"].forEach((c) => {__mk();
      if (table.column(c) < 0) return;
      const d = data(leggi(c));
      if (!d || d.getDay() === 0 || d.getDay() === 6) messaggio = c + ": indica una data feriale valida, GG/MM/AAAA oppure AAAA-MM-GG.";
    });
    if (!messaggio && pageId === "registro-interventi") messaggio = carico(table, leggi, rowIndex);
    if (!messaggio && ciglio && !["Presente", "Assente"].includes(guardrail)) messaggio = "Guardrail: scegli Presente oppure Assente.";
    if (messaggio) { setErrore(messaggio + " Nessuna modifica salvata."); return; }
    const nuova = pageId + "|" + (table.column("Area") >= 0 ? leggi("Area") : "") + "|" + (table.column("Indirizzo") >= 0 ? leggi("Indirizzo") : "");
    memoria[nuova] = guardrail;
    if (nuova !== chiave) delete memoria[chiave];
    table.columns.forEach((c) => (__mk(), table.setCell(rowIndex, c, leggi(c))));
    notify(ciglio ? "Programmazione salvata. Attrezzatura: " + attrezzo : "Programmazione salvata.");
    close();
  };
  return <Drawer title="Modifica programmazione" onClose={close} footer={<><Button variant="secondary" onClick={close}>Annulla</Button><Button onClick={salva}>Salva modifiche</Button></>}><div className="space-y-4">
    <p>Solo mattina e date feriali. Per ciascun operatore: massimo 2 ore al giorno e 5 giorni distinti per settimana, da lunedì a domenica. Il controllo esclude la versione precedente di questo intervento.</p>
    {errore && <p role="alert" className="text-(--mk-danger)">{errore}</p>}
    {table.columns.map((c) => (__mk(), <TextInput key={c} label={c} value={leggi(c)} onChange={(v) => {__mk(); setBozza((b) => {__mk(); const n = { ...b }; n[c] = v; return n; }); setErrore(""); }} />))}
    {ciglio && <section className="space-y-3"><Select label="Guardrail" value={guardrail} options={["", "Presente", "Assente"]} onChange={(v) => {__mk(); setGuardrail(v); setErrore(""); }} /><Field label="Attrezzatura prevista">{attrezzo}</Field><p>Assente: Trattore. Presente: Decespugliatore. Scelta conservata in memoria.</p></section>}
  </div></Drawer>;
}
