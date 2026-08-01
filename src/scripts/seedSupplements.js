import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Supplement from "../models/Supplement.js";

const supplements = [
    {
        name: "Kreatin monohidrat (Creatine Monohydrate)",
        description: "Povećava snagu i eksplozivnost kod kratkotrajnih intenzivnih napora i ubrzava oporavak između serija. Jedan od najbolje istraženih suplemenata za mišićnu masu i performanse.",
    },
    {
        name: "Whey protein (surutka)",
        description: "Brzo se apsorbuje, koristi se posle treninga za pokretanje oporavka i rasta mišića.",
    },
    {
        name: "Whey protein izolat",
        description: "Prečišćeniji oblik whey proteina sa manje laktoze i masti, pogodan i za osobe osetljive na mlečne proizvode.",
    },
    {
        name: "Kazein protein (Casein)",
        description: "Sporo se apsorbuje tokom više sati, zato je idealan pred spavanje za noćni oporavak mišića.",
    },
    {
        name: "BCAA (razgranati aminokiselinski lanci)",
        description: "Leucin, izoleucin i valin — smanjuju razgradnju mišića i osećaj umora tokom treninga.",
    },
    {
        name: "EAA (esencijalne aminokiseline)",
        description: "Svih 9 esencijalnih aminokiselina, potpunija podrška sintezi proteina i oporavku od samog BCAA.",
    },
    {
        name: "Glutamin (L-Glutamine)",
        description: "Podržava oporavak mišića i imuni sistem, posebno posle dugih ili intenzivnih treninga.",
    },
    {
        name: "Beta-Alanin",
        description: "Odlaže mišićni zamor kod treninga visokog intenziteta; može izazvati bezopasne trnce po koži (parestezija).",
    },
    {
        name: "Citrulin malat (Citrulline Malate)",
        description: "Poboljšava protok krvi i 'pumpu' u mišićima, smanjuje zamor tokom serija sa više ponavljanja.",
    },
    {
        name: "L-Arginin",
        description: "Prekursor azot-oksida, podržava protok krvi i vaskularizaciju tokom treninga.",
    },
    {
        name: "Riblje ulje / Omega-3",
        description: "Podržava zdravlje srca i zglobova i smanjuje opšti nivo upale u organizmu.",
    },
    {
        name: "Multivitamin",
        description: "Pokriva osnovne dnevne potrebe za vitaminima i mineralima, posebno korisno uz pojačanu fizičku aktivnost.",
    },
    {
        name: "Vitamin D3",
        description: "Podržava zdravlje kostiju, imuni sistem i hormonalni balans; posebno važan kod manjeg izlaganja suncu.",
    },
    {
        name: "Vitamin C",
        description: "Antioksidans koji podržava imuni sistem i sintezu kolagena.",
    },
    {
        name: "Magnezijum",
        description: "Podržava funkciju mišića i nervnog sistema, smanjuje grčeve i doprinosi boljem snu.",
    },
    {
        name: "Cink (Zinc)",
        description: "Podržava imuni sistem, sintezu proteina i normalan nivo testosterona.",
    },
    {
        name: "ZMA (Cink-Magnezijum-B6)",
        description: "Kombinacija cinka, magnezijuma i vitamina B6 koja se uzima pred spavanje radi boljeg sna i oporavka.",
    },
    {
        name: "Pre-workout",
        description: "Kombinacija kofeina i drugih ergogenih sastojaka koja se uzima pre treninga radi energije i fokusa.",
    },
    {
        name: "Kofein (Caffeine)",
        description: "Stimulans koji povećava energiju, fokus i fizičke performanse tokom treninga.",
    },
    {
        name: "Ashwagandha",
        description: "Adaptogena biljka koja pomaže u smanjenju stresa i kortizola, uz moguću podršku snazi i oporavku.",
    },
    {
        name: "Melatonin",
        description: "Reguliše ciklus spavanja, koristan za lakše uspavljivanje i kvalitetniji san.",
    },
    {
        name: "Probiotik",
        description: "Podržava zdravlje creva i varenje, doprinosi boljoj apsorpciji nutrijenata.",
    },
    {
        name: "Kolagen peptidi (Collagen Peptides)",
        description: "Podržava zdravlje zglobova, kože i vezivnog tkiva.",
    },
    {
        name: "Gvožđe (Iron)",
        description: "Neophodno za transport kiseonika u krvi; važno kod niskog nivoa energije i izdržljivosti.",
    },
    {
        name: "Kalcijum",
        description: "Podržava zdravlje kostiju i zuba i učestvuje u kontrakciji mišića.",
    },
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
