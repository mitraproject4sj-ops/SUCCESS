import React from 'react';
import { TradingProvider } from './context/TradingContext';
import CompleteLakshyaDashboard from './components/CompleteLakshyaDashboard';

function App() {
  return (
    <TradingProvider>
      <CompleteLakshyaDashboard />
    </TradingProvider>
  );
}

export default App;