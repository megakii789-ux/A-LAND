/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { IslandHome } from './components/ChildIsland/IslandHome';
import { ParentDashboard } from './components/ParentCoach/ParentDashboard';
import { VisualV2Shell } from './visual-v2/VisualV2Shell';

export function isVisualV2ReviewRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const pathname = window.location.pathname || '/';
  const searchParams = new URLSearchParams(window.location.search || '');
  return (
    pathname === '/visual-v2-review' ||
    pathname.startsWith('/visual-v2-review/') ||
    searchParams.get('visual_v2') === '1'
  );
}

const MainAppContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-stone-900 select-none bg-stone-50">
      <Navbar />
      <main className="flex-1">
        {currentView === 'child' ? <IslandHome /> : <ParentDashboard />}
      </main>
    </div>
  );
};

export default function App() {
  const [isV2Review, setIsV2Review] = useState<boolean>(() => isVisualV2ReviewRoute());

  useEffect(() => {
    const handleRouteChange = () => {
      setIsV2Review(isVisualV2ReviewRoute());
    };
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const handleExitV2Review = () => {
    if (typeof window !== 'undefined' && window.history?.pushState) {
      window.history.pushState({}, '', '/');
      setIsV2Review(false);
    }
  };

  return (
    <AppProvider>
      {isV2Review ? (
        <VisualV2Shell onExitV2Review={handleExitV2Review} />
      ) : (
        <MainAppContent />
      )}
    </AppProvider>
  );
}

