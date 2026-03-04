import React, { createContext, useContext } from 'react';
import { type BusinessType, type BusinessLabels, getBusinessLabel } from '@/data/businessTypes';

interface BusinessContextType {
  businessType: BusinessType;
  labels: BusinessLabels;
}

const BusinessContext = createContext<BusinessContextType>({
  businessType: 'gym',
  labels: getBusinessLabel('gym'),
});

export const BusinessProvider: React.FC<{ businessType: BusinessType; children: React.ReactNode }> = ({ businessType, children }) => {
  const labels = getBusinessLabel(businessType);
  return (
    <BusinessContext.Provider value={{ businessType, labels }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusinessContext = () => useContext(BusinessContext);
