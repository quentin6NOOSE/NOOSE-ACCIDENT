import { useState, useEffect } from "react";
import { Quote, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface DailyQuote {
  id: string;
  content: string;
  author: string;
  date: string;
  is_active: boolean;
}

export const DailyQuote = () => {
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyQuote();
  }, []);

  const fetchDailyQuote = async () => {
    try {
      const { data, error } = await supabase
        .from("noose_daily_quotes")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Sélectionner une citation aléatoire parmi les actives
        const randomIndex = Math.floor(Math.random() * data.length);
        setQuote(data[randomIndex]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la citation:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-noose-accent/20 shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Chargement de la citation du jour...</div>
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <Card className="border-noose-accent/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-noose-accent/10 to-noose-blue/10">
        <CardTitle className="flex items-center gap-2 text-noose-accent">
          <Quote className="w-6 h-6" />
          Citation du Jour
          <Calendar className="w-5 h-5 ml-auto" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <blockquote className="text-lg italic text-noose-blue font-medium mb-4 relative">
          <Quote className="w-8 h-8 text-noose-accent/30 absolute -top-2 -left-2" />
          <span className="relative z-10 pl-6">
            "{quote.content}"
          </span>
        </blockquote>
        <div className="text-right">
          <cite className="text-sm text-muted-foreground not-italic">
            — {quote.author}
          </cite>
        </div>
      </CardContent>
    </Card>
  );
};