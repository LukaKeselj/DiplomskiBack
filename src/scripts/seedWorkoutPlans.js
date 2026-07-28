import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Exercise from "../models/Exercise.js";
import WorkoutPlan from "../models/WorkoutPlan.js";

const TARGET_EMAIL = "lukakeselj1@gmail.com";

function buildExerciseEntry(exercise, targetSets, targetReps, restMinutes){
    return {exercise: exercise._id, targetSets, targetReps, restMinutes};
}

async function seed(){
    await connectDB();

    const user = await User.findOne({email: TARGET_EMAIL});
    if(!user){
        console.error(`Korisnik ${TARGET_EMAIL} nije pronađen.`);
        await mongoose.disconnect();
        process.exit(1);
    }

    const exercisesByGroup = {};
    for(const group of ["grudi", "leđa", "noge", "ramena", "ruke", "core"]){
        exercisesByGroup[group] = await Exercise.find({muscleGroup: group});
    }

    const missingGroup = Object.entries(exercisesByGroup).find(([, list]) => list.length === 0);
    if(missingGroup){
        console.error(`Nema vežbi za mišićnu grupu "${missingGroup[0]}" — pokreni prvo npm run seed:exercises.`);
        await mongoose.disconnect();
        process.exit(1);
    }

    const pick = (group, index) => exercisesByGroup[group][index % exercisesByGroup[group].length];

    const plans = [
        {
            name: "Bro Split (5 dana)",
            days: [
                {
                    dayName: "Dan 1 — Grudi",
                    exercises: [
                        buildExerciseEntry(pick("grudi", 0), 4, 8, 2),
                        buildExerciseEntry(pick("grudi", 1), 3, 10, 2),
                        buildExerciseEntry(pick("grudi", 2), 3, 12, 1.5),
                        buildExerciseEntry(pick("grudi", 5), 3, 15, 1),
                    ],
                },
                {
                    dayName: "Dan 2 — Leđa",
                    exercises: [
                        buildExerciseEntry(pick("leđa", 0), 4, 6, 3),
                        buildExerciseEntry(pick("leđa", 1), 3, 8, 2),
                        buildExerciseEntry(pick("leđa", 3), 3, 10, 2),
                        buildExerciseEntry(pick("leđa", 5), 3, 12, 1.5),
                    ],
                },
                {
                    dayName: "Dan 3 — Noge",
                    exercises: [
                        buildExerciseEntry(pick("noge", 0), 4, 8, 3),
                        buildExerciseEntry(pick("noge", 1), 3, 10, 2),
                        buildExerciseEntry(pick("noge", 4), 3, 12, 1.5),
                        buildExerciseEntry(pick("noge", 6), 4, 15, 1),
                    ],
                },
                {
                    dayName: "Dan 4 — Ramena",
                    exercises: [
                        buildExerciseEntry(pick("ramena", 0), 4, 8, 2),
                        buildExerciseEntry(pick("ramena", 2), 3, 12, 1.5),
                        buildExerciseEntry(pick("ramena", 3), 3, 12, 1.5),
                        buildExerciseEntry(pick("ramena", 7), 3, 15, 1),
                    ],
                },
                {
                    dayName: "Dan 5 — Ruke",
                    exercises: [
                        buildExerciseEntry(pick("ruke", 0), 3, 10, 2),
                        buildExerciseEntry(pick("ruke", 3), 3, 10, 2),
                        buildExerciseEntry(pick("ruke", 2), 3, 12, 1.5),
                        buildExerciseEntry(pick("ruke", 5), 3, 12, 1.5),
                    ],
                },
            ],
        },
        {
            name: "Push/Pull/Legs (6 dana)",
            days: [
                {
                    dayName: "Dan 1 — Push A",
                    exercises: [
                        buildExerciseEntry(pick("grudi", 0), 4, 6, 3),
                        buildExerciseEntry(pick("ramena", 0), 3, 8, 2),
                        buildExerciseEntry(pick("ruke", 3), 3, 12, 1.5),
                    ],
                },
                {
                    dayName: "Dan 2 — Pull A",
                    exercises: [
                        buildExerciseEntry(pick("leđa", 0), 4, 6, 3),
                        buildExerciseEntry(pick("leđa", 2), 3, 10, 2),
                        buildExerciseEntry(pick("ruke", 0), 3, 10, 1.5),
                    ],
                },
                {
                    dayName: "Dan 3 — Legs A",
                    exercises: [
                        buildExerciseEntry(pick("noge", 0), 4, 8, 3),
                        buildExerciseEntry(pick("noge", 5), 3, 10, 2),
                        buildExerciseEntry(pick("noge", 6), 3, 15, 1),
                    ],
                },
                {
                    dayName: "Dan 4 — Push B",
                    exercises: [
                        buildExerciseEntry(pick("grudi", 1), 4, 8, 2.5),
                        buildExerciseEntry(pick("ramena", 2), 3, 12, 1.5),
                        buildExerciseEntry(pick("ruke", 4), 3, 10, 1.5),
                    ],
                },
                {
                    dayName: "Dan 5 — Pull B",
                    exercises: [
                        buildExerciseEntry(pick("leđa", 3), 4, 8, 2.5),
                        buildExerciseEntry(pick("leđa", 5), 3, 12, 1.5),
                        buildExerciseEntry(pick("ruke", 2), 3, 12, 1.5),
                    ],
                },
                {
                    dayName: "Dan 6 — Legs B",
                    exercises: [
                        buildExerciseEntry(pick("noge", 1), 4, 10, 2.5),
                        buildExerciseEntry(pick("noge", 4), 3, 12, 2),
                        buildExerciseEntry(pick("core", 0), 3, 1, 1),
                    ],
                },
            ],
        },
        {
            name: "Full Body (3 dana)",
            days: [
                {
                    dayName: "Dan 1",
                    exercises: [
                        buildExerciseEntry(pick("noge", 0), 4, 8, 3),
                        buildExerciseEntry(pick("grudi", 0), 3, 10, 2),
                        buildExerciseEntry(pick("leđa", 1), 3, 10, 2),
                        buildExerciseEntry(pick("core", 1), 3, 15, 1),
                    ],
                },
                {
                    dayName: "Dan 2",
                    exercises: [
                        buildExerciseEntry(pick("noge", 5), 4, 10, 2.5),
                        buildExerciseEntry(pick("ramena", 0), 3, 10, 2),
                        buildExerciseEntry(pick("leđa", 0), 3, 8, 2.5),
                        buildExerciseEntry(pick("core", 2), 3, 15, 1),
                    ],
                },
                {
                    dayName: "Dan 3",
                    exercises: [
                        buildExerciseEntry(pick("noge", 6), 4, 12, 2),
                        buildExerciseEntry(pick("grudi", 2), 3, 12, 1.5),
                        buildExerciseEntry(pick("leđa", 3), 3, 10, 2),
                        buildExerciseEntry(pick("core", 3), 3, 12, 1),
                    ],
                },
            ],
        },
    ];

    let created = 0;
    let skipped = 0;

    for(const planData of plans){
        const existing = await WorkoutPlan.findOne({user: user._id, name: planData.name});
        if(existing){
            skipped++;
            continue;
        }

        await WorkoutPlan.create({
            user: user._id,
            name: planData.name,
            days: planData.days,
        });
        created++;
    }

    console.log(`Seed završen za ${TARGET_EMAIL}: ${created} novih planova kreirano, ${skipped} već postojalo (preskočeno).`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((error) => {
    console.error("Greška pri seed-ovanju planova treninga:", error);
    process.exit(1);
});
