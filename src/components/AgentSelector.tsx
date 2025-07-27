import { useState, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Agent {
  id: string;
  name: string;
  agent_number: number;
  total_accidents: number;
  total_cost: number;
}

interface AgentSelectorProps {
  selectedAgentId: string | null;
  onAgentSelect: (agentId: string | null) => void;
  className?: string;
}

export const AgentSelector = ({ selectedAgentId, onAgentSelect, className }: AgentSelectorProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  const handleAgentSelect = (agentId: string) => {
    onAgentSelect(agentId);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={`animate-pulse bg-muted rounded-md h-10 ${className}`} />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between border-noose-blue/20"
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          {selectedAgent ? (
            <span>
              {selectedAgent.name} 
              <Badge variant="outline" className="ml-2 text-xs">
                #{selectedAgent.agent_number}
              </Badge>
            </span>
          ) : (
            <span className="text-muted-foreground">Sélectionner un agent</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 border-noose-blue/20 shadow-lg">
          <CardContent className="p-2 max-h-60 overflow-y-auto">
            <div className="space-y-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleAgentSelect('')}
                className="w-full justify-start text-muted-foreground"
              >
                <User className="w-4 h-4 mr-2" />
                Aucun agent spécifique
              </Button>
              
              {agents.map((agent) => (
                <Button
                  key={agent.id}
                  type="button"
                  variant={selectedAgentId === agent.id ? "military" : "ghost"}
                  onClick={() => handleAgentSelect(agent.id)}
                  className="w-full justify-start"
                >
                  <User className="w-4 h-4 mr-2" />
                  <div className="flex items-center gap-2 flex-1">
                    <span>{agent.name}</span>
                    <Badge variant="outline" className="text-xs">
                      #{agent.agent_number}
                    </Badge>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {agent.total_accidents} accidents
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};