// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("SchedaProgrammazioneFeriale");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("SchedaProgrammazioneFeriale");
import { useState, useEffect } from "react";
import { Button, Drawer, TextInput, Select, Field, useTable, usePrototype, type DetailProps } from "../floware";

const guardrailMemoria: Record<string, string> = {};

function controllaData(testo: string) {__mk();
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

export default function SchedaProgrammazioneFeriale({ pageId, rowIndex, close }: DetailProps) {__mk();
  const table = useTable(pageId);
  const { notify } = usePrototype();
  const [bozza, setBozza] = useState<Record<string, string>>({});
  const [guardrail, setGuardrail] = useState("");
  const [errore, setErrore] = useState("");
  const area = table && table.column("Area") >= 0 ? table.value(rowIndex, "Area") : "";
  const indirizzo = table && table.column("Indirizzo") >= 0 ? table.value(rowIndex, "Indirizzo") : "";
  const chiave = pageId + "|" + area + "|" + indirizzo;
  useEffect(() => {__mk();
    setBozza({});
    setErrore("");
    setGuardrail(guardrailMemoria[chiave] || "");
  }, [pageId, rowIndex, chiave]);
  if (!table || !table.rows[rowIndex]) return null;
  const leggi = (colonna: string) => (__mk(), bozza[colonna] !== undefined ? bozza[colonna] : table.value(rowIndex, colonna));
  const ciglio = pageId === "registro-interventi" && table.column("Tipo intervento") >= 0 && leggi("Tipo intervento") === "Sfalcio ciglio stradale";
  const attrezzatura = guardrail === "Presente" ? "Decespugliatore" : guardrail === "Assente" ? "Trattore" : "Indicare il guardrail";
  const modifica = (colonna: string, valore: string) => {__mk();
    setBozza((precedente) => {__mk();
      const nuova = { ...precedente };
      nuova[colonna] = valore;
      return nuova;
    });
    setErrore("");
  };
  const salva = () => {__mk();
    if (table.column("Turno") >= 0 && leggi("Turno").trim() !== "Mattina") {
      setErrore('Turno non consentito: indica esclusivamente «Mattina». Nessuna modifica salvata.');
      return;
    }
    const date = ["Data sopralluogo", "Scadenza", "Nuova scadenza"].filter((nome) => (__mk(), table.column(nome) >= 0));
    const errata = date.find((nome) => (__mk(), !controllaData(leggi(nome))));
    if (errata) {
      setErrore(errata + ': indica una data valida dal lunedì al venerdì, nel formato GG/MM/AAAA oppure AAAA-MM-GG. Nessuna modifica salvata.');
      return;
    }
    if (ciglio && guardrail !== "Presente" && guardrail !== "Assente") {
      setErrore('Guardrail: scegli «Presente» oppure «Assente». Nessuna modifica salvata.');
      return;
    }
    const nuovaArea = table.column("Area") >= 0 ? leggi("Area") : "";
    const nuovoIndirizzo = table.column("Indirizzo") >= 0 ? leggi("Indirizzo") : "";
    const nuovaChiave = pageId + "|" + nuovaArea + "|" + nuovoIndirizzo;
    guardrailMemoria[nuovaChiave] = guardrail;
    if (nuovaChiave !== chiave) delete guardrailMemoria[chiave];
    table.columns.forEach((colonna) => (__mk(), table.setCell(rowIndex, colonna, colonna === "Turno" ? "Mattina" : leggi(colonna))));
    notify(ciglio ? "Programmazione salvata. Attrezzatura prevista: " + attrezzatura + "." : "Programmazione salvata: solo mattina e giorni feriali.");
    close();
  };
  return <Drawer title="Modifica programmazione" onClose={close} footer={<><Button variant="secondary" onClick={close}>Annulla</Button><Button onClick={salva}>Salva modifiche</Button></>}>
    <div className="space-y-4">
      <p className="text-(--mk-muted)">Turno consentito: Mattina. Tutte le date devono cadere dal lunedì al venerdì. Il salvataggio avviene solo se tutti i dati sono validi.</p>
      {errore && <p role="alert" className="rounded border border-(--mk-border) p-3 text-(--mk-danger)">{errore}</p>}
      {table.columns.map((colonna) => (__mk(), <TextInput key={colonna} label={colonna} value={leggi(colonna)} onChange={(valore) => (__mk(), modifica(colonna, valore))} />))}
      {ciglio && <section className="space-y-3 rounded border border-(--mk-border) bg-(--mk-subtle) p-4">
        <Select label="Guardrail" value={guardrail} options={["", "Presente", "Assente"]} onChange={(valore) => {__mk(); setGuardrail(valore); setErrore(""); }} />
        <Field label="Attrezzatura prevista"><strong>{attrezzatura}</strong></Field>
        <p className="text-(--mk-muted)">Guardrail assente: Trattore. Guardrail presente: Decespugliatore. La scelta viene conservata in memoria al salvataggio, senza nuove colonne.</p>
      </section>}
    </div>
  </Drawer>;
}
