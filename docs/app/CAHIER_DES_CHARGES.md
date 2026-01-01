# Cahier des Charges - FitTracker Pro v2

## 1. Vision & Objectifs
**FitTracker Pro v2** se positionne comme l'alternative définitive aux applications de fitness par abonnement. Elle cible les pratiquants intermédiaires et avancés ("Gym Rats") qui cherchent un outil puissant, sans friction, et respectueux de leurs données.

**Promesse** : "L'app qui connaît votre corps mieux que vous."
**Modèle** : Achat unique (Lifetime), Local-First (Pas de cloud obligatoire).

---

## 2. Identité Visuelle & UX : "Midnight Pulse"
L'identité visuelle est un pilier central de l'expérience utilisateur.

*   **Style** : "Midnight Pulse". Sombre, Minimaliste, Premium.
*   **Palette** :
    *   Fond : Deep Slate / Noir (`#0f172a` / `#000000`).
    *   Texte : Blanc pur (Titres) et Gris Acier (Détails).
    *   Accent Principal : Indigo Électrique (`#6366f1`).
    *   Indicateurs État : Vert (Frais), Rouge (Fatigué), Orange (Attention).
*   **Principes UX** :
    *   **Zéro Bruit** : Pas de dégradés inutiles, pas d'ombres complexes. Contraste pur.
    *   **Mode Focus** : Pendant l'entraînement, l'interface s'épure pour ne montrer que l'essentiel (Timer, Reps, Poids).
    *   **Feedback Haptique** : Vibrations subtiles à la validation des séries.

---

## 3. Spécifications Fonctionnelles

### 3.1. Gestion Avancée de l'Entraînement (Core)
Le cœur de l'application doit combler les manques des apps grand public.

*   **Supersets & Circuits** :
    *   Capacité de lier plusieurs exercices (Ex: A1 + A2).
    *   Affichage groupé dans l'interface.
    *   Flow de navigation alterné (Ex A -> Ex B -> Repos).
*   **Types de Séries Spéciaux** :
    *   **Warm-up** : Tag pour exclure la série des calculs de stats (1RM/Volume).
    *   **Dropset / Myo-reps** : Tags pour le suivi de l'intensité.
    *   **RPE / RIR** : Champ de saisie central (1-10) pour l'autorégulation.
*   **Notes Contextuelles** : Notes persistantes par exercice ("Monter le siège au cran 4").

### 3.2. Intelligence Artificielle & Data (Smart Features)
Transformer la donnée brute en coaching actionnable.

*   **Heatmap Musculaire Dynamique (Recovery Status)** :
    *   Visualisation anatomique 2D (Face/Dos).
    *   Code couleur temps réel : Bleu (Frais) -> Rouge (Brûlant).
    *   Algorithme de "Decay" basé sur le volume et le temps (fenêtre glissante 7 jours).
*   **Smart Coach (Suggestion de Séance)** :
    *   Générateur de séance automatique quand aucun programme n'est actif.
    *   Logique : Cible les muscles "Frais" (Bleus) non travaillés depuis > X jours.
    *   Sélectionne les exercices favoris de l'utilisateur pour ces muscles.

### 3.3. Nutrition "Smart & Light"
Approche comportementale, non comptable.

*   **Macro-Tracking Simplifié** :
    *   Pas de base de données d'aliments complexe.
    *   Saisie rapide par blocs : "Repas (600kcal)", "Snack (200kcal)".
    *   Focus : Calories + Protéines uniquement.
*   **Calorie Cycling (Adaptation)** :
    *   Objectif dynamique calculé chaque matin.
    *   **Jour ON** (Entraînement) : Objectif Maintenance + Surplus (ex: 2800kcal).
    *   **Jour OFF** (Repos) : Objectif Maintenance ou Déficit (ex: 2400kcal).

---

## 4. Spécifications Techniques

### 4.1. Architecture
*   **Type** : SPA (Single Page Application) ou PWA (Progressive Web App).
*   **Stockage** : Local-First via **IndexedDB**.
    *   Avantage : Fonctionne 100% hors ligne, rapide, privé.
    *   Backup : Export JSON manuel ou Sync optionnel (futur).

### 4.2. Performance & Scalabilité
*   **Problème** : Ralentissement potentiel après 2 ans d'historique.
*   **Solution : "Rolling Snapshot"** :
    *   Pour la Heatmap et les Stats court terme, ne jamais scanner tout l'historique au lancement.
    *   Maintenir un état "Snapshot" (état des muscles à l'instant T) mis à jour après chaque séance.
    *   Au lancement, charger le Snapshot et appliquer le delta temps.
*   **Pagination** : Charger uniquement les 20 dernières séances à l'init.

### 4.3. Stack Technique Recommandée
*   **Framework** : React 18+ (Vite).
*   **Langage** : TypeScript (Strict Mode) - *Indispensable pour la maintenabilité v2*.
*   **State Management** : Zustand (Léger) ou React Context.
*   **Base de Données** : Dexie.js (Wrapper IndexedDB robuste) ou IDB pur optimisé.
*   **Styling** : Tailwind CSS (Pour la rapidité et le système de design).
*   **Icons** : Lucide React.
*   **Charts** : Recharts ou Visx.

---

## 5. Modèle de Données (Draft v2)

Structure JSON simplifiée pour les nouvelles features.

```typescript
// Heatmap Snapshot
interface MuscleStatus {
  id: string; // "chest", "quads"
  fatigueLevel: number; // 0-100
  lastTrained: string; // ISO Date
  recoveryRate: number; // Facteur individuel
}

// Session Template avec Supersets
interface SessionTemplate {
  id: string;
  name: string;
  groups: ExerciseGroup[]; // Au lieu de exercises[] plat
}

interface ExerciseGroup {
  id: string;
  type: 'straight' | 'superset' | 'circuit';
  exercises: ExerciseTemplate[];
}

// Nutrition Log
interface DailyNutrition {
  date: string; // "2025-11-28"
  caloriesTarget: number; // Calculé dynamiquement (Cycle)
  proteinTarget: number;
  caloriesConsumed: number;
  proteinConsumed: number;
  logs: Array<{ time: string, label: string, calories: number, protein: number }>;
}
```

---

## 6. Roadmap de Développement

1.  **Phase 1 : Fondations (S1-S2)**
    *   Setup projet Vite + TypeScript + Tailwind.
    *   Implémentation du Design System "Midnight Pulse" (Composants UI).
    *   Architecture BDD (Dexie/IndexedDB) avec support Supersets.

2.  **Phase 2 : Core Workout (S3-S5)**
    *   Création de Programmes & Séances.
    *   **Workout Player v2** (Mode Focus, Supersets, RPE).
    *   Historique & Logs.

3.  **Phase 3 : Intelligence (S6-S8)**
    *   Moteur de calcul Heatmap (Rolling Snapshot).
    *   Composant Visuel Heatmap (SVG Interactif).
    *   Algorithme Smart Suggestion.

4.  **Phase 4 : Nutrition & Polish (S9-S10)**
    *   Module Nutrition simplifié.
    *   Optimisations perf.
    *   Tests & Beta.

---

## 7. Liste Exhaustive des Fonctionnalités

Cette section liste l'ensemble des fonctionnalités attendues pour la v2, classées par module.

### 🏠 Dashboard (Tableau de Bord)
*   **TDEE Widget** : Affichage des Calories/Protéines du jour vs Objectif (avec jauge circulaire).
*   **Active Program Card** : Résumé du programme en cours (Semaine X, Jour Y) avec barre de progression.
*   **Next Workout Action** : Bouton d'action principal ("Start Push Day") ou "Smart Suggestion" si aucun programme.
*   **Mini Heatmap** : Indicateur visuel rapide de l'état de récupération global.
*   **Quick Actions** : Accès rapide à "Log Nutrition", "Log Weight", "Quick Session".

### 🏋️ Workout Player (Séance en cours)
*   **Focus Mode** : Interface immersive, plein écran, zéro distraction.
*   **Superset Support** : Navigation fluide entre exercices liés (A1 -> A2 -> Repos).
*   **Smart Timer** : Timer de repos automatique (ajustable) + Timer de durée de séance.
*   **RPE Logging** : Saisie du RPE (1-10) pour chaque série.
*   **History Lookup** : Accès en 1 clic à l'historique des perfs sur l'exercice en cours ("C'était quoi mon poids la semaine dernière ?").
*   **Plate Calculator** : Outil pour calculer les disques à charger sur la barre.
*   **Notes Persistantes** : Affichage/Édition des notes techniques par exercice.

### 📅 Programmes & Périodisation
*   **Program Builder** : Créateur de programmes complet (Cycles, Semaines, Séances).
*   **Cycle Management** : Gestion des cycles (Hypertrophie, Force, Deload).
*   **Public Library** : Programmes pré-chargés (PPL, Upper/Lower, Full Body).
*   **Calendar View** : Vue hebdomadaire avec gestion des semaines OFF.

### 📊 Statistiques & Analyse
*   **Heatmap Full View** : Vue anatomique complète et interactive de la récupération.
*   **Volume & 1RM** : Graphiques d'évolution du volume et du 1RM estimé par exercice.
*   **Muscle Balance** : Graphique radar montrant l'équilibre du volume par groupe musculaire (ex: "Trop de Pecs, pas assez de Dos").
*   **Records (PRs)** : Liste automatique des records personnels.

### 🍎 Nutrition (Smart & Light)
*   **Macro Logger** : Saisie rapide (Calories + Protéines).
*   **Calorie Cycling** : Ajustement automatique de l'objectif (High/Low Days).
*   **Water Tracker** : Compteur d'eau simple.

### ⚙️ Paramètres & Profil
*   **Profile Management** : Poids, Taille, Âge, Niveau d'activité.
*   **Training Days** : Définition des jours d'entraînement (ex: Lun, Mer, Ven).
*   **Data Management** : Export JSON complet, Import JSON, Reset Database.
*   **Theme** : "Midnight Pulse" (Défaut), possibilité de thèmes futurs.
*   **Notifications** : Rappels d'entraînement (basés sur la récupération).

---

## 8. Spécifications Détaillées par Module

Cette section approfondit les règles métier et les choix techniques pour chaque module clé.

### 8.1. Module Dashboard

**Règles Métier :**
*   **Calcul TDEE** : Utilise la formule Mifflin-St Jeor.
    *   *Input* : Poids (dernier connu), Taille, Âge, Sexe, Activité.
    *   *Output* : BMR, TDEE, Objectif (Deficit/Surplus).
*   **Affichage Programme** : Doit afficher la *prochaine* séance planifiée. Si la séance du jour est déjà faite, afficher celle de demain.
*   **Smart Suggestion** : N'apparaît que si aucun programme n'est actif (`activeProgram == null`).

**Technique :**
*   **Hook** : `useDashboardData()`.
*   **Performance** : Ne charge pas tout l'historique. Fait une requête `limit(1)` sur `activeProgram` et `limit(1)` sur `nextWorkout`.
*   **Refresh** : S'abonne aux changements de la BDD (Dexie `useLiveQuery`) pour mettre à jour instantanément si une séance est terminée.

### 8.2. Module Workout Player (Critique)

**Règles Métier :**
*   **Supersets** :
    *   Si Ex A et Ex B sont en superset : Après validation de A (Set 1), le bouton "Next" mène à B (Set 1) *sans* lancer le timer de repos long.
    *   Le repos long se lance après B (Set 1).
*   **Timer** :
    *   Se lance automatiquement à la validation d'une série (si `autoStartTimer` est activé).
    *   Doit continuer de tourner même si l'app passe en arrière-plan (Web Worker ou `Date.now()` diff).
*   **Sauvegarde** :
    *   Sauvegarde automatique de l'état en cours dans `localStorage` à chaque input (Crash recovery).
    *   Écriture en BDD (`executedSessions`) uniquement à la fin ("Finish Workout").

**Technique :**
*   **State Management** : `Zustand` store (`useWorkoutSessionStore`).
    *   Structure : `{ status: 'active', currentGroupIndex: 0, exercises: [...], startTime: timestamp }`.
*   **Composants** :
    *   `ExerciseCard` : Composant riche avec input Poids/Reps/RPE.
    *   `RestTimerOverlay` : Overlay flottant quand le timer tourne.

### 8.3. Module Intelligence (Heatmap & Smart Coach)

**Règles Métier :**
*   **Algorithme de Decay (Heatmap)** :
    *   Chaque muscle a un score de fatigue (0-100).
    *   Chaque série ajoute des points (ex: +5 pts/set pour Primary Muscle, +2 pts/set pour Secondary).
    *   Chaque heure, le score diminue de X% (ex: -2% par heure).
    *   *Seuil* : < 20 = Bleu (Frais), > 60 = Rouge (Fatigué).
*   **Smart Suggestion** :
    *   Filtre : Muscles avec fatigue < 30.
    *   Tri : Muscles non travaillés depuis le plus longtemps (`lastTrained`).
    *   Sélection : Prend les 2 muscles prioritaires (ex: Dos + Biceps).
    *   Construction : Cherche dans `executedExercises` les 3 exercices les plus fréquents pour ces muscles.

**Technique :**
*   **Service** : `MuscleFatigueService`.
*   **Stockage** : `muscleStatus` (JSON) stocké dans `localStorage` ou une table `userState` clé-valeur.
*   **Optimisation** : "Rolling Snapshot".
    *   Au lancement : `currentFatigue = savedFatigue * decayFactor(hoursSinceLastSave)`.
    *   Pas de scan complet de l'historique.

### 8.4. Module Nutrition

**Règles Métier :**
*   **Calorie Cycling** :
    *   Détecte si une séance est prévue aujourd'hui (via Programme ou habitude).
    *   Si `isTrainingDay` : Target = TDEE + 300.
    *   Si `isRestDay` : Target = TDEE - 200.
*   **Reset** : Les logs nutritionnels se remettent à zéro à minuit local.

**Technique :**
*   **Table** : `dailyNutritionLogs` (id, date, calories, protein).
*   **Pas de BDD Aliments** : Saisie libre uniquement.

### 8.5. Module Données (Import/Export)

**Règles Métier :**
*   **Export** : Génère un fichier `.json` contenant TOUTES les tables (Profile, Workouts, Programs, Stats).
*   **Import** :
    *   Valide le schéma du JSON (Zod).
    *   Alerte si version incompatible.
    *   Mode "Merge" ou "Overwrite" (par défaut Overwrite pour simplifier).

**Technique :**
*   **Bibliothèque** : `file-saver` pour le téléchargement.
*   **Validation** : `Zod` schemas pour garantir l'intégrité des données importées.

### 8.6. Module Calendrier & Planification

**Règles Métier :**
*   **Vue Hebdomadaire (Défaut)** :
    *   Affiche la semaine en cours (Lundi -> Dimanche).
    *   Swipe horizontal pour changer de semaine.
*   **Règle du Lundi** :
    *   Le démarrage d'un programme se cale toujours sur le *prochain Lundi*.
    *   La semaine 1 commence le Lundi suivant l'activation.
*   **Gestion des Semaines OFF (Vacances/Repos)** :
    *   Bouton "Marquer Semaine Repos" disponible sur les semaines futures.
    *   *Action* : Insère une semaine vide dans le planning.
    *   *Conséquence* : Toutes les séances planifiées sont décalées de +7 jours. Aucune séance n'est supprimée.
*   **Projection Automatique** :
    *   Utilise les `trainingDays` (ex: Lun/Mer/Ven).
    *   Si une séance est manquée, elle reste en "Retard" jusqu'à être faite ou marquée "Sautée".

**Technique :**
*   **Bibliothèque UI** : `react-day-picker` ou `react-big-calendar` (customisé).
*   **Logique** : `PlanningService.shiftSchedule(startDate, weeksToShift)`.
