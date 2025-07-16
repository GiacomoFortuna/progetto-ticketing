import { Mail, Phone, MapPin, Globe, FileText } from 'lucide-react'; // Importa le icone dalla libreria lucide-react

const PlanetelInfo = () => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md max-w-2xl mx-auto mt-6">
      {/* Contenitore principale con padding, bordo arrotondato, ombra e larghezza massima */}
      <h1 className="text-3xl font-bold text-[#14532d] mb-6 text-center">Contatti Planetel</h1>
      {/* Titolo della pagina, centrato e stilizzato */}

      <div className="space-y-5 text-gray-800 text-lg">
        {/* Contenitore delle informazioni, con spaziatura verticale tra le righe */}
        <div className="flex items-start gap-3">
          <MapPin className="w-6 h-6 text-[#14532d]" /> {/* Icona indirizzo */}
          <p><strong>Sede legale:</strong> Via Marconi, 39 - 24068 Seriate (BG)</p> {/* Testo indirizzo */}
        </div>

        <div className="flex items-start gap-3">
          <Phone className="w-6 h-6 text-[#14532d]" /> {/* Icona telefono */}
          <p>
            <strong>Telefono:</strong>
            <a href="tel:+39035204461" className="text-blue-600 hover:underline">035 204 461</a>
            {/* Link cliccabile per chiamare il numero */}
          </p>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="w-6 h-6 text-[#14532d]" /> {/* Icona email */}
          <p>
            <strong>Email:</strong>
            <a href="mailto:info@planetel.it" className="text-blue-600 hover:underline">info@planetel.it</a>
            {/* Link cliccabile per inviare email */}
          </p>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="w-6 h-6 text-[#14532d]" /> {/* Icona PEC */}
          <p>
            <strong>PEC:</strong>
            <a href="mailto:planetel@pec.it" className="text-blue-600 hover:underline">planetel@pec.it</a>
            {/* Link cliccabile per inviare PEC */}
          </p>
        </div>

        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-[#14532d]" /> {/* Icona partita IVA */}
          <p><strong>Partita IVA:</strong> 01931220168</p> {/* Testo partita IVA */}
        </div>

        <div className="flex items-start gap-3">
          <Globe className="w-6 h-6 text-[#14532d]" /> {/* Icona sito web */}
          <p>
            Visita il sito ufficiale:{" "}
            <a
              href="https://www.planetel.it"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              www.planetel.it
            </a>
            {/* Link cliccabile che apre il sito in una nuova scheda */}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanetelInfo; // Esporta il componente PlanetelInfo
// Questo componente mostra le informazioni di contatto di Planetel con icone e link interattivi.