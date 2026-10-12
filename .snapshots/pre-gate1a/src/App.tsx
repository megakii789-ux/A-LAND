/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { IslandHome } from './components/ChildIsland/IslandHome';
import { ParentDashboard } from './components/ParentCoach/ParentDashboard';

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
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
