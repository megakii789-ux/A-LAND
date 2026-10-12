import React from 'react';
import {AppProvider,useApp} from './context/AppContext';
import {Navbar} from './components/Navbar';
import {IslandHome} from './components/ChildIsland/IslandHome';
import {ParentDashboard} from './components/ParentCoach/ParentDashboard';
import {ErrorBoundary} from './components/shared/ErrorBoundary';
import {SpeechStatus} from './components/shared/SpeechStatus';
function MainAppContent(){
 const{currentView,storageError}=useApp();
 return <div className={`qy-app qy-mode-${currentView}`}>
  <a className="qy-skip-link" href="#main-content">跳到主要内容</a>
  <Navbar/>
  {currentView==='parent'&&storageError&&<p className="qy-storage-error" role="alert">{storageError}</p>}
  <main id="main-content" tabIndex={-1}>{currentView==='child'?<IslandHome/>:<ParentDashboard/>}</main>
  <SpeechStatus/>
 </div>;
}
export default function App(){return <ErrorBoundary><AppProvider><MainAppContent/></AppProvider></ErrorBoundary>;}
