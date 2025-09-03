/**
 * OfferTracker Component
 * 
 * This component tracks and manages offers made to rights holders
 * during the sample clearance negotiation process.
 */

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, DollarSign, Percent } from 'lucide-react';
import { Offer } from '../types';

interface OfferTrackerProps {
  projectId: string;
  rightsHolder: string;
  offers: Offer[];
  onOffersChange: (offers: Offer[]) => void;
}

export const OfferTracker: React.FC<OfferTrackerProps> = ({
  projectId,
  rightsHolder,
  offers,
  onOffersChange,
}) => {
  const [showNewOfferForm, setShowNewOfferForm] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    type: 'flat',
    status: 'pending',
  });
  
  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  // Add a new offer
  const handleAddOffer = () => {
    if (
      (newOffer.type === 'flat' && newOffer.flatFee) ||
      (newOffer.type === 'royalty' && newOffer.royaltyPercentage) ||
      (newOffer.type === 'hybrid' && newOffer.flatFee && newOffer.royaltyPercentage)
    ) {
      const offer: Offer = {
        id: Date.now().toString(),
        projectId: projectId,
        date: new Date(),
        type: newOffer.type as 'flat' | 'royalty' | 'hybrid',
        flatFee: newOffer.flatFee,
        royaltyPercentage: newOffer.royaltyPercentage,
        advanceAmount: newOffer.advanceAmount,
        status: 'pending',
        notes: newOffer.notes,
      };
      
      onOffersChange([...offers, offer]);
      setNewOffer({
        type: 'flat',
        status: 'pending',
      });
      setShowNewOfferForm(false);
    }
  };
  
  // Update an offer
  const handleUpdateOffer = (offerId: string, updates: Partial<Offer>) => {
    const updatedOffers = offers.map(offer => 
      offer.id === offerId ? { ...offer, ...updates } : offer
    );
    
    onOffersChange(updatedOffers);
    setEditingOfferId(null);
  };
  
  // Delete an offer
  const handleDeleteOffer = (offerId: string) => {
    const updatedOffers = offers.filter(offer => offer.id !== offerId);
    onOffersChange(updatedOffers);
  };
  
  // Add a counter offer
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddCounterOffer = (offerId: string, counterOffer: Offer['counterOffer']) => {
    const updatedOffers = offers.map(offer => 
      offer.id === offerId
        ? { ...offer, counterOffer, status: 'countered' as const }
        : offer
    );
    
    onOffersChange(updatedOffers);
  };
  
  // Accept or reject an offer
  const handleOfferResponse = (offerId: string, status: 'accepted' | 'rejected') => {
    const updatedOffers = offers.map(offer => 
      offer.id === offerId ? { ...offer, status } : offer
    );
    
    onOffersChange(updatedOffers);
  };
  
  // Get status badge
  const getStatusBadge = (status: Offer['status']) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full">Accepted</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">Rejected</span>;
      case 'countered':
        return <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">Countered</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Pending</span>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Offer Tracking</h3>
        
        {!showNewOfferForm && (
          <button
            onClick={() => setShowNewOfferForm(true)}
            className="btn-primary text-sm flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>New Offer</span>
          </button>
        )}
      </div>
      
      {/* New Offer Form */}
      {showNewOfferForm && (
        <div className="card border border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-primary">New Offer</h4>
            <button
              onClick={() => setShowNewOfferForm(false)}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Offer Type
              </label>
              <select
                value={newOffer.type}
                onChange={(e) => setNewOffer({ ...newOffer, type: e.target.value as 'flat' | 'royalty' | 'hybrid' })}
                className="input-field"
              >
                <option value="flat">Flat Fee</option>
                <option value="royalty">Royalty Percentage</option>
                <option value="hybrid">Hybrid (Flat Fee + Royalty)</option>
              </select>
            </div>
            
            {(newOffer.type === 'flat' || newOffer.type === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Flat Fee Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-text-secondary" />
                  </div>
                  <input
                    type="number"
                    value={newOffer.flatFee || ''}
                    onChange={(e) => setNewOffer({ ...newOffer, flatFee: parseFloat(e.target.value) })}
                    placeholder="Enter amount"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            )}
            
            {(newOffer.type === 'royalty' || newOffer.type === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Royalty Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newOffer.royaltyPercentage || ''}
                    onChange={(e) => setNewOffer({ ...newOffer, royaltyPercentage: parseFloat(e.target.value) })}
                    placeholder="Enter percentage"
                    className="input-field pr-10"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Percent className="w-4 h-4 text-text-secondary" />
                  </div>
                </div>
              </div>
            )}
            
            {(newOffer.type === 'royalty' || newOffer.type === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Advance Amount (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-text-secondary" />
                  </div>
                  <input
                    type="number"
                    value={newOffer.advanceAmount || ''}
                    onChange={(e) => setNewOffer({ ...newOffer, advanceAmount: parseFloat(e.target.value) })}
                    placeholder="Enter advance amount"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={newOffer.notes || ''}
                onChange={(e) => setNewOffer({ ...newOffer, notes: e.target.value })}
                placeholder="Add any additional details about this offer"
                className="input-field min-h-[80px]"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewOfferForm(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOffer}
                disabled={
                  (newOffer.type === 'flat' && !newOffer.flatFee) ||
                  (newOffer.type === 'royalty' && !newOffer.royaltyPercentage) ||
                  (newOffer.type === 'hybrid' && (!newOffer.flatFee || !newOffer.royaltyPercentage))
                }
                className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-text-secondary">
            No offers have been made yet. Create your first offer to start tracking negotiations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="card border border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-text-primary">
                      {offer.type === 'flat' ? 'Flat Fee Offer' : 
                       offer.type === 'royalty' ? 'Royalty Offer' : 
                       'Hybrid Offer'}
                    </h4>
                    {getStatusBadge(offer.status)}
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    Sent on {formatDate(offer.date)}
                  </p>
                </div>
                
                {editingOfferId !== offer.id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingOfferId(offer.id)}
                      className="p-2 text-text-secondary hover:text-primary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-2 text-text-secondary hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {editingOfferId === offer.id ? (
                <div className="space-y-4">
                  {(offer.type === 'flat' || offer.type === 'hybrid') && (
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Flat Fee Amount
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="w-4 h-4 text-text-secondary" />
                        </div>
                        <input
                          type="number"
                          value={offer.flatFee || ''}
                          onChange={(e) => handleUpdateOffer(offer.id, { flatFee: parseFloat(e.target.value) })}
                          className="input-field pl-10"
                        />
                      </div>
                    </div>
                  )}
                  
                  {(offer.type === 'royalty' || offer.type === 'hybrid') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Royalty Percentage
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={offer.royaltyPercentage || ''}
                            onChange={(e) => handleUpdateOffer(offer.id, { royaltyPercentage: parseFloat(e.target.value) })}
                            className="input-field pr-10"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <Percent className="w-4 h-4 text-text-secondary" />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                          Advance Amount
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="w-4 h-4 text-text-secondary" />
                          </div>
                          <input
                            type="number"
                            value={offer.advanceAmount || ''}
                            onChange={(e) => handleUpdateOffer(offer.id, { advanceAmount: parseFloat(e.target.value) })}
                            className="input-field pl-10"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Notes
                    </label>
                    <textarea
                      value={offer.notes || ''}
                      onChange={(e) => handleUpdateOffer(offer.id, { notes: e.target.value })}
                      className="input-field min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingOfferId(null)}
                      className="btn-secondary text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setEditingOfferId(null)}
                      className="btn-primary text-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {(offer.type === 'flat' || offer.type === 'hybrid') && (
                      <div>
                        <span className="text-sm text-text-secondary">Flat Fee:</span>
                        <p className="font-medium text-text-primary">{formatCurrency(offer.flatFee)}</p>
                      </div>
                    )}
                    
                    {(offer.type === 'royalty' || offer.type === 'hybrid') && (
                      <>
                        <div>
                          <span className="text-sm text-text-secondary">Royalty:</span>
                          <p className="font-medium text-text-primary">{offer.royaltyPercentage}%</p>
                        </div>
                        
                        {offer.advanceAmount && (
                          <div>
                            <span className="text-sm text-text-secondary">Advance:</span>
                            <p className="font-medium text-text-primary">{formatCurrency(offer.advanceAmount)}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {offer.notes && (
                    <div className="mb-4">
                      <span className="text-sm text-text-secondary">Notes:</span>
                      <p className="text-text-primary mt-1 text-sm">{offer.notes}</p>
                    </div>
                  )}
                  
                  {/* Counter Offer */}
                  {offer.counterOffer && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-text-primary mb-2">Counter Offer</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        {offer.counterOffer.flatFee !== undefined && (
                          <div>
                            <span className="text-sm text-text-secondary">Flat Fee:</span>
                            <p className="font-medium text-text-primary">{formatCurrency(offer.counterOffer.flatFee)}</p>
                          </div>
                        )}
                        
                        {offer.counterOffer.royaltyPercentage !== undefined && (
                          <div>
                            <span className="text-sm text-text-secondary">Royalty:</span>
                            <p className="font-medium text-text-primary">{offer.counterOffer.royaltyPercentage}%</p>
                          </div>
                        )}
                        
                        {offer.counterOffer.advanceAmount !== undefined && (
                          <div>
                            <span className="text-sm text-text-secondary">Advance:</span>
                            <p className="font-medium text-text-primary">{formatCurrency(offer.counterOffer.advanceAmount)}</p>
                          </div>
                        )}
                      </div>
                      
                      {offer.counterOffer.notes && (
                        <div>
                          <span className="text-sm text-text-secondary">Notes:</span>
                          <p className="text-text-primary mt-1 text-sm">{offer.counterOffer.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Actions */}
                  {offer.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                      <button
                        onClick={() => handleOfferResponse(offer.id, 'rejected')}
                        className="btn-secondary text-sm flex items-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Mark Rejected</span>
                      </button>
                      <button
                        onClick={() => handleOfferResponse(offer.id, 'accepted')}
                        className="btn-primary text-sm flex items-center space-x-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark Accepted</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
