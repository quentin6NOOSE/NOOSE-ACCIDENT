import { useState, useEffect } from "react";
import { Plus, User, AlertTriangle, DollarSign, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AgentAccidentForm } from "./AgentAccidentForm";
import { Palmarès } from "./Palmares";

interface Agent {
  id: string;
  name: string;
  agent_number: number;
  total_accidents: number;
  total_cost: number;
  created_at: string;
}

export const AgentManagement = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPalmares, setShowPalmares] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [newAgentName, setNewAgentName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("noose_agents")
        .select("*")
        .order("agent_number", { ascending: true });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des agents:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les agents.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAgentName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un nom d'agent.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("noose_agents")
        .insert({
          name: newAgentName.trim(),
        });

      if (error) throw error;

      toast({
        title: "Agent ajouté !",
        description: `L'agent ${newAgentName} a été créé avec succès.`,
      });

      setNewAgentName("");
      setShowAddForm(false);
      fetchAgents();
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'agent.",
        variant: "destructive",
      });
    }
  };

  const handleAccidentAdded = () => {
    fetchAgents();
    setSelectedAgent(null);
  };

  if (loading) {
    return (
      <Card className="border-noose-blue/20 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Chargement des agents...</div>
        </CardContent>
      </Card>
    );
  }

  if (showPalmares) {
    return <Palmarès onBack={() => setShowPalmares(false)} />;
  }

  if (selectedAgent) {
    return (
      <AgentAccidentForm 
        agent={selectedAgent} 
        onBack={() => setSelectedAgent(null)}
        onAccidentAdded={handleAccidentAdded}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec boutons d'action */}
      <Card className="border-noose-blue/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-noose-blue/10 to-noose-accent/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-noose-blue">
              <User className="w-6 h-6" />
              Gestion des Agents ({agents.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowPalmares(true)}
                variant="military"
                className="flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                Palmarès
              </Button>
              <Button 
                onClick={() => setShowAddForm(true)}
                variant="alert"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nouvel Agent
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Formulaire d'ajout d'agent */}
      {showAddForm && (
        <Card className="border-alert-red/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-alert-red/10 to-alert-red/5">
            <CardTitle className="flex items-center gap-2 text-alert-red">
              <Plus className="w-6 h-6" />
              Créer un Nouvel Agent
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleAddAgent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nom de l'agent *
                </Label>
                <Input
                  id="agentName"
                  placeholder="Ex: Agent Smith, John Doe..."
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="border-noose-blue/20"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  variant="alert" 
                  className="flex-1"
                >
                  Créer l'Agent
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewAgentName("");
                  }}
                  className="px-8"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des agents */}
      <Card className="border-noose-blue/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-noose-blue/10 to-noose-accent/10">
          <CardTitle className="flex items-center gap-2 text-noose-blue">
            <User className="w-6 h-6" />
            Tableau des Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {agents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun agent enregistré pour le moment.</p>
              <p className="text-sm">Créez votre premier agent pour commencer !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <div 
                  key={agent.id}
                  className="border border-noose-blue/10 rounded-lg p-4 hover:bg-noose-light-blue/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{agent.agent_number}
                      </Badge>
                      <h3 className="font-semibold text-noose-blue">
                        {agent.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-alert-red" />
                      <span className="text-muted-foreground">Accidents:</span>
                      <span className="font-bold text-alert-red">
                        {agent.total_accidents}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-money-green" />
                      <span className="text-muted-foreground">Coût:</span>
                      <span className="font-bold text-money-green">
                        ${agent.total_cost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-noose-blue/10">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Score combiné:</span>
                      <span className="font-bold text-noose-accent">
                        {(agent.total_accidents * Number(agent.total_cost)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-center">
                    <Button 
                      variant="military" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgent(agent);
                      }}
                    >
                      Gérer les Accidents
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};