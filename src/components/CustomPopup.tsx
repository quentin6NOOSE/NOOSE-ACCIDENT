import { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface CustomPopup {
  id: string;
  title: string;
  image_url: string;
  redirect_url: string | null;
  is_active: boolean;
  display_order: number;
}

export const CustomPopup = () => {
  const [popup, setPopup] = useState<CustomPopup | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePopup();
  }, []);

  const fetchActivePopup = async () => {
    try {
      const { data, error } = await supabase
        .from("noose_custom_popups")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setPopup(data[0]);
        // Afficher le popup après un court délai
        setTimeout(() => setIsVisible(true), 1000);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du popup:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleImageClick = () => {
    if (popup?.redirect_url) {
      window.open(popup.redirect_url, '_blank');
    }
    handleClose();
  };

  if (loading || !popup || !isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="max-w-md w-full mx-4 border-noose-blue/20 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-noose-blue/10 to-noose-accent/10 relative">
          <CardTitle className="flex items-center gap-2 text-noose-blue pr-8">
            {popup.title}
          </CardTitle>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div 
            className={`relative overflow-hidden rounded-lg ${popup.redirect_url ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
            onClick={popup.redirect_url ? handleImageClick : undefined}
          >
            <img
              src={popup.image_url}
              alt={popup.title}
              className="w-full h-auto object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=400";
              }}
            />
            {popup.redirect_url && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                <ExternalLink className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            {popup.redirect_url && (
              <Button 
                onClick={handleImageClick}
                variant="military"
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir Plus
              </Button>
            )}
            <Button 
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};