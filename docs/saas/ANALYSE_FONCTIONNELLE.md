# Analyse Fonctionnelle Approfondie - FitTracker Coach (SaaS)

Cette analyse détaille l'ensemble des fonctionnalités du SaaS **FitTracker Coach**, en décomposant chaque module en cas d'utilisation, règles de gestion et interactions système. Elle vise à fournir une vision exhaustive pour le développement d'une solution professionnelle haut de gamme.

---

## 1. Acteurs du Système

1.  **Le Coach (Utilisateur Principal)** : Professionnel du fitness cherchant à optimiser le suivi de ses clients.
2.  **L'Athlète / Coaché (Utilisateur Final)** : Utilisateur de l'app mobile FitTracker Pro.
3.  **L'Administrateur SaaS (Super Admin)** : Gestionnaire technique et commercial de la plateforme.

---

## 2. Pré-requis Transverses & Internationalisation

### 2.1. Support Multilingue (i18n)
La plateforme SaaS doit être nativement multilingue pour s'adresser à un marché international.

*   **Langues Supportées** :
    *   **Français (FR)** : Langue par défaut pour le lancement.
    *   **Anglais (EN)** : Indispensable pour l'internationalisation.
    *   **Arabe (AR)** : Prise en compte spécifique (RTL - Right to Left).
*   **Gestion du RTL (Right-to-Left)** :
    *   L'interface doit s'inverser automatiquement (miroir) lorsque la langue Arabe est sélectionnée.
    *   Tout le layout (menus, tableaux, graphiques) doit être compatible RTL.
*   **Détection** :
    *   Auto-détection basée sur la langue du navigateur.
    *   Sélecteur de langue explicite dans le footer/header.

### 2.2. Rôles & Permissions (RBAC)
Le système doit distinguer strictement :
*   **Rôle Coach** : Accès à ses données et ses clients uniquement.
*   **Rôle Admin** : Accès au Back-Office d'administration (vison globale).

---

## 3. Module : Administration SaaS (Super Admin)

Ce module est invisible pour les coachs et réservé aux gestionnaires de la plateforme.

### 3.1. Gestion des Utilisateurs (Coaches)
*   **Vue Liste** : Voir tous les coachs inscrits, leurs statuts (Actif/Suspendu), leur plan (Free/Pro).
*   **Actions** :
    *   **Impersonation (Se connecter en tant que)** : Permet à l'admin de voir le dashboard d'un coach pour le support client.
    *   **Ban/Suspend** : Bloquer l'accès en cas d'abus.
    *   **Upgrade manuel** : Offrir un accès Pro manuellement.

### 3.2. Analytics Globoaux
*   **KPIs Plateforme** :
    *   Nombre total de coachs / athlètes.
    *   Volume total de séances synchronisées.
    *   Taux de conversion Free -> Pro.

### 3.3. Gestion de la Bibliothèque Globale
*   **Curations d'Exercices** : Ajouter/Modifier les exercices de la base publique (disponibles pour tous les coachs).
*   **Validation** : (Futur) Valider les exercices proposés par la communauté.

---

## 4. Module : Acquisition & Gestion de Compte Coach (SaaS Core)

Ce module gère le cycle de vie du coach sur la plateforme, de son inscription à la gestion de son abonnement.

### 4.1. Inscription & Onboarding Coach
*   **Fonctionnalité** : Création de compte sécurisée.
*   **Flux** :
    1.  Saisie Email + Mot de passe (ou Google Auth).
    2.  Validation de l'email.
    3.  **Configuration du Profil Pro** :
        *   Nom commercial / Marque.
        *   Logo (Upload).
        *   Spécialités (Bodybuilding, Powerlifting, Crossfit, Perte de poids).
        *   Bio courte (sera visible par le coaché lors de la connexion).
    4.  **Choix de l'Offre** :
        *   *Freemium* (ex: max 2 clients).
        *   *Pro* (Clients illimités, Branding).
    5.  **Paiement (Module Mock)** :
        *   Simulation du paiement en local (Pas de dépendance Stripe pour le MVP).
        *   Le système active l'abonnement "Pro" immédiatement après validation fictive.

### 4.2. Tableau de Bord Personnel (Coach Home)
*   **KPIs Business** :
    *   Nombre de clients actifs.
    *   Taux de rétention (Churn).
    *   Revenus générés (si module facturation activé).
*   **Gestion de l'Abonnement** :
    *   Upgrade/Downgrade de plan.
    *   Accès aux factures du SaaS.

---

## 5. Module : Gestion de la Relation Coach/Coaché (CRM)

Le cœur du système : comment le coach interagit avec sa base de clients.

### 5.1. Linkage (Connexion) - Analyse Détaillée
Les 3 méthodes identifiées dans le CDC sont décomposées ici.

#### A. Linkage via Scan (Présentiel)
*   **Cas 1 : Coach scanne Athlète**
    *   *Pré-condition* : Athlète a un compte FitTracker Pro.
    *   *Action* : Coach clique "Nouveau Client" -> "Scanner QR". Webcam s'active. Athlète montre son QR personnel.
    *   *Système* : Décodage UUID Athlète -> Création lien `CoachClientLink` -> Activation Sync.
*   **Cas 2 : Athlète scanne Coach**
    *   *Pré-condition* : Coach affiche son "QR Carte de Visite" (sur son écran ou imprimé).
    *   *Action* : Athlète scanne -> Demande de confirmation sur l'app mobile "Rejoindre la Team [Nom Coach] ?".
    *   *Système* : Notification temps réel sur le SaaS du coach "Nouvelle demande de connexion" -> Validation manuelle ou auto.

#### B. Linkage Distanciel (Invitation)
*   **Flux** :
    1.  Coach saisit l'email du prospect.
    2.  Système génère un "Magic Link" unique (ex: `fittracker.pro/join/coach-id`).
    3.  Athlète clique :
        *   Si app installée : Deep link ouvre l'app et propose la connexion.
        *   Si app pas installée : Redirection Store -> Install -> Connexion différée au premier lancement.

### 5.2. Dossier Athlète (Digital Twin)
Pour chaque client, le coach dispose d'une vue omnisciente.

*   **Header** : Photo, Age, Poids, Objectif principal, Blessures déclarées (Tag Rouge).
*   **Timeline d'Activité** :
    *   Vue calendaire des séances passées et futures.
    *   Code couleur : Vert (Fait), Gris (Prévu), Rouge (Manqué), Orange (Partiel).
*   **Métriques de Santé (Synchronisées)** :
    *   Progression Poids de corps.
    *   Taux de masse grasse (si saisi).
    *   Qualité du sommeil / Stress (si saisi dans l'app).

### 5.3. Groupes & Segmentation
*   **Création de Teams** : Possibilité de grouper les clients (ex: "Groupe Powerlifting", "Challenge Été").
*   **Assignation de Masse** : Envoyer un programme à tout un groupe en 1 clic.

---

## 6. Module : Ingénierie de l'Entraînement (Program Builder)

L'outil de travail principal du coach. Il doit être plus puissant que l'éditeur mobile.

### 6.1. Bibliothèque d'Exercices (Coach Library)
*   **Catalogue Global** : Accès aux 1000+ exos de base FitTracker.
*   **Catalogue Privé (Asset Stratégique)** :
    *   Le coach peut créer ses propres exercices.
    *   **Upload Vidéo** : Hébergement de vidéos d'exécution privées (ex: "Ma variante de Curl").
    *   **Instructions** : Texte riche pour expliquer le tempo, le placement.
    *   *Note* : Ces exos privés ne sont visibles QUE par les clients de ce coach.

### 6.2. Constructeur de Séances (Workout Builder)
*   **Interface** : Drag & Drop. Colonne de gauche (Liste Exos), Colonne de droite (Structure Séance).
*   **Fonctions Avancées** :
    *   **Supersets / Giant Sets** : Glisser un exo sur un autre pour créer un lien visuel.
    *   **Variables de Prescription** :
        *   Sets, Reps, Poids (Absolu ou %1RM).
        *   RPE / RIR (Target).
        *   Tempo (ex: 3-0-1-0).
        *   Repos (entre sets et entre exos).
    *   **Notes Contextuelles** : "Attention à tes lombaires ici".

### 6.3. Gestion de la Périodisation (Macrocycle)
*   **Planification** :
    *   Création de "Blocs" (Mesocycles) de X semaines.
    *   **Phase Deload** : Option pour insérer automatiquement une semaine de décharge (réduction volume/intensité).
    *   **Progression Programmée** :
        *   Règle : "Augmenter charge de 2.5kg chaque semaine sur les composés".
        *   Le système génère automatiquement les valeurs pour les semaines S+1, S+2, etc.

---

## 7. Module : Suivi de Performance & Analytics

Comment le coach prouve sa valeur et ajuste le tir.

### 7.1. Dashboard de Supervision (The Watchtower)
*   **Flux d'Activité en Direct** : "Julien vient de terminer Leg Day (PR Squat!)".
*   **Alertes Intelligentes** :
    *   *Stagnation* : "Aucune progression sur le Bench Press depuis 3 semaines".
    *   *Surcharge* : "Volume total a augmenté de >20% soudainement (Risque blessure)".
    *   *Assiduité* : "Client inactif depuis 7 jours".

### 7.2. Analyse Approfondie (Deep Dive)
*   **Comparaison** : Superposer les courbes de 2 exercices (ex: Squat vs Deadlift).
*   **Analyse Vidéo (Feedback)** :
    *   Le client peut uploader une vidéo de son set (via l'app).
    *   Le coach peut visionner, annoter (dessiner des angles/traits sur la vidéo) et renvoyer un feedback vocal ou écrit. *(Feature Premium)*.

### 7.3. Rapports de Progrès
*   Génération automatique de PDF "Bilan Mensuel" pour le client (courbes, PRs battus, photos avant/après).

---

## 8. Module : Communication & Feedback

Remplacer WhatsApp/Email par un canal centralisé et contextuel.

### 8.1. Chat Intégré
*   Fil de discussion par client.
*   Support des pièces jointes (Vidéos, Photos).
*   **Contexte Automatique** : Si le client écrit depuis une séance, le coach voit "Message envoyé depuis : Séance Push A".

### 8.2. Feedback Séance (Check-in)
*   Après chaque séance, le client remplit un mini-formulaire (Configurable par le coach) :
    *   Difficulté perçue (RPE Séance).
    *   Niveau d'énergie.
    *   Douleurs éventuelles.
*   Le coach visualise ces feedbacks sous forme de tableau thermique (Heatmap "Humeur").

---

## 9. Architecture des Données & Flux

### 9.1. Synchronisation Bidirectionnelle
*   **Coach -> App** :
    *   Le coach modifie un programme -> Notification Push sur l'app -> Mise à jour locale (IndexedDB) à la prochaine connexion.
*   **App -> Coach** :
    *   Fin de séance -> Upload JSON (si réseau) ou Queue (si offline) -> Parsing serveur -> Update Dashboard Coach.

### 9.2. Sécurité & Privacy
*   **Cloisonnement** : Un coach ne voit JAMAIS les données d'un athlète s'il n'est pas lié.
*   **Droit à l'oubli** : Si un athlète rompt le lien, le coach perd l'accès à l'historique futur (garde l'archive passée selon CGU).

---

## 10. Résumé des Fonctionnalités Clés (MVP vs V2)

| Fonctionnalité | Priorité MVP | Priorité V2 |
| :--- | :---: | :---: |
| Auth & Profil Coach | ✅ | |
| Linkage QR Code | ✅ | |
| Bibliothèque Exos Standard | ✅ | |
| Bibliothèque Exos Coach (Privé) | ❌ | ✅ |
| Program Builder (Basique) | ✅ | |
| Program Builder (Supersets/RPE) | ✅ | |
| Dashboard Progrès Basique | ✅ | |
| Chat Intégré | ❌ | ✅ |
| Analyse Vidéo | ❌ | ✅ |
| Paiement (Simulation) | ❌ | ✅ |
| Rapports PDF | ❌ | ✅ |

Cette analyse constitue la feuille de route fonctionnelle pour l'équipe de développement.
