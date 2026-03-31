# Prompt : Développement de "Zero Tracker" (Sèche App)

## 🎯 Vision du Projet
Développer une Progressive Web App (PWA) nommée **"Zero Tracker"** pour le suivi quotidien d'une sèche. L'application doit être mobile-first, ultra-rapide, et permettre l'ajout de données en 3clics.

## 🛠 Stack Technique
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Shadcn/UI
- **Backend/Auth:** Supabase (Utilise ton accès MCP pour la configuration)
- **Icons:** Lucide React
- **Charts:** Recharts (ou Tremor)
- **Deployment:** Vercel

## 🗄 Configuration Database (via MCP Supabase)
Merci de configurer directement les éléments suivants sur mon instance Supabase :

1.  **Table `entries` :**
    - `id`: uuid (primary key)
    - `user_id`: uuid (references auth.users)
    - `date`: date (default: now, unique par utilisateur)
    - `weight`: decimal (ex: 52.5)
    - `calories`: integer
    - `steps`: integer
    - `workout_type`: text (Options: 'Gym', 'Cardio', 'Repos', 'Gym + Cardio')
    - `photo_url`: text (URL de l'image stockée)
    - `notes`: text
2.  **Storage:** Créer un bucket public nommé `progress-photos`.
3.  **Security:** Activer Row Level Security (RLS) pour que chaque utilisateur ne puisse lire/écrire que ses propres lignes.

## 📱 Fonctionnalités à développer
1.  **Auth Flow :** Page de login/inscription simple avec Supabase Auth.
2.  **Dashboard (Home) :**
    - Résumé des 7 derniers jours (Moyenne de poids, moyenne de pas).
    - Un bouton flottant "+" (FAB) en bas à droite pour ajouter l'entrée du jour.
    - Un graphique linéaire affichant l'évolution du poids.
3.  **Formulaire d'entrée :**
    - Input numérique pour Poids, Calories, Pas.
    - Select pour le type de séance (Gym, Cardio, Repos, Gym + Cardio).
    - Champ de téléchargement d'image (upload direct vers Supabase Storage).
    - Gestion de l'édition : si une entrée existe déjà pour "Aujourd'hui", le formulaire charge les données existantes pour modification.
4.  **Historique :** Une vue liste pour consulter et modifier les entrées passées.

## 🎨 Design & UX
- **Nom de l'App :** Zero Tracker
- **Thème :** Dark Mode par défaut. Couleurs : Fond Noir/Anthracite (#09090b), accents en Vert Néon ou Bleu Électrique.
- **UX :** Feedback visuel lors de l'enregistrement (Toast notifications). L'interface doit ressembler à une application native une fois ajoutée à l'écran d'accueil.

## 🚀 Instructions de Livraison
1. Génère le code complet des composants et des pages.
2. Fournis les instructions pour le fichier `.env.local`.
3. Prépare le projet pour un déploiement "One-click" sur Vercel.