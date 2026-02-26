import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';

// Create root and render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Optional: If you ever want a loading fallback (e.g., for Suspense boundaries later)
// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
//       <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
//     </div>}>
//       <App />
//     </React.Suspense>
//   </React.StrictMode>
// );