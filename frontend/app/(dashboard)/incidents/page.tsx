import { TopBar } from "@/components/layout/TopBar";
import { getIncidents, getRooms, getTechnicians, getTenants } from "@/lib/data";
import { requireSession } from "@/lib/auth";
import { DEMO_TECNICO_ID } from "@/lib/roles";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { fmtRelativeTime } from "@/lib/i18n/format";
import { enIncidentDescription } from "@/lib/i18n/seed-en";
import { AlertTriangle } from "lucide-react";
import { IncidentsClient, type IncidentRow } from "./IncidentsClient";

const PRIORITY_ORDER = { Emergencia: 0, Alta: 1, Media: 2, Baja: 3 };

export default async function IncidenciasPage() {
  const { role } = await requireSession();

  const [allIncidents, rooms, technicians, tenants, dict, locale] = await Promise.all([
    getIncidents(),
    getRooms(),
    getTechnicians(),
    getTenants(),
    getDictionary(),
    getLocale(),
  ]);
  const t = dict.incidents;

  // Technician only sees incidents assigned to them
  const incidents = role === 'tecnico'
    ? allIncidents.filter((i) => i.technician_id === DEMO_TECNICO_ID)
    : allIncidents;

  const roomMap = Object.fromEntries(rooms.map((r) => [r.id, r]));
  const techMap = Object.fromEntries(technicians.map((tc) => [tc.id, tc]));
  const tenantMap = Object.fromEntries(tenants.map((tn) => [tn.id, tn]));

  const sorted = [...incidents].sort((a, b) => {
    const ap = PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 9;
    const bp = PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 9;
    return ap - bp;
  });

  const open = incidents.filter((i) => i.status === "Abierta").length;
  const inProcess = incidents.filter((i) => i.status === "En Proceso").length;
  const resolved = incidents.filter((i) => i.status === "Resuelta").length;

  const rows: IncidentRow[] = sorted.map((inc) => {
    const room = roomMap[inc.room_id];
    const tech = inc.technician_id ? techMap[inc.technician_id] : null;
    const tenant = inc.tenant_id ? tenantMap[inc.tenant_id] : null;
    return {
      incident: inc,
      description: enIncidentDescription(inc, locale),
      roomLabel: `${t.roomPrefix} ${room?.number ?? inc.room_id}`,
      roomTypeLabel: room ? dict.seedContent.roomType[room.type] ?? room.type : "",
      techName: tech?.name ?? null,
      techSpecialty: tech ? dict.seedContent.specialty[tech.specialty] ?? tech.specialty : null,
      tenantName: tenant?.full_name ?? null,
      createdRelative: fmtRelativeTime(inc.created_at, locale),
      updatedRelative: fmtRelativeTime(inc.updated_at, locale),
    };
  });

  return (
    <>
      <TopBar
        title={role === 'tecnico' ? t.titleTecnico : t.titleAdmin}
        subtitle={t.subtitle.replace("{open}", String(open)).replace("{inProcess}", String(inProcess)).replace("{resolved}", String(resolved))}
      />
      <main className="flex-1 overflow-y-auto p-6 bg-background">
        {/* Role notice for technician */}
        {role === 'tecnico' && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-violet-50 border border-violet-200 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-violet-600 shrink-0" />
            <p className="text-xs text-violet-700">
              {t.roleNotice}
            </p>
          </div>
        )}

        {/* Summary chips */}
        <div className="flex gap-3 mb-5">
          {[
            { label: t.chipOpen, count: open, color: "bg-red-50 text-red-700 border-red-200" },
            { label: t.chipInProcess, count: inProcess, color: "bg-blue-50 text-blue-700 border-blue-200" },
            { label: t.chipResolved, count: resolved, color: "bg-green-50 text-green-700 border-green-200" },
          ].map((item) => (
            <div key={item.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${item.color}`}>
              <span>{item.label}</span>
              <span className="font-bold">{item.count}</span>
            </div>
          ))}
        </div>

        <IncidentsClient rows={rows} />
      </main>
    </>
  );
}
