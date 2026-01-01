# Cahier des Charges - FitTracker Coach (SaaS)

## 1. Vision & Objectifs
**FitTracker Coach** est la plateforme SaaS destinée aux entraîneurs professionnels utilisant l'écosystème **FitTracker Pro**. Elle permet aux coachs de gérer leur clientèle, de concevoir des programmations complexes et de suivre la progression de leurs athlètes avec une précision chirurgicale.

**Mission** : "Donner aux coachs les super-pouvoirs de la donnée pour maximiser les résultats de leurs athlètes."
**Modèle** : Abonnement mensuel/annuel (SaaS) pour le coach. Gratuit pour le coaché (via l'app mobile).

---

## 2. Identité Visuelle & UX : "Midnight Control"
L'interface reprend l'ADN "Midnight Pulse" de l'application mobile mais adaptée à un usage Desktop/Tablette de productivité.

*   **Style** : Dense en information, mais clair. Tableaux de bord, graphiques, listes.
*   **Palette** : Identique à l'mobile (Dark Mode Deep Slate), avec des accents spécifiques pour l'admin (Cyan pour la Donnée, Violet pour les Programmes).
*   **Principes UX** :
    *   **Drag & Drop** : Pour la construction de programmes.
    *   **Data-Viz** : Visualisation immédiate des tendances (Volume, 1RM).
    *   **Keyboard First** : Raccourcis pour la navigation rapide entre clients.

---

## 3. Gestion des Clients & Onboarding (Core)

La relation Coach/Coaché est au cœur du système. Il existe trois méthodes pour établir cette connexion, répondant aux contraintes physiques et distancielles.

### 3.1. Méthodes de Connexion (Linkage)

#### Méthode 1 : Création Manuelle (Distanciel / Sans App immédiate)
*   **Action** : Le coach crée un profil client dans son dashboard.
*   **Données** : Nom, Prénom, Email (Optionnel), Notes initiales.
*   **État** : "Non lié". Le coach peut gérer le programme et les stats manuellement (saisie par le coach).
*   **Invitation** : Le coach peut envoyer un lien d'invitation par email pour que le client télécharge l'app et lie son compte plus tard.

#### Méthode 2 : Scan QR Coaché (Présentiel - Coach scanne)
*   **Scénario** : Le client a l'app FitTracker Pro. Il affiche son "QR Code Identité" (dans son profil).
*   **Action** : Le coach utilise le SaaS (via webcam ou companion wap/mobile responsive) pour scanner ce QR.
*   **Résultat** :
    *   Le compte utilisateur est immédiatement lié au compte du coach.
    *   **Sync Historique** : L'historique des séances du client est uploadé vers le cloud (Relay) et devient visible sur le SaaS du coach.

#### Méthode 3 : Scan QR Coach (Présentiel - Client scanne)
*   **Scénario** : Le coach affiche son "QR Code Pro" sur son écran SaaS ou son téléphone.
*   **Action** : Le client scanne ce code avec son app FitTracker Pro.
*   **Résultat** : Identique à la Méthode 2. Liaison immédiate et synchronisation de l'historique.

### 3.2. Synchronisation de Données (Hybrid Cloud)
L'app mobile étant "Local-First", la connexion avec un coach active un module de **Synchronisation Hybride**.

*   **Données Montantes (App -> SaaS)** :
    *   Historique des séances (`executedSessions`).
    *   Feedback de séance (RPE, Notes).
    *   État de forme (Heatmap snapshot).
    *   Mensurations (Poids, etc.).
*   **Données Descendantes (SaaS -> App)** :
    *   Nouveaux Programmes assignés.
    *   Notes du coach sur les séances passées.
    *   Ajustements de planning.

---

## 4. Spécifications Fonctionnelles

### 4.1. Dashboard Coach (Vue d'ensemble)
*   **Liste des Clients** :
    *   Tri : Par activité récente, par conformité (séances respectées), par alerte.
    *   Indicateurs rapides : "Dernière séance : hier", "Programme : Semaine 3/4".
    *   **Alertes** : "Séance manquée", "RPE trop élevé", "Douleur signalée".
*   **Vue Planning Global** : Vue calendaire de tous les clients (utile pour les coachs gérant des créneaux horaires, sinon vue simplifiée des "Séances du jour des clients").

### 4.2. Fiche Client (Client Detail)
*   **Onglet Progression** :
    *   Graphiques de volume, 1RM estimé sur les exos clés.
    *   Visualisation de la Heatmap du client (zones de fatigue).
*   **Onglet Programme** :
    *   Calendrier des séances prévues.
    *   Assignation de nouveaux programmes.
    *   Modification des variables (Charges, Reps) pour les séances futures.
*   **Onglet Historique** :
    *   Feed chronologique des séances terminées.
    *   Détail série par série (Poids, Reps, RPE).
    *   Possibilité pour le coach de commenter une séance.
*   **Onglet Infos** : Données biométriques, notes privées du coach.

### 4.3. Program Builder (L'Atelier)
Un éditeur puissant pour créer des templates réutilisables ou des plans sur-mesure.

*   **Structure** : Compatible 100% avec le modèle mobile (Supersets, Circuits, RPE, Notes).
*   **Bibliothèque d'Exercices** :
    *   Base globale FitTracker.
    *   **Custom Exercises** : Le coach peut créer ses exercices (Vidéos privées, Description).
*   **Fonctionnalités Avancées** :
    *   **Clonage** : Dupliquer une semaine ou un bloc complet.
    *   **Progression Auto** : Définir des règles (ex: "+2.5kg chaque semaine").
    *   **Templates** : Sauvegarder des "Blocs Hypertrophie" ou "Semaines de Deload" pour les réutiliser.

### 4.4. Gestion Business (Lite)
*   Génération de liens de paiement (Stripe integration optionnelle).
*   Gestion des statuts (Actif, Pause, Archivé).

---

## 5. Spécifications Techniques

### 5.1. Architecture
*   **Frontend** : Next.js (React) pour le SaaS Web.
*   **Backend** :
    *   **Auth** : Système de comptes Coach (Email/Pass).
    *   **Database (Relay)** : PostgreSQL (via Supabase ou équivalent).
    *   **Rôle** : Sert de tampon entre l'app Local-First et le SaaS.
        *   Quand un user est "coché", son app pousse les updates vers cette DB.
        *   Le SaaS lit directement depuis cette DB.

### 5.2. Sécurité & Privacy
*   **Données de Santé** : Conformité RGPD. Les données des clients ne sont accessibles qu'au coach lié.
*   **End-to-End Encryption** (Idéalement) : Les données critiques sont chiffrées, mais pour une v1, une sécurité standard HTTPS + Row Level Security (RLS) suffit.

### 5.3. Stack Recommandée
*   **Web Framework** : Next.js 14+ (App Router).
*   **UI Library** : Shadcn/ui + Tailwind CSS (Cohérence avec l'app mobile).
*   **Auth & DB** : Supabase (Parfait pour le RLS et le Realtime).
*   **QR Code** : `react-qr-code` (Génération) + `react-qr-reader` (Scan via webcam/mobile).

---

## 6. Modèle de Données (Extension SaaS)

```typescript
// Table Coach (SaaS Users)
interface CoachProfile {
  id: string;
  email: string;
  businessName: string;
  subscriptionStatus: 'active' | 'trial' | 'expired';
}

// Relation Coach <-> Client
interface CoachClientLink {
  id: string;
  coachId: string;
  clientId: string; // ID généré par l'app mobile (UUID)
  status: 'active' | 'pending' | 'archived';
  linkedAt: string;
  permissions: {
    canViewHistory: boolean;
    canEditProgram: boolean;
  };
}

// Copie Cloud des Données Clients (Relay)
// Ces tables sont des miroirs de l'IndexedDB locale du client
interface SyncedSession {
  id: string;
  clientId: string;
  date: string;
  data: JSON; // Contenu complet de la séance
  syncedAt: string;
}

interface SyncedProgram {
  id: string;
  clientId: string;
  coachId: string; // Créateur
  data: JSON; // Structure du programme
  isActive: boolean;
}
```

## 7. Roadmap SaaS

1.  **Phase 1 : Socle & Linkage**
    *   Auth Coach.
    *   Système de génération/scan QR Code.
    *   API de synchronisation (Relay) pour l'app mobile.
2.  **Phase 2 : Visualisation**
    *   Dashboard Coach.
    *   Vue Historique Client (Lecture seule).
3.  **Phase 3 : Édition & Assignation**
    *   Program Builder.
    *   Envoi de programmes vers l'app mobile.
4.  **Phase 4 : Business & Analytics**
    *   Gestion des abonnements clients.
    *   Analytiques avancées.
