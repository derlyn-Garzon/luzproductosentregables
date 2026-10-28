'use client';

import Navbar from '@/components/Navbar';
import {
  HelpCircle,
  Building2,
  UserCheck,
  ShieldAlert,
  FileCheck2,
  Key,
  Copy,
  Download,
  FileText,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: '¿Cómo se garantiza la seguridad de las contraseñas de los clientes?',
      a: 'Las contraseñas de los clientes se generan mediante algoritmos criptográficos aleatorios seguros. En la base de datos no se almacenan nunca en texto plano: se aplica la función hash con bcrypt (un estándar de encriptación de alta seguridad).',
    },
    {
      q: '¿Qué significan las etiquetas de estado de fecha límite?',
      a: 'El sistema calcula automáticamente el tiempo restante hasta la fecha límite:\n• "A tiempo" (Verde): Faltan más de 3 días para la entrega.\n• "Próximo a vencer" (Amarillo): Quedan 3 días o menos.\n• "Vencido" (Rojo): La fecha límite ya ha pasado.',
    },
    {
      q: '¿Qué formatos de imagen y archivos son soportados?',
      a: 'El gestor de carga admite imágenes en formato PNG, JPG, JPEG, WEBP y vectores SVG. Se procesan manteniendo la resolución y calidad original.',
    },
    {
      q: '¿El cliente puede volver a descargar sus entregables en el futuro?',
      a: 'Sí. Siempre que el cliente disponga del enlace único y la clave asignada por la empresa, podrá acceder, previsualizar y descargar su entregable en alta definición o reporte PDF las veces que lo requiera.',
    },
    {
      q: '¿Qué sucede si un cliente olvida su clave de acceso?',
      a: 'Por motivos de seguridad y encriptación irreversible, las contraseñas no se pueden recuperar en texto plano. El administrador puede actualizar o regenerar la clave del entregable desde el panel de administración de la empresa.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />

      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-4 h-4" />
            <span>Centro de Ayuda &amp; Guía del Usuario</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
            ¿Cómo funciona VisuaLink?
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Consulte la guía paso a paso para la administración de entregables de empresa y el acceso seguro para clientes.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Section 1: Entregables Empresa */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                1. Guía para "Entregables Empresa" (Administrador)
              </h2>
              <p className="text-xs text-slate-500">
                Aprenda a gestionar, enriquecer y compartir entregables con sus clientes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold mb-3">
                  Paso 1
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Carga de Imagen &amp; Metadatos</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Arrastre la imagen del producto en la zona de carga (o examínela en sus archivos). Complete el nombre del cliente, producto, breve descripción y seleccione la fecha límite.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold mb-3">
                  Paso 2
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Generación de Clave Única</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Al guardar, el sistema genera automáticamente una contraseña aleatoria de 10 caracteres criptográficos (o puede definir una personalizada). Esta clave se encripta con bcrypt.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold mb-3">
                  Paso 3
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Copiar y Compartir Enlace</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Presione <strong className="text-slate-800 font-semibold">"Copiar Enlace del Cliente"</strong> para enviar la URL única junto con la contraseña al cliente final por correo o mensajería.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Entregables Cliente */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                2. Guía para "Entregables Cliente" (Cliente Final)
              </h2>
              <p className="text-xs text-slate-500">
                Instrucciones para la consulta y descarga segura del material.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                <Key className="w-4 h-4" />
                <span>Acceso por Pantalla de Bloqueo</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Al ingresar a la URL provista (`/entregable-cliente/:id`), la interfaz solicita la clave única. Tras la validación del hash bcrypt, se otorga una sesión segura para acceder a las imágenes en alta resolución.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <Download className="w-4 h-4" />
                <span>Opciones de Descarga</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                El cliente puede presionar <strong className="text-slate-800 font-semibold">"Descargar Imagen (HD)"</strong> para obtener el archivo original en alta resolución, o usar <strong className="text-slate-800 font-semibold">"Descargar en PDF"</strong> para exportar un reporte estructurado formal.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: FAQ */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                3. Preguntas Frecuentes (FAQ)
              </h2>
              <p className="text-xs text-slate-500">
                Respuestas rápidas a las consultas más habituales.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-slate-900 text-sm hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed whitespace-pre-line border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
