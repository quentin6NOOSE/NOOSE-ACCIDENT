/*
  # Système de gestion des agents multiples

  1. Nouvelles Tables
    - `noose_agents`
      - `id` (uuid, primary key)
      - `name` (text, nom de l'agent)
      - `agent_number` (integer, identifiant unique auto-incrémenté)
      - `total_accidents` (integer, nombre total d'accidents)
      - `total_cost` (numeric, coût total des accidents)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Modifications
    - Ajout de `agent_id` à la table `noose_accidents`
    - Mise à jour des triggers pour calculer automatiquement les totaux

  3. Sécurité
    - Enable RLS sur `noose_agents`
    - Politiques pour permettre la lecture et l'écriture publique
*/

-- Créer la table des agents
CREATE TABLE IF NOT EXISTS noose_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  agent_number serial UNIQUE,
  total_accidents integer DEFAULT 0,
  total_cost numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ajouter RLS
ALTER TABLE noose_agents ENABLE ROW LEVEL SECURITY;

-- Politiques pour les agents
CREATE POLICY "Anyone can view agents"
  ON noose_agents
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create agents"
  ON noose_agents
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update agents"
  ON noose_agents
  FOR UPDATE
  TO public
  USING (true);

-- Ajouter la colonne agent_id à la table des accidents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'noose_accidents' AND column_name = 'agent_id'
  ) THEN
    ALTER TABLE noose_accidents ADD COLUMN agent_id uuid REFERENCES noose_agents(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Fonction pour mettre à jour les totaux des agents
CREATE OR REPLACE FUNCTION update_agent_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est un INSERT ou UPDATE avec agent_id
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.agent_id IS NOT NULL THEN
    UPDATE noose_agents 
    SET 
      total_accidents = (
        SELECT COUNT(*) 
        FROM noose_accidents 
        WHERE agent_id = NEW.agent_id
      ),
      total_cost = (
        SELECT COALESCE(SUM(cost), 0) 
        FROM noose_accidents 
        WHERE agent_id = NEW.agent_id
      ),
      updated_at = now()
    WHERE id = NEW.agent_id;
  END IF;

  -- Si c'est un UPDATE et l'ancien agent_id était différent
  IF TG_OP = 'UPDATE' AND OLD.agent_id IS NOT NULL AND OLD.agent_id != COALESCE(NEW.agent_id, uuid_nil()) THEN
    UPDATE noose_agents 
    SET 
      total_accidents = (
        SELECT COUNT(*) 
        FROM noose_accidents 
        WHERE agent_id = OLD.agent_id
      ),
      total_cost = (
        SELECT COALESCE(SUM(cost), 0) 
        FROM noose_accidents 
        WHERE agent_id = OLD.agent_id
      ),
      updated_at = now()
    WHERE id = OLD.agent_id;
  END IF;

  -- Si c'est un DELETE
  IF TG_OP = 'DELETE' AND OLD.agent_id IS NOT NULL THEN
    UPDATE noose_agents 
    SET 
      total_accidents = (
        SELECT COUNT(*) 
        FROM noose_accidents 
        WHERE agent_id = OLD.agent_id
      ),
      total_cost = (
        SELECT COALESCE(SUM(cost), 0) 
        FROM noose_accidents 
        WHERE agent_id = OLD.agent_id
      ),
      updated_at = now()
    WHERE id = OLD.agent_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS update_agent_totals_trigger ON noose_accidents;
CREATE TRIGGER update_agent_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON noose_accidents
  FOR EACH ROW EXECUTE FUNCTION update_agent_totals();

-- Trigger pour updated_at sur noose_agents
CREATE OR REPLACE FUNCTION update_updated_at_agents()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_noose_agents_updated_at ON noose_agents;
CREATE TRIGGER update_noose_agents_updated_at
  BEFORE UPDATE ON noose_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_agents();