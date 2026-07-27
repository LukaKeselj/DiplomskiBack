import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Supplement from "../models/Supplement.js";

const supplements = [
    {name: "Kreatin monohidrat (Creatine Monohydrate)"},
    {name: "Whey protein (surutka)"},
    {name: "Whey protein izolat"},
    {name: "Kazein protein (Casein)"},
    {name: "BCAA (razgranati aminokiselinski lanci)"},
    {name: "EAA (esencijalne aminokiseline)"},
    {name: "Glutamin (L-Glutamine)"},
    {name: "Beta-Alanin"},
    {name: "Citrulin malat (Citrulline Malate)"},
    {name: "L-Arginin"},
    {name: "Riblje ulje / Omega-3"},
    {name: "Multivitamin"},
    {name: "Vitamin D3"},
    {name: "Vitamin C"},
    {name: "Magnezijum"},
    {name: "Cink (Zinc)"},
    {name: "ZMA (Cink-Magnezijum-B6)"},
    {name: "Pre-workout"},
    {name: "Kofein (Caffeine)"},
    {name: "Ashwagandha"},
    {name: "Melatonin"},
    {name: "Probiotik"},
    {name: "Kolagen peptidi (Collagen Peptides)"},
    {name: "Gvožđe (Iron)"},
    {name: "Kalcijum"},
];

async function seed(){
    await connectDB();

    let created = 0;
    let updated = 0;

    for(const supplement of supplements){
        const result = await Supplement.findOneAndUpdate(
            {name: supplement.name},
            supplement,
            {upsert: true, new: true, setDefaultsOnInsert: true, rawResult: true}
        );

        if(result.lastErrorObject?.updatedExisting){
            updated++;
        }else{
            created++;
        }
    }

    console.log(`Seed završen: ${created} novih suplemenata kreirano, ${updated} postojećih ažurirano.`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((error) => {
    console.error("Greška pri seed-ovanju suplemenata:", error);
    process.exit(1);
});
