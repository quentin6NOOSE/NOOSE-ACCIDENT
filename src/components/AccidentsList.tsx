import { useState, useEffect } from "react";
import { Calendar, FileText, DollarSign, User, AlertTriangle, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AgentSelector } from "./AgentSelector";

interface Accident {
  id: string;
  date: string;
  description: string;
  cost: number;
  added_by: string;
  created_at: string;
  agent_id: string | null;
  agent?: {
    name: string;
    agent_number: number;
  };
}

interface AccidentsListProps {
  refreshTrigger: number;
  agentFilter?: string | null;
}

export const AccidentsList = ({ refreshTrigger, agentFilter }: AccidentsListProps) => {
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAgentId, setFilterAgentId] = useState<string | null>(agentFilter || null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    fetchAccidents();
  }, [refreshTrigger, filterAgentId]);

  useEffect(() => {
    if (agentFilter !== undefined) {
      setFilterAgentId(agentFilter);
    }
  }, [agentFilter]);

  const fetchAccidents = async () => {
    try {
      let query = supabase
        .from("noose_accidents")
        .select(`
          *,
          agent:noose_agents(name, agent_number)
        `)
        .order("date", { ascending: false });

      // Appliquer le filtre par agent si sélectionné
      if (filterAgentId) {
        query = query.eq("agent_id", filterAgentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAccidents(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des accidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    });
  };

  const getCostColor = (cost: number) => {
    if (cost === 0) return "text-muted-foreground";
    if (cost < 100) return "text-money-green";
    if (cost < 1000) return "text-noose-accent";
    return "text-alert-red";
  };

  const clearFilter = () => {
    setFilterAgentId(null);
    setShowFilter(false);
  };

  if (loading) {
    return (
      <Card className="border-noose-blue/20 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Chargement du journal des accidents...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-noose-blue/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-noose-blue/10 to-noose-accent/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-noose-blue">
            <AlertTriangle className="w-6 h-6" />
            Journal des Incidents ({accidents.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            {filterAgentId && (
              <Button
                onClick={clearFilter}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Effacer filtre
              </Button>
            )}
            <Button
              onClick={() => setShowFilter(!showFilter)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtrer
            </Button>
          </div>
        </div>
        
        {showFilter && (
          <div className="mt-4 p-4 bg-background/50 rounded-lg border">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtrer par agent:</label>
              <AgentSelector
                selectedAgentId={filterAgentId}
                onAgentSelect={(agentId) => {
                  setFilterAgentId(agentId);
                  setShowFilter(false);
                }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {accidents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>
              {filterAgentId 
                ? "Aucun accident trouvé pour cet agent." 
                : "Aucun accident enregistré pour le moment."
              }
            </p>
            <p className="text-sm">C&apos;est un miracle !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accidents.map((accident, index) => (
              <div 
                key={accident.id}
                className="border border-noose-blue/10 rounded-lg p-4 hover:bg-noose-light-blue/5 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        #{accidents.length - index}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(accident.date)}
                      </div>
                      {accident.agent && (
                        <Badge variant="secondary" className="text-xs">
                          {accident.agent.name} #{accident.agent.agent_number}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="w-4 h-4 text-noose-blue mt-1 flex-shrink-0" />
                      <p className="text-foreground">{accident.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      Signalé par: {accident.added_by}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <DollarSign className="w-4 h-4" />
                      <span className={`text-lg font-bold ${getCostColor(accident.cost)}`}>
                        {accident.cost === 0 ? "Gratuit" : `$${accident.cost.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};