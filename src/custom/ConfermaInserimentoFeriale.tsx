// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("ConfermaInserimentoFeriale");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("ConfermaInserimentoFeriale");
import { Button, Dialog, useTable, type ConfirmProps } from "../floware";

function data(t: string) {__mk();
  const it = t.includes("/");
  const p = t.trim().split(it ? "/" : "-");
  if (p.length !== 3) return null;
  const ig = it ? 0 : 2;
  const ia = it ? 2 : 0;
  const g = Number(p[ig]), m = Number(p[1]), a = Number(p[ia]);
  const d = new Date(a, m - 1, g);
  return Number.isInteger(a) && a >= 1900 && a <= 9999 && d.getFullYear() === a && d.getMonth() === m - 1 && d.getDate() === g ? d : null;
}
function settimana(d: Date) {__mk();
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7);
}
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
export default function ConfermaInserimentoFeriale({ action, confirm, cancel }: ConfirmProps) {__mk();
  const table = useTable(action.pageId);
  const errori: string[] = [];
  if (!table) errori.push("Pagina non disponibile.");
  else {
    const leggi = (c: string) => (__mk(), table.value(action.row, c));
    if (table.column("Turno") >= 0 && leggi("Turno").trim() !== "Mattina") errori.push("Turno: è consentita solo Mattina.");
    ["Data sopralluogo", "Scadenza", "Nuova scadenza"].forEach((c) => {__mk();
      if (table.column(c) < 0) return;
      const d = data(leggi(c));
      if (!d || d.getDay() === 0 || d.getDay() === 6) errori.push(c + ": indica una data feriale valida, GG/MM/AAAA oppure AAAA-MM-GG.");
    });
    if (action.pageId === "registro-interventi") {
      const messaggio = carico(table, leggi, -1);
      if (messaggio) errori.push(messaggio);
    }
  }
  return <Dialog title={errori.length ? "Inserimento bloccato" : "Conferma inserimento"} onClose={cancel} footer={<><Button variant="secondary" onClick={cancel}>{errori.length ? "Torna al modulo" : "Annulla"}</Button>{!errori.length && <Button onClick={confirm}>Conferma inserimento</Button>}</>}>
    {errori.length ? <div role="alert" className="space-y-3 text-(--mk-danger)">{errori.map((e) => (__mk(), <p key={e}>{e}</p>))}</div> : <p>Controlli superati. Per gli interventi sul verde: massimo 2 ore al giorno per operatore e 5 giorni distinti per settimana, da lunedì a domenica.</p>}
  </Dialog>;
}
