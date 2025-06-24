-- Création de la table des villes
CREATE TABLE IF NOT EXISTS cities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des villes du Cameroun
INSERT INTO cities (name, country) VALUES 
    ('Douala', 'Cameroun'),
    ('Yaoundé', 'Cameroun'),
    ('Dschang', 'Cameroun');

-- Insertion des villes du Gabon
INSERT INTO cities (name, country) VALUES 
    ('Libreville', 'Gabon');

-- Ajout de la colonne available_cities à la table products si elle n'existe pas
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_cities UUID[] DEFAULT '{}';

-- Création d'un index pour optimiser les requêtes par pays
CREATE INDEX IF NOT EXISTS idx_cities_country ON cities(country);

-- Création d'un index pour optimiser les requêtes par ville dans les produits
CREATE INDEX IF NOT EXISTS idx_products_available_cities ON products USING GIN(available_cities); 