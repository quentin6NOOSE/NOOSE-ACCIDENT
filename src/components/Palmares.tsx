import { useState, useEffect } from "react";
import { ArrowLeft, Trophy, AlertTriangle, DollarSign, Award, Medal, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Agent {
  id: string;
  name: string;
  agent_number: number;
  total_accidents: number;
  total_cost: number;
}

interface PalmaresProps {
  onBack: () => void;
}

export const Palmarès = ({ onBack }: PalmaresProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
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

  // Classements
  const topAccidents = [...agents]
    .sort((a, b) => b.total_accidents - a.total_accidents)
    .slice(0, 5);

  const topCosts = [...agents]
    .sort((a, b) => Number(b.total_cost) - Number(a.total_cost))
    .slice(0, 5);

  const topCombined = [...agents]
    .sort((a, b) => (b.total_accidents * Number(b.total_cost)) - (a.total_accidents * Number(a.total_cost)))
    .slice(0, 5);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <Trophy className="w-5 h-5 text-noose-blue" />;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1: return "default";
      case 2: return "secondary";
      case 3: return "outline";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <Card className="border-noose-blue/20 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Chargement du palmarès...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-noose-blue/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                onClick={onBack}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <Trophy className="w-8 h-8" />
                🏆 Palmarès NOOSE 🏆
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Les agents les plus... remarquables de notre organisation
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Accidents */}
        <Card className="border-alert-red/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-alert-red/10 to-alert-red/5">
            <CardTitle className="flex items-center gap-2 text-alert-red">
              <AlertTriangle className="w-6 h-6" />
              Plus d&apos;Accidents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {topAccidents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun agent avec des accidents</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topAccidents.map((agent, index) => (
                  <div 
                    key={agent.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      index === 0 ? 'bg-yellow-50 border-yellow-200' :
                      index === 1 ? 'bg-gray-50 border-gray-200' :
                      index === 2 ? 'bg-amber-50 border-amber-200' :
                      'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getRankIcon(index + 1)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{agent.name}</span>
                          <Badge variant="outline" className="text-xs">
                            #{agent.agent_number}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getRankBadgeVariant(index + 1)}>
                        {agent.total_accidents} accidents
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Coûts */}
        <Card className="border-money-green/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-money-green/10 to-money-green/5">
            <CardTitle className="flex items-center gap-2 text-money-green">
              <DollarSign className="w-6 h-6" />
              Plus Cher
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {topCosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun coût enregistré</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topCosts.map((agent, index) => (
                  <div 
                    key={agent.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      index === 0 ? 'bg-yellow-50 border-yellow-200' :
                      index === 1 ? 'bg-gray-50 border-gray-200' :
                      index === 2 ? 'bg-amber-50 border-amber-200' :
                      'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getRankIcon(index + 1)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{agent.name}</span>
                          <Badge variant="outline" className="text-xs">
                            #{agent.agent_number}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getRankBadgeVariant(index + 1)}>
                        ${Number(agent.total_cost).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Combiné */}
        <Card className="border-noose-accent/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-noose-accent/10 to-noose-accent/5">
            <CardTitle className="flex items-center gap-2 text-noose-accent">
              <Crown className="w-6 h-6" />
              Record Combiné
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {topCombined.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun score combiné</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topCombined.map((agent, index) => {
                  const combinedScore = agent.total_accidents * Number(agent.total_cost);
                  return (
                    <div 
                      key={agent.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        index === 0 ? 'bg-yellow-50 border-yellow-200' :
                        index === 1 ? 'bg-gray-50 border-gray-200' :
                        index === 2 ? 'bg-amber-50 border-amber-200' :
                        'bg-white border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getRankIcon(index + 1)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{agent.name}</span>
                            <Badge variant="outline" className="text-xs">
                              #{agent.agent_number}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {agent.total_accidents} × ${Number(agent.total_cost).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getRankBadgeVariant(index + 1)}>
                          {combinedScore.toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistiques globales */}
      <Card className="border-noose-blue/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-noose-blue/10 to-noose-accent/10">
          <CardTitle className="flex items-center gap-2 text-noose-blue">
            <Trophy className="w-6 h-6" />
            Statistiques Globales
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-noose-light-blue/10 rounded-lg">
              <div className="text-2xl font-bold text-noose-blue">
                {agents.length}
              </div>
              <div className="text-sm text-muted-foreground">Agents Total</div>
            </div>
            
            <div className="text-center p-4 bg-alert-red/10 rounded-lg">
              <div className="text-2xl font-bold text-alert-red">
                {agents.reduce((sum, agent) => sum + agent.total_accidents, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Accidents Total</div>
            </div>
            
            <div className="text-center p-4 bg-money-green/10 rounded-lg">
              <div className="text-2xl font-bold text-money-green">
                ${agents.reduce((sum, agent) => sum + Number(agent.total_cost), 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Coût Total</div>
            </div>
            
            <div className="text-center p-4 bg-noose-accent/10 rounded-lg">
              <div className="text-2xl font-bold text-noose-accent">
                {agents.length > 0 ? 
                  Math.round(agents.reduce((sum, agent) => sum + agent.total_accidents, 0) / agents.length * 100) / 100 
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">Moyenne/Agent</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};