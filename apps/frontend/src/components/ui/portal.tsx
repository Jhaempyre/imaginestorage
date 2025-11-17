import React from 'react';
import ReactDOM from 'react-dom';

export function Portal({ children }: { children: React.ReactNode }) {
  return ReactDOM.createPortal(children, document.getElementById('modal-root')!);
}
