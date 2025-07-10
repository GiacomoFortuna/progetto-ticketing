import { Mail, Phone, MapPin, Globe, FileText } from 'lucide-react';

const PlanetelInfo = () => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md max-w-2xl mx-auto mt-6">
      <h1 className="text-3xl font-bold text-[#14532d] mb-6 text-center">Contatti Planetel</h1>
      
      <div className="space-y-5 text-gray-800 text-lg">
        <div className="flex items-start gap-3">
          <MapPin className="w-6 h-6 text-[#14532d]" />
          <p><strong>Sede legale:</strong> Via Marconi, 39 - 24068 Seriate (BG)</p>
        </div>

        <div className="flex items-start gap-3">
          <Phone className="w-6 h-6 text-[#14532d]" />
          <p><strong>Telefono:</strong> <a href="tel:+39035204461" className="text-blue-600 hover:underline">035 204 461</a></p>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="w-6 h-6 text-[#14532d]" />
          <p><strong>Email:</strong> <a href="mailto:info@planetel.it" className="text-blue-600 hover:underline">info@planetel.it</a></p>
        </div>

        <div className="flex items-start gap-3">
          <Mail className="w-6 h-6 text-[#14532d]" />
          <p><strong>PEC:</strong> <a href="mailto:planetel@pec.it" className="text-blue-600 hover:underline">planetel@pec.it</a></p>
        </div>

        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-[#14532d]" />
          <p><strong>Partita IVA:</strong> 01931220168</p>
        </div>

        <div className="flex items-start gap-3">
          <Globe className="w-6 h-6 text-[#14532d]" />
          <p>
            Visita il sito ufficiale:{" "}
            <a href="https://www.planetel.it" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              www.planetel.it
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanetelInfo;
// This component displays the contact information for Planetel, including address, phone, email, PEC, VAT number, and website link.
// It uses icons from the 'lucide-react' library for better visual representation.