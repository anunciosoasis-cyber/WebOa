import React, { useState } from 'react';
import MinutesHistory from './minutes/MinutesHistory';
import SessionManager from './sessions/SessionManager';
import PendingSessions from './sessions/PendingSessions';
import ActiveSession from './sessions/ActiveSession';

// Importación de componentes UI aislados
import BoardHeader from './components/BoardHeader';
import BoardButton from './components/BoardButton';
import BoardCard from './components/BoardCard';
import BoardMembers from './components/BoardMembers';

const ChurchBoardApp = () => {
  const [currentView, setCurrentView] = useState('history'); // 'history' | 'new_session' | 'voting'
  const [activeSessionData, setActiveSessionData] = useState(null);

  return (
    <div className="church-board w-full min-h-screen p-4 md:p-6 lg:p-8">
      {/* Contenedor principal de ancho completo optimizado con sombras internas y externas */}
      <div className="w-full max-w-[1600px] mx-auto bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] border border-slate-200/80 p-6 md:p-8 min-h-[750px]">
        
        <BoardHeader 
          title={<>JUNTA <span className="text-amber-500 font-['Moonrising']">OASIS</span></>}
          rightElement={
            <div className="flex gap-3">
              <BoardButton 
                variant={currentView === 'members' ? 'primary' : 'outline'}
                onClick={() => setCurrentView('members')}
              >
                MIEMBROS PERMANENTES
              </BoardButton>
              <BoardButton 
                onClick={() => setCurrentView(currentView === 'history' ? 'new_session' : 'history')}
              >
                {currentView === 'history' ? 'NUEVA JUNTA' : 'VOLVER AL HISTORIAL'}
              </BoardButton>
            </div>
          }
        />

        <div className="mt-8">
          {currentView === 'history' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 flex flex-col h-full">
                <MinutesHistory onNewJunta={() => setCurrentView('new_session')} />
              </div>
              <div className="lg:col-span-5 flex flex-col h-full">
                <PendingSessions onStartSession={(session) => {
                  console.log("Starting session:", session);
                  setActiveSessionData(session);
                  setCurrentView('active_session');
                }} />
              </div>
            </div>
          )}
          {currentView === 'members' && <BoardMembers />}
          {currentView === 'new_session' && <SessionManager />}
          {currentView === 'active_session' && (
            <ActiveSession 
              activeSession={activeSessionData} 
              onEndSession={() => {
                setActiveSessionData(null);
                setCurrentView('history');
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChurchBoardApp;
