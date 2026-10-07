import { useState, type FormEvent } from 'react';
import { X, Star, Send, CheckCircle, MessageCircle } from 'lucide-react';

type Props = {
  local: { slug: string; nombre: string; whatsapp?: string };
  mesa?: string;
  onClose: () => void;
};

type Status = 'idle' | 'sending' | 'sent' | 'unavailable' | 'error';

const SuggestionModal = ({ local, mesa, onClose }: Props) => {
  const [puntaje, setPuntaje] = useState(0);
  const [comentario, setComentario] = useState('');
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) return;
    setStatus('sending');
    try {
      const response = await fetch('/api/sugerencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          local: local.slug,
          comentario,
          puntaje: puntaje || undefined,
          nombre,
          contacto,
          mesa,
          website,
        }),
      });
      if (response.ok) setStatus('sent');
      else setStatus(response.status === 503 ? 'unavailable' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const whatsappUrl = local.whatsapp
    ? `https://wa.me/${local.whatsapp}?text=${encodeURIComponent(
        `Sugerencia para ${local.nombre}${puntaje ? ` (${puntaje}/5)` : ''}:\n\n${comentario}`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-cream border border-peach text-brand flex items-center justify-center"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>

        {status === 'sent' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-brand mb-2">¡Gracias!</h2>
            <p className="text-gray-600 font-medium">Tu sugerencia nos ayuda a mejorar.</p>
            <button
              onClick={onClose}
              className="mt-6 bg-brand text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-wider text-xs"
            >
              Volver al menú
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-2xl font-black text-brand pr-10">Déjanos tu sugerencia</h2>
              <p className="text-sm text-gray-500 mt-1">Cuéntanos cómo te fue en {local.nombre}.</p>
            </div>

            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Tu experiencia</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPuntaje(n === puntaje ? 0 : n)}
                    className="p-1"
                    aria-label={`${n} de 5`}
                  >
                    <Star size={30} className={n <= puntaje ? 'fill-amber-400 text-amber-400' : 'text-peach'} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block">Comentario *</label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                maxLength={1000}
                rows={4}
                required
                placeholder="¿Qué te gustó? ¿Qué podemos mejorar?"
                className="w-full bg-cream border border-peach rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={200}
                placeholder="Nombre (opcional)"
                className="bg-cream border border-peach rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand/50"
              />
              <input
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                maxLength={200}
                placeholder="Teléfono o email (opcional)"
                className="bg-cream border border-peach rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand/50"
              />
            </div>

            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            {status === 'error' && (
              <p className="text-sm text-red-600 font-medium">No se pudo enviar. Intenta de nuevo en un momento.</p>
            )}

            {status === 'unavailable' ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 font-medium">Por ahora puedes enviarnos tu sugerencia por WhatsApp.</p>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} /> Enviar por WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <button
                type="submit"
                disabled={status === 'sending' || !comentario.trim()}
                className="w-full bg-brand hover:bg-brand-dark disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {status === 'sending' ? 'Enviando...' : <>Enviar sugerencia <Send size={16} /></>}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default SuggestionModal;
