# Spécifications : Zero Tracker

## 🛠 Stack
- Framework: Next.js (App Router)
- Style: Tailwind CSS + Shadcn/UI
- Backend: Supabase (Auth, DB, Storage)
- Charts: Recharts

## 🗄 Database (via MCP)
- **Table `entries`** :
  - `id`: uuid (pk)
  - `user_id`: uuid (fk auth.users)
  - `date`: date (default: now, unique per user)
  - `weight`: decimal
  - `calories`: int
  - `steps`: int
  - `workout_type`: enum ('Gym', 'Cardio', 'Repos', 'Gym + Cardio')
  - `photo_url`: text
  - `notes`: text
- **Storage** : Bucket public `progress-photos`.
- **Security** : RLS activé (User isolation).

## 📱 Features
- Auth complète (Login/Sign-up).
- Dashboard avec graphique de poids et moyennes (Calories/Steps).
- Bouton flottant "+" pour ajouter/modifier l'entrée du jour.
- Upload de photo intégré au formulaire.

## 🎨 Design
- Dark Mode : Fond Anthracite (#09090b).
- Accent : Vert Néon ou Bleu Électrique.
- Mobile-first uniquement.