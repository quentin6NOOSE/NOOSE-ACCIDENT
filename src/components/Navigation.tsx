import { useState } from "react";
import { Home, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NavigationProps {
  currentView: 'home' | 'agents' | 'palmares';
  onViewChange: (view: 'home' | 'agents' | 'palmares') => void;
}

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  return (
    <Card className="border-noose-blue/20 shadow-lg mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            onClick={() => onViewChange('home')}
            variant={currentView === 'home' ? 'military' : 'outline'}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Button>
          
          <Button
            onClick={() => onViewChange('agents')}
            variant={currentView === 'agents' ? 'military' : 'outline'}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Gestion des Agents
          </Button>
          
          <Button
            onClick={() => onViewChange('palmares')}
            variant={currentView === 'palmares' ? 'military' : 'outline'}
            className="flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Palmarès
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};