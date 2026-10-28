'use client';

import { useState, useEffect, useRef, ChangeEvent, DragEvent } from 'react';
import {
  Plus,
  Copy,
  Check,
  Calendar,
  User,
  Clock,
  Trash2,
  Edit,
  Upload,
  Image as ImageIcon,
  Key,
  ExternalLink,
  Search,
  AlertTriangle,
  X,
  Lock,
} from 'lucide-react';
import { EntregablePublicInfo, EntregableStatus } from '@/lib/types';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

export default function AdminPanel() {
  const [deliverables, setDeliverables] = useState<EntregablePublicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreatedSuccessModal, setShowCreatedSuccessModal] = useState<{
    id: string;
    generatedPassword?: string;
    cliente_nombre: string;
    nombre_producto: string;
  } | null>(null);
  const [editingItem, setEditingItem] = useState<EntregablePublicInfo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    cliente_nombre: '',
    nombre_producto: '',
    descripcion_breve: '',
    fecha_limite: '',
    imagen_url: '',
    custom_password: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleFetchDeliverables = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/entregables');
      if (res.ok) {
        const data = await res.json();
        setDeliverables(data);
      }
    } catch (err) {
      showToast('Error al cargar la lista de entregables', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchDeliverables();
    setFormData((prev) => ({
      ...prev,
      fecha_limite: new Date().toISOString().split('T')[0],
    }));
  }, []);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona un archivo de imagen válido', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setFormData((prev) => ({ ...prev, imagen_url: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cliente_nombre || !formData.nombre_producto || !formData.fecha_limite) {
      showToast('Completa los campos obligatorios', 'error');
      return;
    }

    if (!formData.imagen_url) {
      showToast('Sube o selecciona una imagen de presentación', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/entregables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const createdData = await res.json();
        setShowCreateModal(false);
        setShowCreatedSuccessModal({
          id: createdData.id,
          generatedPassword: createdData.generatedPassword,
          cliente_nombre: createdData.cliente_nombre,
          nombre_producto: createdData.nombre_producto,
        });
        resetForm();
        handleFetchDeliverables();
        showToast('Entregable creado exitosamente');
      } else {
        const err = await res.json();
        showToast(err.error || 'Error al crear entregable', 'error');
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/entregables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          cliente_nombre: formData.cliente_nombre,
          nombre_producto: formData.nombre_producto,
          descripcion_breve: formData.descripcion_breve,
          fecha_limite: formData.fecha_limite,
          imagen_url: formData.imagen_url || editingItem.imagen_url,
        }),
      });

      if (res.ok) {
        setEditingItem(null);
        resetForm();
        handleFetchDeliverables();
        showToast('Entregable actualizado correctamente');
      } else {
        const err = await res.json();
        showToast(err.error || 'Error al actualizar', 'error');
      }
    } catch (err) {
      showToast('Error de comunicación', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/entregables?id=${deletingId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeletingId(null);
        handleFetchDeliverables();
        showToast('Entregable eliminado');
      } else {
        showToast('No se pudo eliminar el entregable', 'error');
      }
    } catch (err) {
      showToast('Error de red', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_nombre: '',
      nombre_producto: '',
      descripcion_breve: '',
      fecha_limite: new Date().toISOString().split('T')[0],
      imagen_url: '',
      custom_password: '',
    });
    setImagePreview('');
  };

  const copyClientLink = (id: string) => {
    const link = `${window.location.origin}/entregable-cliente/${id}`;
    navigator.clipboard.writeText(link);
    showToast('Enlace de cliente copiado al portapapeles');
  };

  const copyTextToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copiado al portapapeles`);
  };

  const getStatusBadge = (status: EntregableStatus) => {
    switch (status) {
      case 'a_tiempo':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            A tiempo
          </span>
        );
      case 'proximo_a_vencer':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            Próximo a vencer
          </span>
        );
      case 'vencido':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
            Vencido
          </span>
        );
      default:
        return null;
    }
  };

  const filteredDeliverables = deliverables.filter(
    (d) =>
      d.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.descripcion_breve.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center space-x-2 text-white transition-all transform translate-y-0 ${
              toast.type === 'error'
                ? 'bg-rose-600'
                : toast.type === 'info'
                ? 'bg-blue-600'
                : 'bg-emerald-600'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 text-sm font-semibold tracking-wide uppercase mb-1">
              <Lock className="w-4 h-4" />
              <span>Panel de Administración</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Entregables Empresa
            </h1>
            <p className="mt-2 text-slate-300 text-base max-w-2xl">
              Gestione los entregables visuales de sus clientes, configure fechas límite con alerta de estado y comparta enlaces protegidos con contraseña criptográfica.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] self-start md:self-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Entregable
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Mostrando <span className="text-slate-900 font-bold">{filteredDeliverables.length}</span> entregable(s) ordenados cronológicamente
          </div>
        </div>

        {/* List / Cards View */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-pulse">
                <div className="w-full h-48 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-4"></div>
                <div className="h-10 bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredDeliverables.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <ImageIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-semibold text-slate-700">No hay entregables disponibles</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              {searchTerm
                ? 'No se encontraron entregables con los términos ingresados.'
                : 'Cree su primer entregable haciendo clic en "Nuevo Entregable".'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeliverables.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group"
              >
                {/* Thumbnail Preview Header */}
                <div className="relative h-52 bg-slate-100 border-b border-slate-100 overflow-hidden">
                  <img
                    src={item.imagen_url || ''}
                    alt={item.nombre_producto}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md flex items-center space-x-1 font-medium">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>{item.cliente_nombre}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.nombre_producto}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.descripcion_breve || 'Sin descripción adicional.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Límite: <strong className="text-slate-700">{item.fecha_limite}</strong></span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setFormData({
                            cliente_nombre: item.cliente_nombre,
                            nombre_producto: item.nombre_producto,
                            descripcion_breve: item.descripcion_breve || '',
                            fecha_limite: item.fecha_limite,
                            imagen_url: item.imagen_url || '',
                            custom_password: '',
                          });
                          setImagePreview(item.imagen_url || '');
                        }}
                        title="Editar"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(item.id)}
                        title="Eliminar"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <button
                      onClick={() => copyClientLink(item.id)}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Enlace del Cliente</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal: Create Deliverable */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Crear Nuevo Entregable</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Constructora San Martín"
                  value={formData.cliente_nombre}
                  onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Render Fotorrealista de Fachada"
                  value={formData.nombre_producto}
                  onChange={(e) => setFormData({ ...formData, nombre_producto: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Fecha Límite de Entrega *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_limite}
                    onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contraseña Personalizada (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generada si se deja vacío"
                    value={formData.custom_password}
                    onChange={(e) => setFormData({ ...formData, custom_password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Breve Descripción del Producto
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre las especificaciones o revisiones..."
                  value={formData.descripcion_breve}
                  onChange={(e) => setFormData({ ...formData, descripcion_breve: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Drag & Drop Image Uploader */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Imagen de Presentación *
                </label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : imagePreview
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-300 hover:border-blue-400 bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded-xl object-contain shadow-sm"
                      />
                      <p className="text-xs text-emerald-700 font-medium mt-2">
                        ✓ Imagen seleccionada. Haz clic para cambiar.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <Upload className="w-8 h-8 text-blue-500 mx-auto" />
                      <p className="text-xs text-slate-600 font-medium">
                        Arrastra y suelta una imagen aquí, o <span className="text-blue-600 font-semibold underline">examina archivos</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Archivos PNG, JPG o WEBP</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear y Generar Clave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Created Success with Password & Link */}
      {showCreatedSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 text-center">
              ¡Entregable Creado!
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1">
              Guarde o comparta las credenciales para el cliente <strong>{showCreatedSuccessModal.cliente_nombre}</strong>.
            </p>

            <div className="mt-6 space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* Password display */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Contraseña Única del Cliente
                </label>
                <div className="flex items-center justify-between bg-slate-900 text-emerald-400 px-3.5 py-2.5 rounded-xl font-mono text-sm font-bold">
                  <span>{showCreatedSuccessModal.generatedPassword}</span>
                  <button
                    onClick={() =>
                      copyTextToClipboard(showCreatedSuccessModal.generatedPassword || '', 'Contraseña')
                    }
                    className="text-slate-400 hover:text-white p-1"
                    title="Copiar contraseña"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Client Link display */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Enlace Directo de Acceso
                </label>
                <div className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-700">
                  <span className="truncate mr-2 font-mono text-[11px]">
                    {`${window.location.origin}/entregable-cliente/${showCreatedSuccessModal.id}`}
                  </span>
                  <button
                    onClick={() => copyClientLink(showCreatedSuccessModal.id)}
                    className="text-blue-600 hover:text-blue-800 p-1 flex-shrink-0"
                    title="Copiar enlace"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowCreatedSuccessModal(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow"
              >
                Entendido y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Deliverable */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h2 className="text-xl font-bold text-slate-900">Editar Entregable</h2>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  required
                  value={formData.cliente_nombre}
                  onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre_producto}
                  onChange={(e) => setFormData({ ...formData, nombre_producto: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Fecha Límite de Entrega
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_limite}
                  onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Breve Descripción
                </label>
                <textarea
                  rows={2}
                  value={formData.descripcion_breve}
                  onChange={(e) => setFormData({ ...formData, descripcion_breve: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">¿Eliminar entregable?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Esta acción eliminará de forma permanente este producto y revocará el acceso del cliente.
            </p>

            <div className="flex items-center justify-center space-x-3 mt-6">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl w-1/2"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md w-1/2"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
