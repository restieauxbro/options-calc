import { StockPositionProvider } from './context/StockPositionContext';

export default function ProtectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StockPositionProvider>
      {children}
    </StockPositionProvider>
  );
}



