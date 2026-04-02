// src/App.tsx
import { useState } from 'react';
import { HomeView } from './components/views/HomeView';
import { InvestigationLayout } from './components/layout/InvestigationLayout';

function App() {
  const [showHome, setShowHome] = useState(true);

  const handleEnter = () => {
    setShowHome(false);
  };

  return (
    <>
      {showHome ? (
        <HomeView onEnter={handleEnter} />
      ) : (
        <InvestigationLayout />
      )}
    </>
  );
}

export default App;
