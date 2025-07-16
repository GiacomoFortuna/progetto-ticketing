import { useEffect, useState } from 'react'; // Importa gli hook di React per gestire stato ed effetti
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList,
} from 'recharts'; // Importa i componenti grafici di Recharts per visualizzare i dati
import { useAuth } from '../context/AuthContext'; // Importa il context di autenticazione per ottenere il token

const baseUrl = import.meta.env.VITE_API_BASE_URL; // Ottiene la base URL dalle variabili d'ambiente

const COLORS = ['#429d46', '#ffbb28', '#ff8042', '#8884d8', '#e11d48', '#0ea5e9']; // Array di colori per i grafici

type StatEntry = { status: string; count: number }; // Tipizza una voce di stato
type DivisionEntry = { division: string; count: number }; // Tipizza una voce di divisione

const STATUS_LABELS: Record<string, string> = {
  open: 'Aperti', // Mappa lo stato "open" a "Aperti"
  'in-progress': 'In lavorazione', // Mappa lo stato "in-progress"
  paused: 'In pausa', // Mappa lo stato "paused"
  closed: 'Chiusi', // Mappa lo stato "closed"
};

const DIVISION_LABELS: Record<string, string> = {
  cloud: 'Cloud', // Mappa la divisione "cloud"
  networking: 'Networking', // Mappa la divisione "networking"
  'it-care': 'IT-Care', // Mappa la divisione "it-care"
};

function formatStatus(status: string) {
  return STATUS_LABELS[status] || status; // Restituisce la label formattata per lo stato
}
function formatDivision(division: string) {
  return DIVISION_LABELS[division] || division; // Restituisce la label formattata per la divisione
}

const DashboardStats = () => {
  const { token } = useAuth(); // Ottiene il token JWT dal context di autenticazione
  const [byStatus, setByStatus] = useState<StatEntry[]>([]); // Stato per i dati dei ticket per stato
  const [byDivision, setByDivision] = useState<DivisionEntry[]>([]); // Stato per i dati dei ticket per divisione
  const [loading, setLoading] = useState(true); // Stato per il caricamento
  const [error, setError] = useState<string | null>(null); // Stato per eventuali errori

  useEffect(() => {
    // Effetto per caricare le statistiche al mount o quando cambia il token
    const fetchStats = async () => {
      try {
        // Effettua la richiesta GET alle statistiche dei ticket
        const res = await fetch(`${baseUrl}/api/tickets/stats`, {
          headers: { Authorization: `Bearer ${token}` }, // Invia il token JWT
        });
        if (!res.ok) throw new Error('Errore nel recupero delle statistiche'); // Gestisce errori HTTP
        const data = await res.json(); // Parsea la risposta JSON
        setByStatus(data.byStatus || []); // Aggiorna lo stato con i dati per stato
        setByDivision(data.byDivision || []); // Aggiorna lo stato con i dati per divisione
      } catch (err) {
        console.error(err); // Logga eventuali errori
        setError('Errore nel recupero delle statistiche'); // Aggiorna lo stato errore
      } finally {
        setLoading(false); // Imposta loading a false dopo la richiesta
      }
    };
    fetchStats(); // Chiama la funzione di fetch
  }, [token]); // Dipende dal token

  if (loading) {
    // Se sta caricando, mostra messaggio di caricamento
    return <div className="text-center mt-20 text-lg font-semibold text-gray-500">🔄 Caricamento statistiche...</div>;
  }

  if (error) {
    // Se c'è errore, mostra messaggio di errore
    return <div className="text-center mt-20 text-red-500 font-semibold">{error}</div>;
  }

  // Calcola il totale dei ticket sommando i count di ogni stato
  const totalTickets = byStatus.reduce((sum, s) => sum + Number(s.count), 0);

  return (
    <div className="space-y-10">
      {/* Titolo e totale */}
      <h1 className="text-3xl font-bold text-[#429d46] mb-6 flex items-center gap-3">
        <span>📊 Statistiche Ticket</span>
        <span className="bg-[#429d46] text-white px-4 py-1 rounded-full text-base font-semibold shadow">
          Totale: {totalTickets}
        </span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Grafico ticket per stato */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[#429d46]"></span>
            Ticket per Stato
          </h2>
          {byStatus.length === 0 ? (
            <p className="text-sm text-gray-500">Nessun dato disponibile</p>
          ) : (
            <>
              {/* Badge numerici per ogni stato */}
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
              {/* BarChart per visualizzare i ticket per stato */}
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
                    formatter={(value: any) => [`${value} ticket`, 'Totale']}
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

        {/* Grafico ticket per divisione */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-[#ffbb28]"></span>
            Ticket per Divisione
          </h2>
          {byDivision.length === 0 ? (
            <p className="text-sm text-gray-500">Nessun dato disponibile</p>
          ) : (
            <>
              {/* Badge numerici per ogni divisione */}
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
              {/* PieChart per visualizzare i ticket per divisione */}
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={byDivision.map((d) => ({
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
                    formatter={(value: any, _unused: any) => [`${value} ticket`, 'Totale']}
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

export default DashboardStats; // Esporta il componente DashboardStats
