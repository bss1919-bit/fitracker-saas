import Dexie, { Table } from 'dexie';
import type {
    UserProfile,
    Exercise,
    ExecutedWorkout,
    Program,
    SessionTemplate,
    Category
} from '@/shared/types/database';

export class FitTrackerDatabase extends Dexie {
    userProfile!: Table<UserProfile>;
    exercises!: Table<Exercise>;
    workouts!: Table<ExecutedWorkout>;
    programs!: Table<Program>;
    sessionTemplates!: Table<SessionTemplate>;
    categories!: Table<Category>;

    constructor() {
        super('FitTrackerDB');

        this.version(5).stores({
            userProfile: '++id',
            exercises: '++id, category, isCustom',
            workouts: '++id, date',
            programs: '++id, isActive',
            sessionTemplates: '++id',
            categories: '++id'
        });

        // Version 6: Multilingual support for exercises and categories
        this.version(6).stores({
            userProfile: '++id',
            exercises: '++id, category, isCustom',
            workouts: '++id, date',
            programs: '++id, isActive',
            sessionTemplates: '++id',
            categories: '++id'
        }).upgrade(async (trans) => {
            // Migrate categories to multilingual format
            const categories = await trans.table('categories').toArray();
            for (const category of categories) {
                if (typeof category.name === 'string') {
                    const oldName = category.name;
                    await trans.table('categories').update(category.id, {
                        name: {
                            en: oldName, // Keep existing French name as fallback
                            fr: oldName,
                            ar: oldName
                        }
                    });
                }
            }

            // Migrate exercises to multilingual format
            const exercises = await trans.table('exercises').toArray();
            for (const exercise of exercises) {
                if (typeof exercise.name === 'string') {
                    const oldName = exercise.name;
                    await trans.table('exercises').update(exercise.id, {
                        name: {
                            en: oldName, // Keep existing French name as fallback
                            fr: oldName,
                            ar: oldName
                        }
                    });
                }
            }
        });

        // Version 7: Add workoutOffsets support for Calendar V2
        this.version(7).stores({
            userProfile: '++id',
            exercises: '++id, category, isCustom',
            workouts: '++id, date',
            programs: '++id, isActive',
            sessionTemplates: '++id',
            categories: '++id'
        }).upgrade(async (trans) => {
            // Initialize workoutOffsets to {} for all existing programs
            const programs = await trans.table('programs').toArray();
            for (const program of programs) {
                if (!program.workoutOffsets) {
                    await trans.table('programs').update(program.id, {
                        workoutOffsets: {}
                    });
                }
            }
        });
    }
}

export const db = new FitTrackerDatabase();
