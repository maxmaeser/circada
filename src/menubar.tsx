import React from 'react';
import ReactDOM from 'react-dom/client';
import { MenubarView } from './components/MenubarView';
import './index.css';

ReactDOM.createRoot(document.getElementById('menubar-root')!).render(
  <React.StrictMode>
    <MenubarView />
  </React.StrictMode>,
); 