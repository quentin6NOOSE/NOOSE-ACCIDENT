/*
  # Amélioration du système NOOSE - Citations et Popups

  1. Nouvelles Tables
    - `noose_daily_quotes`
      - `id` (uuid, primary key)
      - `content` (text, contenu de la citation)
      - `author` (text, auteur de la citation)
      - `date` (date, date de la citation)
      - `is_active` (boolean, citation active)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `noose_custom_popups`
      - `id` (uuid, primary key)
      - `title` (text, titre du popup)
      - `image_url` (text, URL de l'image)
      - `redirect_url` (text, URL de redirection)
      - `is_active` (boolean, popup actif)
      - `display_order` (integer, ordre d'affichage)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur toutes les nouvelles tables
    - Politiques pour permettre la lecture publique et l'écriture
*/

-- Table des citations du jour
CREATE TABLE IF NOT EXISTS noose_daily_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  author text DEFAULT 'NOOSE',
  date date DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des popups personnalisés
CREATE TABLE IF NOT EXISTS noose_custom_popups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  redirect_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE noose_daily_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE noose_custom_popups ENABLE ROW LEVEL SECURITY;

-- Politiques pour les citations
CREATE POLICY "Anyone can view quotes"
  ON noose_daily_quotes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create quotes"
  ON noose_daily_quotes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update quotes"
  ON noose_daily_quotes
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can delete quotes"
  ON noose_daily_quotes
  FOR DELETE
  TO public
  USING (true);

-- Politiques pour les popups
CREATE POLICY "Anyone can view popups"
  ON noose_custom_popups
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create popups"
  ON noose_custom_popups
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update popups"
  ON noose_custom_popups
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Anyone can delete popups"
  ON noose_custom_popups
  FOR DELETE
  TO public
  USING (true);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_quotes()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_popups()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_noose_daily_quotes_updated_at
  BEFORE UPDATE ON noose_daily_quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_quotes();

CREATE TRIGGER update_noose_custom_popups_updated_at
  BEFORE UPDATE ON noose_custom_popups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_popups();

-- Insérer quelques citations par défaut
INSERT INTO noose_daily_quotes (content, author) VALUES
('Ce collègue est un danger public.', 'Chef NOOSE'),
('Chaque jour sans incident est une victoire.', 'Manuel de Sécurité'),
('Sponsor officiel de la casse automobile.', 'Département Assurance'),
('Le budget annuel vient d''exploser.', 'Comptabilité NOOSE'),
('Catastrophe ambulante certifiée NOOSE.', 'Formation Continue'),
('Formation anti-accident requise d''urgence.', 'RH NOOSE'),
('Assurance responsabilité civile recommandée.', 'Service Juridique'),
('Un accident de plus, un record de moins.', 'Statistiques NOOSE'),
('La prudence n''est visiblement pas son fort.', 'Observateur NOOSE'),
('Nouveau record personnel établi aujourd''hui.', 'Palmarès NOOSE')
ON CONFLICT DO NOTHING;