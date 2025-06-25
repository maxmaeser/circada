import React from 'react';
import ReactDOM from 'react-dom/client';
import { MenubarView } from './components/MenubarView';
import { useCircadianPhase } from './hooks/useCircadianPhase';
import './index.css';

function MenubarApp() {
  const { currentPhase } = useCircadianPhase();

  if (!currentPhase) {
    return <div className="p-2 text-sm">Loading...</div>;
  }

  return <MenubarView currentPhase={currentPhase} />;
}

ReactDOM.createRoot(document.getElementById('menubar-root')!).render(
  <React.StrictMode>
    <MenubarApp />
  </React.StrictMode>,
); 