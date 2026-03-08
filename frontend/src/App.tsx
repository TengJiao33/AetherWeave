import { useState } from 'react';
import MapContainer from './components/MapContainer';
import DashboardOverlay from './components/DashboardOverlay';

function App() {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
      <MapContainer onRightPanelToggle={setIsRightPanelOpen} />
      <DashboardOverlay hideRightPanels={isRightPanelOpen} />
    </div>
  );
}

export default App;
