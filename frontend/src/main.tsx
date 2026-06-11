import React from 'react';
import ReactDOM from 'react-dom/client';
import { EmployeeManager } from './EmployeeManager';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <EmployeeManager />
  </React.StrictMode>
);
