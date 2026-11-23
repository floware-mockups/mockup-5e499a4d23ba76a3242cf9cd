// @ts-nocheck
import { customTicker, customTimers } from "../customGuard.ts";
const __mk = customTicker("CalcoloScadenzeVerde");
const { setTimeout, setInterval, clearTimeout, clearInterval } = customTimers("CalcoloScadenzeVerde");
import { useEffect, useState } from "react";
import { Card, Select, useTable, type SectionProps } from "../floware";

const priorita: Record<string, string> = {};
function dataValida(t: string) {__mk();
  const testo = t.trim();
  const italiana = testo.includes("/");
  const parti = testo.split(italiana ? "/" : "-");
  if (parti.length !== 3) return null;
  const ig = italiana ? 0 : 2;
  const ia = italiana ? 2 : 0;
  const g = Number(parti[ig]);
  const m = Number(parti[1]);
  const a = Number(parti[ia]);
  const d = new Date(a, m - 1, g, 12);
  if (!Number.isInteger(a) || a < 1900 || a > 9998 || d.getFullYear() !== a || d.getMonth() !== m - 1 || d.getDate() !== g) return null;
  return d;
}
function scadenza(t: string, livello: string) {__mk();
  const d = dataValida(t);
  if (!d) return "";
  d.setDate(d.getDate() + (livello === "Alta" ? 20 : livello === "Bassa" ? 40 : 30));
  const g = String(d.getDate()).padStart(2, "0");
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return g + "/" + m + "/" + d.getFullYear();
}
export default function CalcoloScadenzeVerde({ pageId }: SectionProps) {__mk();
  const table = useTable(pageId);
  const aree = useTable("aree-territoriali");
  const [versione, setVersione] = useState(0);
  const disponibili = table && ["Area", "Data intervento", "Scadenza"].every((c) => (__mk(), table.column(c) >= 0));
  const righe = disponibili && table ? table.rows.map((r, indice) => {__mk();
    const area = table.value(r, "Area");
    const indirizzo = table.column("Indirizzo") >= 0 ? table.value(r, "Indirizzo") : "";
    const chiave = area + "|" + indirizzo;
    const collegata = aree && aree.column("Area") >= 0 && aree.column("Urgenza") >= 0 ? aree.findRows("Area", area)[0] : undefined;
    const urgenza = aree && collegata !== undefined ? aree.value(collegata, "Urgenza") : "Media";
    const livello = priorita[chiave] || (["Alta", "Media", "Bassa"].includes(urgenza) ? urgenza : "Media");
    const data = table.value(r, "Data intervento");
    return { indice, area, chiave, livello, data, prevista: scadenza(data, livello), attuale: table.value(r, "Scadenza") };
  }) : [];
  useEffect(() => {__mk();
    if (!table || !disponibili) return;
    righe.forEach((r) => {__mk();
      const chiave = r.chiave;
      if (!priorita[chiave]) priorita[chiave] = r.livello;
      if (r.prevista && r.prevista !== r.attuale) table.setCell(r.indice, "Scadenza", r.prevista);
    });
  }, [table, aree, versione]);
  if (!table) return null;
  if (!disponibili) return <Card title="Priorità e scadenze"><p>Servono le colonne Area, Data intervento e Scadenza.</p></Card>;
  return <Card title="Priorità e scadenze automatiche"><div className="space-y-4">
    <p>Alta: 20 giorni. Media: 30 giorni. Bassa: 40 giorni. Il conteggio parte dalla Data intervento e comprende sabati e domeniche.</p>
    <p className="text-(--mk-muted)">Le priorità sono conservate in memoria per area, senza nuove colonne. Anche modificando la Data intervento la scadenza viene ricalcolata.</p>
    <div className="max-h-96 overflow-auto space-y-3">
      {righe.map((r) => (__mk(), <section key={r.indice} className="border border-(--mk-border) rounded-lg p-3 space-y-2">
        <h3 className="font-semibold">{r.area || "Area non indicata"}</h3>
        <Select label="Priorità dell’area" value={r.livello} options={["Alta", "Media", "Bassa"]} onChange={(v) => {__mk(); const chiave = r.chiave; priorita[chiave] = v; setVersione((n) => (__mk(), n + 1)); }} />
        <p>Data intervento: {r.data || "Non indicata"} · Scadenza: {r.prevista || "Non calcolabile"}</p>
        {!r.prevista && <p className="text-(--mk-danger)">Correggi Data intervento in formato GG/MM/AAAA o AAAA-MM-GG. La scadenza esistente non viene modificata.</p>}
      </section>))}
    </div>
  </div></Card>;
}
