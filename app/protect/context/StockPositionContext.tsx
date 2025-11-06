'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface StockPosition {
  shares: number;
  purchasePrice: number;
  currentPrice: number;
}

interface StockPositionContextType {
  position: StockPosition;
  updatePosition: (position: Partial<StockPosition>) => void;
  initialInvestment: number;
  currentValue: number;
  unrealizedLoss: number;
  unrealizedLossPercentage: number;
}

const StockPositionContext = createContext<StockPositionContextType | undefined>(undefined);

export function StockPositionProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<StockPosition>({
    shares: 300,
    purchasePrice: 46.01,
    currentPrice: 42.8,
  });

  const updatePosition = (updates: Partial<StockPosition>) => {
    setPosition((prev) => ({ ...prev, ...updates }));
  };

  const initialInvestment = position.shares * position.purchasePrice;
  const currentValue = position.shares * position.currentPrice;
  const unrealizedLoss = currentValue - initialInvestment;
  const unrealizedLossPercentage = (unrealizedLoss / initialInvestment) * 100;

  return (
    <StockPositionContext.Provider
      value={{
        position,
        updatePosition,
        initialInvestment,
        currentValue,
        unrealizedLoss,
        unrealizedLossPercentage,
      }}
    >
      {children}
    </StockPositionContext.Provider>
  );
}

export function useStockPosition() {
  const context = useContext(StockPositionContext);
  if (context === undefined) {
    throw new Error('useStockPosition must be used within a StockPositionProvider');
  }
  return context;
}



