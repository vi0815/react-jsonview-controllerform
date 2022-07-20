import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import DemoJsonViewer from './demo.js'

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <DemoJsonViewer
      />
  </StrictMode>
);


