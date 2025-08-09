// components/contacts/ContactTransactions.tsx
'use client';

import { useState } from 'react';
import { Contact, Transaction } from '@/types/contact.types';

interface ContactTransactionsProps {
  contact: Contact;
  onUpdate: () => void;
}

export default function ContactTransactions({ contact, onUpdate }: ContactTransactionsProps) {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [filter, setFilter] = useState<'all' | 'reussie' | 'en_attente' | 'echouee'>('all');
  
  const transactions = contact.transactions || [];
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.statut === filter);

  const totalRevenue = transactions
    .filter(t => t.statut === 'reussie')
    .reduce((sum, t) => sum + t.montant, 0);

  const getStatusColor = (status: Transaction['statut']) => {
    switch (status) {
      case 'reussie':
        return 'bg-green-100 text-green-800';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'echouee':
        return 'bg-red-100 text-red-800';
      case 'remboursee':
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Transaction['statut']) => {
    switch (status) {
      case 'reussie':
        return 'Réussie';
      case 'en_attente':
        return 'En attente';
      case 'echouee':
        return 'Échouée';
      case 'remboursee':
        return 'Remboursée';
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'achat':
        return '🛒';
      case 'abonnement':
        return '🔄';
      case 'remboursement':
        return '↩️';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
          <button
            onClick={() => setShowAddTransaction(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-crm-pink to-crm-purple text-white text-sm rounded-lg hover:shadow-lg transition-all"
          >
            Nouvelle transaction
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Historique des transactions et paiements du contact
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-sm text-green-600 mb-1">Revenu total</p>
          <p className="text-2xl font-bold text-green-800">
            {totalRevenue.toLocaleString('fr-FR')} €
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-600 mb-1">Transactions</p>
          <p className="text-2xl font-bold text-blue-800">{transactions.length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <p className="text-sm text-yellow-600 mb-1">En attente</p>
          <p className="text-2xl font-bold text-yellow-800">
            {transactions.filter(t => t.statut === 'en_attente').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <p className="text-sm text-purple-600 mb-1">Valeur moyenne</p>
          <p className="text-2xl font-bold text-purple-800">
            {transactions.length > 0 
              ? Math.round(totalRevenue / transactions.filter(t => t.statut === 'reussie').length) 
              : 0} €
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-crm-purple text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Toutes ({transactions.length})
        </button>
        <button
          onClick={() => setFilter('reussie')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'reussie'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Réussies ({transactions.filter(t => t.statut === 'reussie').length})
        </button>
        <button
          onClick={() => setFilter('en_attente')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'en_attente'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          En attente ({transactions.filter(t => t.statut === 'en_attente').length})
        </button>
        <button
          onClick={() => setFilter('echouee')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'echouee'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Échouées ({transactions.filter(t => t.statut === 'echouee').length})
        </button>
      </div>

      {/* Transactions list */}
      {filteredTransactions.length > 0 ? (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {/* Type icon */}
                  <div className="text-2xl">{getTypeIcon(transaction.type)}</div>
                  
                  {/* Transaction details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-medium text-gray-900">
                        {transaction.description || 'Transaction'}
                      </h4>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(
                          transaction.statut
                        )}`}
                      >
                        {getStatusLabel(transaction.statut)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        {new Date(transaction.date_transaction).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      {transaction.reference && (
                        <>
                          <span>•</span>
                          <span>Réf: {transaction.reference}</span>
                        </>
                      )}
                      {transaction.methode_paiement && (
                        <>
                          <span>•</span>
                          <span>{transaction.methode_paiement}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Amount */}
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction.type === 'remboursement' ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {transaction.type === 'remboursement' && '-'}
                    {transaction.montant.toLocaleString('fr-FR')} {transaction.devise}
                  </p>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-2 mt-2">
                    {transaction.statut === 'en_attente' && (
                      <button className="text-xs text-green-600 hover:text-green-700">
                        Marquer payée
                      </button>
                    )}
                    <button className="text-xs text-gray-500 hover:text-gray-700">
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-gray-500">Aucune transaction trouvée</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter !== 'all' ? 'Essayez de changer les filtres' : 'Commencez par créer une première transaction'}
          </p>
        </div>
      )}

      {/* Add transaction modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Nouvelle transaction</h3>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-turquoise"
                  placeholder="Ex: Formation CRM, Abonnement..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-turquoise"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-turquoise">
                    <option value="achat">Achat</option>
                    <option value="abonnement">Abonnement</option>
                    <option value="remboursement">Remboursement</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-turquoise">
                  <option value="reussie">Réussie</option>
                  <option value="en_attente">En attente</option>
                  <option value="echouee">Échouée</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Méthode de paiement
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-crm-turquoise">
                  <option value="">Sélectionner...</option>
                  <option value="Carte bancaire">Carte bancaire</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Virement">Virement</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Chèque">Chèque</option>
                </select>
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddTransaction(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  // Logique pour sauvegarder
                  setShowAddTransaction(false);
                  onUpdate();
                }}
                className="px-4 py-2 bg-gradient-to-r from-crm-pink to-crm-purple text-white rounded-lg hover:shadow-lg transition-all"
              >
                Créer la transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}