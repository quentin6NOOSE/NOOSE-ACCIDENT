import { useState } from "react";
import { NooseHeader } from "@/components/NooseHeader";
import { ColleagueProfile } from "@/components/ColleagueProfile";
import { AccidentForm } from "@/components/AccidentForm";
import { AccidentsList } from "@/components/AccidentsList";
import { AgentManagement } from "@/components/AgentManagement";
import { Navigation } from "@/components/Navigation";
import { Palmarès } from "@/components/Palmares";
import { DailyQuote } from "@/components/DailyQuote";
import { CustomPopup } from "@/components/CustomPopup";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentView, setCurrentView] = useState<'home' | 'agents' | 'palmares'>('home');

  const handleAccidentAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'agents':
        return <AgentManagement />;
      case 'palmares':
        return <Palmarès onBack={() => setCurrentView('home')} />;
      default:
        return (
          <>
            <DailyQuote />
            <ColleagueProfile />
            <AccidentForm onAccidentAdded={handleAccidentAdded} />
            <AccidentsList refreshTrigger={refreshTrigger} />
          </>
        );
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-noose-light-blue/20">
      <NooseHeader />
      <CustomPopup />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        {renderContent()}
      </main>
      
      {/* Footer */}
      <footer className="mt-16 py-6 bg-noose-blue/10 border-t border-noose-blue/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 NOOSE - National Office of Security Enforcement</p>
          <p className="mt-1">Application interne - Usage humoristique uniquement</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
