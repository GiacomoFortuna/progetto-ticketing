import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList,
} from 'recharts';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#429d46', '#ffbb28', '#ff8042', '#8884d8', '#e11d48', '#0ea5e9'];

type StatEntry = { status: string; count: number };
type DivisionEntry = { division: string; count: number };

const STATUS_LABELS: Record<string, string> = {
  open: 'Aperti',
  'in-progress': 'In lavorazione',
  paused: 'In pausa',
  closed: 'Chiusi',
};

const DIVISION_LABELS: Record<string, string> = {
  cloud: 'Cloud',
  networking: 'Networking',
  'it-care': 'IT-Care',
};

function formatStatus(status: string) {
  return STATUS_LABELS[status] || status;
}
function formatDivision(division: string) {
  return DIVISION_LABELS[division] || division;
}

const DashboardStats = () => {
  const { token } = useAuth();
  const [byStatus, setByStatus] = useState<StatEntry[]>([]);
  const [byDivision, setByDivision] = useState<DivisionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/tickets/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setByStatus(data.byStatus || []);
        setByDivision(data.byDivision || []);
      } catch (err) {
        console.error(err);
        setError('Errore nel recupero delle statistiche');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) {
    return <div className="text-center mt-20 text-lg font-semibold text-gray-500">🔄 Caricamento statistiche...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500 font-semibold">{error}</div>;
  }

  // Totali
  const totalTickets = byStatus.reduce((sum, s) => sum + Number(s.count), 0);

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold text-[#429d46] mb-6 flex items-center gap-3">
        <span>📊 Statistiche Ticket</span>
        <span className="bg-[#429d46] text-white px-4 py-1 rounded-full text-base font-semibold shadow">
          Totale: {totalTickets}
        </span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ticket per Stato */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[#429d46]"></span>
            Ticket per Stato
          </h2>
          {byStatus.length === 0 ? (
            <p className="text-sm text-gray-500">Nessun dato disponibile</p>
          ) : (
            <>
              <div className="flex gap-4 mb-4">
                {byStatus.map((s, idx) => (
                  <div key={s.status} className="flex flex-col items-center">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ background: COLORS[idx % COLORS.length] }}
                    >
                      {s.count}
                    </span>
                    <span className="text-xs mt-1 text-gray-700">{formatStatus(s.status)}</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={byStatus.map((s, idx) => ({
                    ...s,
                    status: formatStatus(s.status),
                    fill: COLORS[idx % COLORS.length],
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                  <XAxis dataKey="status" stroke="#8884d8" />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [`${value} ticket`, 'Totale']}
                    labelFormatter={(label) => `Stato: ${label}`}
                  />
                  <Bar dataKey="count">
                    <LabelList dataKey="count" position="top" fill="#333" fontSize={13} />
                    {byStatus.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* Ticket per Divisione */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[#ffbb28]"></span>
            Ticket per Divisione
          </h2>
          {byDivision.length === 0 ? (
            <p className="text-sm text-gray-500">Nessun dato disponibile</p>
          ) : (
            <>
              <div className="flex gap-4 mb-4">
                {byDivision.map((d, idx) => (
                  <div key={d.division} className="flex flex-col items-center">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ background: COLORS[idx % COLORS.length] }}
                    >
                      {d.count}
                    </span>
                    <span className="text-xs mt-1 text-gray-700">{formatDivision(d.division)}</span>
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={byDivision.map((d, idx) => ({
                      ...d,
                      division: formatDivision(d.division),
                    }))}
                    dataKey="count"
                    nameKey="division"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ division, percent }) =>
                      `${division} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {byDivision.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [`${value} ticket`, 'Totale']}
                    labelFormatter={(label) => `Divisione: ${label}`}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
