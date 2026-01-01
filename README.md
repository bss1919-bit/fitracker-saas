# FitTracker Coach (SaaS)

**FitTracker Coach** est la plateforme Web "Local-First" destinée aux entraîneurs professionnels. Elle leur permet de gérer leurs athlètes, créer des programmes d'entraînement avancés et suivre la progression en temps réel.

Ce projet est conçu pour fonctionner en parfaite autonomie (Local Development) via Docker, sans dépendance critique à des services Cloud payants pour le développement.

---

## 📚 Documentation

Toute la documentation projet est située dans le dossier [`docs/saas`](./docs/saas) :

*   [**Vision & Cahier des Charges**](./docs/saas/CAHIER_DES_CHARGES.md) : Vision produit et fonctionnalités.
*   [**Analyse Fonctionnelle**](./docs/saas/ANALYSE_FONCTIONNELLE.md) : Détail des cas d'usage et règles métier.
*   [**Spécifications Techniques**](./docs/saas/SPECIFICATIONS_TECHNIQUES.md) : Architecture, Stack et Schéma BDD.
*   [**Plan d'Implémentation**](./docs/saas/PLAN_IMPLEMENTATION.md) : Roadmap de développement.

---

## 🛠 Stack Technique (Zero-Cost / Open Source)

Cette stack est choisie pour sa robustesse, sa performance et son absence de lock-in financier.

*   **Frontend / App** : [Next.js 14](https://nextjs.org/) (App Router, TypeScript).
*   **UI System** : [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/).
*   **Backend & DB** : [Supabase](https://supabase.com/) (Hébergé localement via Docker).
    *   PostgreSQL 16 (Base de données relationnelle + JSONB).
    *   Supabase Auth (Authentification).
    *   Supabase Storage (Stockage fichiers).
*   **Internationalisation** : `next-intl` (FR, EN, AR + Support RTL).
*   **Devops** : Docker & Supabase CLI.

---

## 🚀 Démarrage Rapide (Local)

### Pré-requis
*   [Node.js 18+](https://nodejs.org/)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) ou [OrbStack](https://orbstack.dev/) (Recommandé sur Mac pour la performance).
*   [Supabase CLI](https://supabase.com/docs/guides/cli) : `brew install supabase/tap/supabase`

### Installation

1.  **Initialiser l'environnement** :
    ```bash
    npm install
    ```

2.  **Démarrer le Backend (Docker)** :
    ```bash
    npx supabase start
    ```
    *Ceci va télécharger et lancer les conteneurs PostgreSQL, Auth, etc.*

3.  **Lancer le Frontend** :
    ```bash
    npm run dev
    ```
    Accéder à l'application sur `http://localhost:3000`.

---

## 🏗 Architecture du Projet

```mermaid
graph TD
    A[SaaS Web (Next.js)] -- API Read/Write --> B[Supabase Local (Docker)]
    B -- Auth, DB, Realtime --> A
    C[Mobile App (FitTracker Pro)] -- Sync (JSON) --> B
```
