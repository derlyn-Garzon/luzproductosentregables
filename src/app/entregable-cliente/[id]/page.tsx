'use client';

import { useState, use, FormEvent, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import {
  Lock,
  Download,
  FileText,
  Calendar,
  User,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';
import { EntregablePublicInfo, EntregableStatus } from '@/lib/types';
import { generateDeliverablePDF } from '@/lib/pdf';

function DeliverableContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const deliverableId = resolvedParams.id;

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [deliverable, setDeliverable] = useState<EntregablePublicInfo | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Por favor ingrese la clave de acceso');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/entregables/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: deliverableId,
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setDeliverable(data.deliverable);
        setAuthenticated(true);
      } else {
        setError(data.error || 'Clave de acceso incorrecta');
      }
    } catch (err) {
      setError('Error al comunicarse con el servidor. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!deliverable?.imagen_url) return;
    const link = document.createElement('a');
    link.href = deliverable.imagen_url;
    link.download = `Entregable_${deliverable.cliente_nombre.replace(/\s+/g, '_')}_HD.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = async () => {
    if (!deliverable) return;
    try {
      setIsDownloadingPdf(true);
      await generateDeliverablePDF(deliverable);
    } catch (err) {
      console.error('PDF Generation Error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const getStatusBadge = (status: EntregableStatus) => {
    switch (status) {
      case 'a_tiempo':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
            A tiempo
          </span>
        );
      case 'proximo_a_vencer':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
            Próximo a vencer
          </span>
        );
      case 'vencido':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400 mr-2"></span>
            Vencido
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {!authenticated ? (
        /* Lock Screen / Password Authentication View */
        <div className="flex-1 flex items-center justify-center p-4 py-12">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Background Decorative Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lock className="w-7 h-7" />
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Acceso Protegido
              </h1>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Ingrese la clave única de seguridad provista por la empresa para desbloquear y descargar sus entregables.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <ShieldCheck className="w-5 h-5 text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'Validando Clave...' : 'Desbloquear Entregable'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500">
              🔒 Conexión encriptada con verificación bcrypt &amp; Signed Tokens.
            </div>
          </div>
        </div>
      ) : (
        /* Main View Post-Authentication */
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {deliverable && (
            <div className="space-y-8">
              {/* Header Info Banner */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <User className="w-4 h-4" />
                    <span>Entregable Exclusivo</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Entregable para: <span className="text-blue-400">{deliverable.cliente_nombre}</span>
                  </h1>
                  <p className="text-slate-400 text-sm mt-2">
                    Producto: <strong className="text-slate-200">{deliverable.nombre_producto}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-3 self-start md:self-auto">
                  {getStatusBadge(deliverable.status)}
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* High Resolution Preview Area (2 Columns) */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
                  <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Vista Previa de Alta Resolución</span>
                    <a
                      href={deliverable.imagen_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 text-blue-400 hover:underline"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Ver pantalla completa</span>
                    </a>
                  </div>

                  <div className="p-6 bg-slate-950 flex-1 flex items-center justify-center min-h-[350px]">
                    <img
                      src={deliverable.imagen_url}
                      alt={deliverable.nombre_producto}
                      className="max-h-[500px] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800"
                    />
                  </div>
                </div>

                {/* Details & Actions Sidebar (1 Column) */}
                <div className="space-y-6">
                  {/* Product Details Box */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
                      Detalles del Producto
                    </h3>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Nombre
                      </span>
                      <p className="text-sm text-slate-200 font-semibold">
                        {deliverable.nombre_producto}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Descripción
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                        {deliverable.descripcion_breve || 'Sin descripción detallada.'}
                      </p>
                    </div>

                    <div>
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Fecha Límite
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-slate-200">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span>{deliverable.fecha_limite}</span>
                      </div>
                    </div>
                  </div>

                  {/* Downloads & Actions Card */}
                  <div className="bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span>Acciones de Descarga</span>
                    </h3>

                    <p className="text-xs text-slate-300">
                      Descargue el archivo de imagen original de alta resolución o exporte la ficha formal en PDF.
                    </p>

                    <div className="space-y-3 pt-2">
                      {/* Download Image Button */}
                      <button
                        onClick={handleDownloadImage}
                        className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Download className="w-4 h-4" />
                        <span>Descargar Imagen (HD)</span>
                      </button>

                      {/* Download PDF Report Button */}
                      <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                        className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-2xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>{isDownloadingPdf ? 'Generando PDF...' : 'Descargar en PDF'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </>
  );
}

export default function ClientDeliverablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Cargando detalles de entrega...
        </div>
      }>
        <DeliverableContent params={params} />
      </Suspense>
    </div>
  );
}
