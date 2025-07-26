import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Calendar, FileText, DollarSign, User, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Agent {
  id: string;
  name: string;
  agent_number: number;
  total_accidents: number;
  total_cost: number;
}

interface Accident {
  id: string;
  date: string;
  description: string;
  cost: number;
  added_by: string;
  created_at: string;
}

interface AgentAccidentFormProps {
  agent: Agent;
  onBack: () => void;
  onAccidentAdded: () => void;
}

export const AgentAccidentForm = ({ agent, onBack, onAccidentAdded }: AgentAccidentFormProps) => {
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: "",
    cost: "",
    added_by: "",
  });

  useEffect(() => {
    fetchAgentAccidents();
  }, [agent.id]);

  const fetchAgentAccidents = async () => {
    try {
      const { data, error } = await supabase
        .from("noose_accidents")
        .select("*")
        .eq("agent_id", agent.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setAccidents(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des accidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.added_by) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("noose_accidents")
        .insert({
          agent_id: agent.id,
          date: formData.date,
          description: formData.description,
          cost: parseFloat(formData.cost) || 0,
          added_by: formData.added_by,
        });

      if (error) throw error;

      toast({
        title: "Accident ajouté !",
        description: `L'incident a été enregistré pour ${agent.name}.`,
      });

      // Réinitialiser le formulaire
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: "",
        cost: "",
        added_by: "",
      });

      setShowAddForm(false);
      fetchAgentAccidents();
      onAccidentAdded();
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'accident.",
        variant: "destructive",
      });
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

  return (
    <div className="space-y-6">
      {/* Header avec informations de l'agent */}
      <Card className="border-noose-blue/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-noose-blue/10 to-noose-accent/10">
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
              <div>
                <CardTitle className="flex items-center gap-2 text-noose-blue">
                  <User className="w-6 h-6" />
                  {agent.name}
                  <Badge variant="outline">#{agent.agent_number}</Badge>
                </CardTitle>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddForm(true)}
              variant="alert"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvel Accident
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-alert-red/10 p-4 rounded-lg border border-alert-red/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-alert-red" />
                <span className="text-sm font-medium text-alert-red">Total Accidents</span>
              </div>
              <div className="text-3xl font-bold text-alert-red">
                {agent.total_accidents}
              </div>
            </div>

            <div className="bg-money-green/10 p-4 rounded-lg border border-money-green/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-money-green" />
                <span className="text-sm font-medium text-money-green">Coût Total</span>
              </div>
              <div className="text-2xl font-bold text-money-green">
                ${agent.total_cost.toLocaleString()}
              </div>
            </div>

            <div className="bg-noose-accent/10 p-4 rounded-lg border border-noose-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-noose-accent" />
                <span className="text-sm font-medium text-noose-accent">Score Combiné</span>
              </div>
              <div className="text-2xl font-bold text-noose-accent">
                {(agent.total_accidents * Number(agent.total_cost)).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout d'accident */}
      {showAddForm && (
        <Card className="border-alert-red/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-alert-red/10 to-alert-red/5">
            <CardTitle className="flex items-center gap-2 text-alert-red">
              <Plus className="w-6 h-6" />
              Nouveau Rapport d&apos;Incident pour {agent.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date de l&apos;incident *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="border-noose-blue/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Coût estimé ($)
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="border-noose-blue/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Description de l&apos;incident *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Ex: A renversé une voiture, A tiré sur une poubelle, A cassé la machine à café..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-noose-blue/20 min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="added_by" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Signalé par *
                </Label>
                <Input
                  id="added_by"
                  placeholder="Votre nom ou badge"
                  value={formData.added_by}
                  onChange={(e) => setFormData({ ...formData, added_by: e.target.value })}
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
                  Enregistrer l'Incident
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="px-8"
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des accidents de l'agent */}
      <Card className="border-noose-blue/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-noose-blue/10 to-noose-accent/10">
          <CardTitle className="flex items-center gap-2 text-noose-blue">
            <AlertTriangle className="w-6 h-6" />
            Historique des Incidents ({accidents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">Chargement des accidents...</div>
            </div>
          ) : accidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun accident enregistré pour cet agent.</p>
              <p className="text-sm">Un miracle !</p>
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
    </div>
  );
};