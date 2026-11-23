// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("ConfermaInserimentoFeriale");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("ConfermaInserimentoFeriale");
import { Button, Dialog, useTable, type ConfirmProps } from "../floware";

function dataFeriale(testo: string) {__mk();
  const italiana = testo.includes("/");
  const parti = testo.trim().split(italiana ? "/" : "-");
  if (parti.length !== 3) return false;
  const indiceGiorno = italiana ? 0 : 2;
  const indiceAnno = italiana ? 2 : 0;
  const giorno = Number(parti[indiceGiorno]);
  const mese = Number(parti[1]);
  const anno = Number(parti[indiceAnno]);
  if (!Number.isInteger(giorno) || !Number.isInteger(mese) || !Number.isInteger(anno) || anno < 1900 || anno > 9999) return false;
  const data = new Date(anno, mese - 1, giorno);
  return data.getFullYear() === anno && data.getMonth() === mese - 1 && data.getDate() === giorno && data.getDay() !== 0 && data.getDay() !== 6;
}

export default function ConfermaInserimentoFeriale({ action, confirm, cancel }: ConfirmProps) {__mk();
  const table = useTable(action.pageId);
  if (!table) return <Dialog title="Inserimento non disponibile" onClose={cancel} footer={<Button onClick={cancel}>Chiudi</Button>}><p>La pagina non è disponibile.</p></Dialog>;
  const errori: string[] = [];
  if (table.column("Turno") >= 0 && table.value(action.row, "Turno").trim() !== "Mattina") errori.push('Turno: indica esclusivamente «Mattina».');
  ["Data sopralluogo", "Scadenza", "Nuova scadenza"].forEach((nome) => {__mk();
    if (table.column(nome) >= 0 && !dataFeriale(table.value(action.row, nome))) errori.push(nome + ': indica una data valida dal lunedì al venerdì, nel formato GG/MM/AAAA oppure AAAA-MM-GG.');
  });
  return <Dialog title={errori.length ? "Correggi la programmazione" : "Conferma inserimento"} onClose={cancel} footer={<><Button variant="secondary" onClick={cancel}>{errori.length ? "Torna al modulo" : "Annulla"}</Button>{!errori.length && <Button onClick={confirm}>Conferma inserimento</Button>}</>}>
    {errori.length ? <div role="alert" className="space-y-3 text-(--mk-danger)"><p>Inserimento bloccato. Correggi i dati nel modulo e riprova. Non sono consentiti turni pomeridiani o date nel fine settimana.</p>{errori.map((errore) => (__mk(), <p key={errore}>{errore}</p>))}</div> : <p>La programmazione rispetta la regola: solo Mattina e date dal lunedì al venerdì.</p>}
  </Dialog>;
}
