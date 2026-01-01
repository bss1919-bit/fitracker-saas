# Spécifications Techniques - FitTracker Coach (SaaS)

Ce document définit l'architecture technique, la stack technologique et le modèle de données du SaaS **FitTracker Coach**. Il garantit la performance, la sécurité et la compatibilité avec l'écosystème "Local-First" de l'application mobile.

---

## 1. Philosophie & Contraintes

1.  **Architecture Hybride (Local-First + Cloud)** : Le SaaS agit comme un "miroir" et un centre de commande pour des appareils mobiles qui fonctionnent hors ligne.
2.  **Performance "Blink-of-an-eye"** : Le temps global de réponse des interactions UI doit être < 100ms.
3.  **Scalabilité Verticale & Horizontale** : Capacité à gérer des milliers de coachs et des centaines de milliers de points de données "time-series" (logs d'entraînement).
4.  **Isolation (Multi-Tenancy)** : Chaque coach est un "tenant" logique. Ses données et celles de ses clients sont strictement isolées.

---

## 2. Architecture Globale

L'architecture repose sur le modèle **T3 Stack (Turbo Enhanced)** hébergé sur le Edge pour une latence minimale.

### 2.1. Vue d'ensemble
*   **Frontend (Client)** : Next.js 14+ (App Router, React Server Components).
*   **Backend (API & Edge)** : Next.js API Routes + Supabase Edge Functions.
*   **Database (Core)** : PostgreSQL (Supabase) avec extensions Time-Series.
*   **Sync Engine (Le pont Mobile/Web)** : Protocole de synchronisation différentielle (CRDT-like simplifié).

### 2.2. Diagramme de Flux (Sync)
```mermaid
graph TD
    A[App Mobile (LocalFirst)] -- Sync (JSON Diff) --> B[Edge API (Relay)]
    B -- Write --> C[(PostgreSQL Master)]
    C -- Realtime Subs --> D[SaaS Dashboard (Coach)]
    D -- Action (Add Program) --> C
    C -- Realtime Subs --> A
```

---

## 3. Stack Technologique Détaillée

### 3.1. Frontend (SaaS Web)
*   **Framework** : **Next.js 14** (TypeScript Strict).
*   **Rendering** : SSR (Server Side Rendering) pour le SEO (Landing) + CSR (Client Side) pour le Dashboard complexe.
*   **State Management** : **Zustand** (Gestion état global) + **TanStack Query** (Gestion état serveur/cache & revalidations).
*   **UI System** :
    *   Styling : **Tailwind CSS v3.4** (Zero-runtime).
    *   Components : **Shadcn/UI** (Primitifs Radix UI accessibles).
    *   Animations : **Framer Motion** (Interactions fluides).
*   **Internationalisation (i18n)** :
    *   Lib : **next-intl**.
    *   RTL Support : Configuration `dir="rtl"` automatique via Tailwind (`rtl:` modifiers).

### 3.2. Backend & Infrastructure
*   **Production Target** : **Vercel** + **Supabase Cloud** (Future).
*   **Development Environment (Local)** : **Docker** via **Supabase CLI**.
    *   Permet d'exécuter toute la stack (Postgres, Auth, Storage, Edge Functions) en local sans dépendance externe.
    *   Compatible 100% avec le futur déploiement cloud.
*   **Auth** : **Supabase Auth** (Instance Locale).
*   **Database** : **PostgreSQL 16** (Instance Locale Docker).
    *   *Pourquoi ?* Robustesse JSONB et RLS, identique à la prod.
*   **Storage** : **Supabase Storage** (Emulé Localement).

### 3.3. Performance & Optimisations
*   **Edge Caching** : Mise en cache des assets et des requêtes "lecture seule" sur le CDN Vercel.
*   **Optimistic UI** : Mise à jour immédiate de l'interface avant la réponse serveur (ex: cocher une tâche).
*   **Bundle Analysis** : Monitoring strict de la taille JS (< 150kb First Load).

---

## 4. Sécurité & Fiabilité

### 4.1. Sécurité des Données
*   **Row Level Security (RLS)** :
    *   Politiques Postgres natives.
    *   Règle stricte : `SELECT * FROM clients WHERE coach_id = auth.uid()`.
    *   Empêche mathématiquement un coach de voir les données d'un autre.
*   **Validation des Entrées** : **Zod** sur toutes les API Routes et Server Actions.
*   **Protection CSRF/XSS** : Headers sécurisés par défaut via Next.js.
*   **Chiffrement** :
    *   En transit : TLS 1.3.
    *   Au repos : AES-256 (Géré par Supabase).

### 4.2. Fiabilité & Monitoring
*   **Error Tracking (Local)** :
    *   Gestionnaire d'erreurs global (React Error Boundary).
    *   Logs serveur : `console.error` structurés (Redirigeables vers fichiers locaux).
    *   *Pas de service externe type Sentry pour le MVP sans frais.*
*   **Backups** :
    *   Dumper la DB locale périodiquement : `supabase db dump`.
    *   Les données sont persistées sur le disque local via les volumes Docker.

---

## 5. Modèle de Données (Schema Database)

Le schéma est conçu pour étendre le modèle `Dexie.js` de l'app mobile (vu dans `docs/app/db/db.ts`) vers un modèle relationnel robuste.

### 5.1. Conventions
*   **IDs** : UUID v4 partout (compatible avec la génération offline coté mobile).
*   **Timestamps** : `created_at` (UTC), `updated_at` (UTC) sur toutes les tables.

### 5.2. Schéma Relationnel

```sql
-- 1. USERS & COACHES
-- Extends Supabase auth.users
create table public.coaches (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  business_name text,
  subscription_tier text default 'free', -- 'free', 'pro', 'enterprise'
  settings jsonb default '{}', -- UI Preferences, Language
  created_at timestamptz default now()
);

-- 1.1 SUPER ADMINS
-- Liste blanche des administrateurs ayant accès au Back-Office global
create table public.admins (
  id uuid references auth.users not null primary key,
  email text not null,
  role text default 'super_admin', -- 'super_admin', 'support'
  created_at timestamptz default now()
);

-- 2. CLIENTS (Shadow Profiles)
-- Créé quand un coach ajoute un client ou scanne un QR
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references public.coaches not null,
  mobile_user_id uuid, -- Link to mobile app user specific UUID if connected
  first_name text not null,
  last_name text,
  email text,
  status text default 'active', -- 'active', 'archived', 'pending_invite'
  notes text,
  created_at timestamptz default now()
);

-- 3. SYNCED DATA (The Local-First Mirror)
-- Stores generic JSONB dumps from mobile app tables
-- This allows evolving the mobile schema without breaking the SaaS schema constantly
create table public.synced_data (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients not null,
  
  -- Type de donnée : 'workout_log', 'user_profile', 'program'
  data_type text not null, 
  
  -- ID de l'objet coté mobile (pour update/deduplication)
  mobile_object_id text not null,
  
  -- Le contenu brut (ex: ExecutedWorkout)
  payload jsonb not null, 
  
  -- Metadata extraite pour le requêtage rapide (Indexée)
  performed_at timestamptz, -- Pour les workouts
  tags text[], 
  
  updated_at timestamptz default now(),
  
  -- Contrainte d'unicité pour l'upsert
  unique(client_id, data_type, mobile_object_id)
);

-- 4. COACH LIBRARY (Exercices Privés)
create table public.coach_exercises (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references public.coaches not null,
  
  -- Multilingual support (JSONB: { 'fr': '...', 'en': '...' })
  name jsonb not null,
  instructions jsonb,
  
  video_url text, -- Supabase Storage URL
  category text, -- 'chest', 'back', etc.
  
  created_at timestamptz default now()
);

-- 5. PROGRAMS & ASSIGNMENTS
create table public.coach_programs (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references public.coaches not null,
  
  name jsonb not null,
  description jsonb,
  
  -- Structure complexe du programme (Weeks, Sessions, Supersets)
  -- Compatible avec l'interface 'Program' du mobile
  structure jsonb not null,
  
  is_template boolean default false,
  created_at timestamptz default now()
);

create table public.program_assignments (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.coach_programs not null,
  client_id uuid references public.clients not null,
  
  status text default 'active',
  start_date date,
  
  created_at timestamptz default now()
);
```

### 5.3. Stratégie d'Indexation (Performance Long Terme)
Pour garantir des requêtes rapides même avec 10M+ de logs :

1.  **Index Composite sur `synced_data`** :
    *   `CREATE INDEX idx_synced_client_type ON synced_data (client_id, data_type);`
    *   Permet de récupérer "Tous les workouts du client X" instantanément.
2.  **Index GIN sur `synced_data.payload`** :
    *   `CREATE INDEX idx_payload_gin ON synced_data USING gin (payload);`
    *   Permet de requêter à l'intérieur du JSON (ex: "Trouver tous les RPE > 9").
3.  **Partitionnement (Futur)** :
    *   Si la table dépasse 100GB, partitionnement par range de dates (`performed_at`).

---

## 6. Workflow de Développement & CI/CD

1.  **Repo** : Monorepo (si possible) ou Repo dédié `fittracker-saas`.
2.  **Linting & Quality** :
    *   ESLint + Prettier (Standard fitTracker).
    *   Husky (Git Hooks) : Empêche le commit si typecheck fails.
3.  **Testing** :
    *   Unit : **Vitest** (Logique métier, calculs stats).
    *   E2E : **Playwright** (Parcours critiques : Inscription, Création Programme).
4.  **Deployment** :
    *   **Preview Environments** : Une URL unique par Pull Request.
    *   **Production** : Deploy auto sur `main`.

---

Ce document sert de référence absolue pour les choix d'implémentation. Toute déviation doit être justifiée et mise à jour ici.
