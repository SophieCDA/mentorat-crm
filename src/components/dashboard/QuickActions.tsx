// components/dashboard/QuickActions.tsx
'use client';

import { JSX, useState } from 'react';

interface QuickAction {
  id: string;
  label: string;
  icon: JSX.Element;
  color: string;
  onClick: () => void;
}

export default function QuickActions() {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<string>('');

  const handleAction = (action: string) => {
    setModalContent(action);
    setShowModal(true);
    // Ici vous pouvez ajouter la logique pour chaque action
  };

  const actions: QuickAction[] = [
    {
      id: 'add-contact',
      label: 'Nouveau contact',
      color: 'from-crm-turquoise to-blue-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      onClick: () => handleAction('add-contact')
    },
    {
      id: 'new-transaction',
      label: 'Nouvelle transaction',
      color: 'from-green-500 to-emerald-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => handleAction('new-transaction')
    },
    {
      id: 'send-campaign',
      label: 'Lancer campagne',
      color: 'from-crm-pink to-red-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      ),
      onClick: () => handleAction('send-campaign')
    },
    {
      id: 'generate-report',
      label: 'Générer rapport',
      color: 'from-crm-purple to-indigo-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6h12zm-5-4h.01" />
        </svg>
      ),
      onClick: () => handleAction('generate-report')
    }
  ];

  return (
    <>
      {/* Quick Actions Bar */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700">Actions rapides</h2>
          <div className="flex items-center space-x-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`group relative px-4 py-2 rounded-lg bg-gradient-to-r ${action.color} text-white font-medium text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all`}
              >
                <div className="flex items-center space-x-2">
                  {action.icon}
                  <span className="hidden sm:inline">{action.label}</span>
                </div>
                
                {/* Tooltip for mobile */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity sm:hidden">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {action.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal placeholder - À remplacer par vos formulaires */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {modalContent === 'add-contact' && 'Ajouter un nouveau contact'}
                {modalContent === 'new-transaction' && 'Créer une nouvelle transaction'}
                {modalContent === 'send-campaign' && 'Lancer une campagne'}
                {modalContent === 'generate-report' && 'Générer un rapport'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Formulaire pour {modalContent} à implémenter ici.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}