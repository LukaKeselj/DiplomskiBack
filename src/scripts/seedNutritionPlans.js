import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import NutritionPlan from "../models/NutritionPlan.js";

const TARGET_EMAIL = "lukakeselj1@gmail.com";

function meal(foodName, calories, protein, fat, carbs, fiber = 0) {
    return { foodName, calories, protein, fat, carbs, fiber };
}

// Dani se ne vezuju za stvarni dan u nedelji — plan se vrti u krug u nizu
// (Dan 1 = dan aktivacije plana, pa redom, pa ponovo od Dana 1).
const standardDays = [
    {
        dayName: "Dan 1",
        items: [
            meal("Kajmak i integralni hleb", 380, 12, 20, 35, 4),
            meal("Pileća supa sa rezancima", 320, 20, 10, 30, 2),
            meal("Punjena paprika sa pirinčem", 620, 28, 22, 70, 6),
            meal("Voćna salata", 180, 2, 1, 40, 5),
        ],
    },
    {
        dayName: "Dan 2",
        items: [
            meal("Ovsena kaša sa bananom", 400, 14, 10, 65, 7),
            meal("Piletina sa pirinčem i brokolijem", 650, 45, 12, 75, 6),
            meal("Losos sa povrćem na pari", 520, 38, 25, 25, 5),
            meal("Grčki jogurt sa orasima", 250, 15, 15, 12, 2),
        ],
    },
    {
        dayName: "Dan 3",
        items: [
            meal("Omlet sa sirom i paradajzom", 420, 24, 28, 12, 2),
            meal("Teleća pečenica sa povrćem", 580, 40, 22, 40, 5),
            meal("Testenina sa tunjevinom", 600, 32, 15, 80, 4),
            meal("Proteinski šejk", 220, 30, 5, 15, 1),
        ],
    },
    {
        dayName: "Dan 4",
        items: [
            meal("Palačinke sa medom", 450, 10, 14, 70, 2),
            meal("Sarma", 550, 25, 30, 45, 7),
            meal("Piletina na žaru sa salatom", 480, 42, 15, 25, 6),
            meal("Mešano orašasto voće", 200, 6, 16, 10, 3),
        ],
    },
    {
        dayName: "Dan 5",
        items: [
            meal("Musli sa mlekom", 380, 14, 10, 60, 6),
            meal("Pasulj sa suvim mesom", 600, 28, 20, 75, 12),
            meal("Ćevapi sa lepinjom", 700, 38, 30, 65, 4),
            meal("Jabuka", 90, 0, 0, 22, 4),
        ],
    },
    {
        dayName: "Dan 6",
        items: [
            meal("Jaja na oko sa slaninom", 480, 26, 38, 4, 0),
            meal("Riblja čorba", 300, 22, 8, 25, 3),
            meal("Piletina u sosu od pečuraka", 560, 40, 24, 30, 4),
            meal("Kotlet sir sa voćem", 260, 20, 12, 20, 3),
        ],
    },
    {
        dayName: "Dan 7",
        items: [
            meal("Burek sa jogurtom", 550, 16, 30, 55, 2),
            meal("Roštilj sa kupusom", 700, 45, 35, 40, 6),
            meal("Pileća pita", 500, 28, 22, 50, 3),
            meal("Tamna čokolada", 150, 2, 10, 14, 3),
        ],
    },
];

const deficitDays = standardDays.map((day) => ({
    dayName: day.dayName,
    items: day.items.map((item) => ({
        ...item,
        calories: Math.round(item.calories * 0.72),
        protein: Math.round(item.protein * 0.9),
        fat: Math.round(item.fat * 0.65),
        carbs: Math.round(item.carbs * 0.7),
        fiber: item.fiber,
    })),
}));

const plans = [
    { name: "Standardna ishrana (7 dana)", days: standardDays },
    { name: "Plan za mršavljenje (7 dana)", days: deficitDays },
];

async function seed() {
    await connectDB();

    const user = await User.findOne({ email: TARGET_EMAIL });
    if (!user) {
        console.error(`Korisnik ${TARGET_EMAIL} nije pronađen.`);
        await mongoose.disconnect();
        process.exit(1);
    }

    let created = 0;
    let skipped = 0;

    for (const planData of plans) {
        const existing = await NutritionPlan.findOne({ user: user._id, name: planData.name });
        if (existing) {
            skipped++;
            continue;
        }

        await NutritionPlan.create({
            user: user._id,
            name: planData.name,
            days: planData.days,
        });
        created++;
    }

    console.log(`Seed završen za ${TARGET_EMAIL}: ${created} novih planova ishrane kreirano, ${skipped} već postojalo (preskočeno).`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((error) => {
    console.error("Greška pri seed-ovanju planova ishrane:", error);
    process.exit(1);
});
