# Plan d'Implémentation - FitTracker Coach (SaaS)

Ce document définit la feuille de route séquentielle pour le développement du SaaS. Il est structuré pour minimiser les blocages (chemin critique) et prioriser les fonctionnalités "Core" nécessaires à une beta rapide.

---

## Phase 0 : Initialisation & Infrastructure (S0)
*Objectif : Avoir un socle technique robuste, déployé et sécurisé.*

### 0.1. Setup Projet & CI/CD
- [x] **Init Monorepo/Repo** : Créer le projet Next.js 14 (App Router) avec TypeScript, ESLint, Prettier.
- [x] **UI Framework** : Installer Tailwind CSS, Shadcn/UI, Lucide React.
- [x] **Internationalisation (i18n)** : Mettre en place `next-intl` et la structure des dossiers `[locale]`. Configurer le support RTL.
- [x] **Docker Environment** : Vérifier l'installation de Docker Desktop/Orbstack.

### 0.2. Backend (Supabase Local)
- [x] **Supabase CLI** : Init du projet (`supabase init`).
- [x] **Local Start** : Démarrage de la stack locale (`supabase start`). Cela lance Postgres, Auth, et Studio UI sur Docker.
- [x] **Schema Migration** : Écrire et appliquer les migrations SQL locales.
- [x] **Type Generation** : Génération des types depuis la DB locale.

---

## Phase 1 : Identité & Gestion Coach (S1)
*Objectif : Permettre aux coachs de s'inscrire et d'accéder à l'interface.*

### 1.1. Authentification
- [ ] **Auth Pages** : Login, Register, Forgot Password (Design "Midnight Control").
- [ ] **Supabase Auth** : Intégration du flow Email/Password et Google OAuth.
- [ ] **Middleware** : Protection des routes `/dashboard` (redirection si non authentifié).

### 1.2. Onboarding & Profil
- [ ] **Wizard Onboarding** : Formulaire multi-étapes (Nom entreprise, Logo, Spécialités).
- [ ] **Settings** : Page de gestion du profil coach et préférences (Langue, Unités).
- [ ] **Storage** : Upload du logo entreprise via Supabase Storage.

---

## Phase 2 : Le système de Linkage ("The Bridge") (S2-S3)
*Objectif : Connecter un Coach à un Athlète (Flow Critique).*

### 2.1. Gestion Clients (CRUD)
- [ ] **Liste Clients** : Table de données (Shadcn Table) avec filtres, tri et recherche.
- [ ] **Fiche Client Shell** : Layout de la page détail client (Onglets: Résumé, Programme, Historique).
- [ ] **Ajout Manuel** : Formulaire de création de client "Ghost" (Non lié).

### 2.2. QR Code & Invitations
- [ ] **Générateur QR** : Composant affichant le QR Code "Pro" du coach (contenant son ID).
- [ ] **Magic Link** : Logique de génération de lien d'invitation unique.
- [ ] **Page Landing Invitation** : Page publique `fittracker.pro/join/[id]` qui redirige vers l'app mobile.

---

## Phase 3 : Administration SaaS (Super Admin) (S4)
*Objectif : Piloter la plateforme et gérer les utilisateurs (Coachs).*

### 3.1. Back-Office Admin
- [ ] **Admin Auth** : Login spécifique ou détection de rôle (table `admins`).
- [ ] **Admin Layout** : Interface distincte pour l'administration (Navigation latérale différente).

### 3.2. Gestion des Coachs
- [ ] **Coach List** : Table maîtresse des coachs inscrits (Email, Statut, Offre).
- [ ] **Actions Admin** : Boutons pour Suspendre/Bannir/Valider un coach.
- [ ] **Impersonation** : Fonctionnalité "Log in as Coach" pour le support.

---

## Phase 4 : Moteur de Synchronisation (S5-S6)
*Objectif : Recevoir et stocker les données de l'app mobile.*

### 4.1. API de Synchronisation (Relay)
- [ ] **Endpoint `POST /api/sync`** : Route sécurisée recevant les payloads JSON de l'app mobile.
- [ ] **Validation Zod** : Vérification stricte du format des données entrantes.
- [ ] **Logic Upsert** : Insérer ou mettre à jour les données dans la table `synced_data` (gestion des doublons).

### 4.2. Sécurité des Données
- [ ] **RLS Implementation** : Activation et test des Row Level Security policies. Vérifier qu'un coach ne voit QUE ses clients.

---

## Phase 5 : Program Builder (S7-S8)
*Objectif : Créer de la valeur pour le coach (Outil de travail).*

### 5.1. Bibliothèque Exercices
- [ ] **Exercise Browser** : Explorateur d'exercices avec recherche et filtres (Muscle, Matériel).
- [ ] **Custom Exercises** : Formulaire de création d'exercice privé + Upload Vidéo.

### 5.2. Workout Editor (Le gros morceau)
- [ ] **DnD Interface** : Implémentation de `@hello-pangea/dnd` ou `dnd-kit` pour construire la structure.
- [ ] **Composant Set/Rep** : Interface dense pour saisir les targets (Kg, Reps, RPE).
- [ ] **Superset Logic** : Logique UI pour grouper visuellement A1/A2.

### 5.3. Assignation
- [ ] **Assign Modal** : Sélectionner un client et une date de début.
- [ ] **Sync Down** : Mécanisme pour rendre ce programme disponible à l'API de sync (que l'app mobile viendra -pull-).

---

## Phase 6 : Dashboard & Visualisation (S9)
*Objectif : Donner des super-pouvoirs de vision.*

### 6.1. Client Analytics
- [ ] **Chart Components** : Intégration de `Recharts`.
- [ ] **Volume & 1RM** : Graphs d'évolution basés sur les données de `synced_data`.
- [ ] **Heatmap UI** : Reproduction du composant Heatmap Musculaire (SVG interactif).

### 6.2. Dashboard Home
- [ ] **Activity Feed** : Liste chronologique des événements récents ("X a fini sa séance").
- [ ] **KPI Cards** : Widgets simples (Clients actifs, Séances cette semaine).

---

## Phase 7 : Polish & Launch (S10)
*Objectif : Robustesse et UX.*

- [ ] **Testing E2E** : Scénarios critiques avec Playwright.
- [ ] **Performance Tuning** : Analyse des bundles, optimisation des images.
- [ ] **Mobile Responsive** : Vérifier que le SaaS est utilisable sur tablette/mobile (pour le scan QR notamment).
- [ ] **Beta Launch** : Déploiement Production.
