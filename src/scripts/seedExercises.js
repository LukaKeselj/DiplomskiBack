import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Exercise from "../models/Exercise.js";

const exercises = [
    // grudi
    {name: "Potisak sa šipkom na ravnoj klupi (Bench Press)", muscleGroup: "grudi", equipment: "šipka", description: "Lezi na ravnu klupu, spusti šipku do sredine grudi uz kontrolisan pokret, pa je potisni pravo nagore dok se laktovi skoro ne ispruže."},
    {name: "Potisak sa šipkom na kosoj klupi (Incline Bench Press)", muscleGroup: "grudi", equipment: "šipka", description: "Klupa nagnuta 30-45°, spusti šipku ka gornjem delu grudi i potisni je nagore, naglašava gornji deo grudnog mišića."},
    {name: "Potisak sa bučicama na ravnoj klupi", muscleGroup: "grudi", equipment: "bučice", description: "Lezi na ravnu klupu sa bučicom u svakoj ruci, spusti ih pored grudi, pa ih potisni nagore dok se skoro ne dodirnu."},
    {name: "Sklekovi", muscleGroup: "grudi", equipment: "telesna težina", description: "Telo u pravoj liniji od glave do peta, spusti grudi ka podu savijajući laktove, pa se potisni nazad u početni položaj."},
    {name: "Razvlačenje sa bučicama (Dumbbell Fly)", muscleGroup: "grudi", equipment: "bučice", description: "Lezi na klupu, ruke lagano savijene u laktovima, spusti bučice u stranu u luku, pa ih vrati u polaznu poziciju stežući grudi."},
    {name: "Sklopke na kablu (Cable Fly)", muscleGroup: "grudi", equipment: "kabl", description: "Stani između dva kabla, ruke lagano savijene, dovedi ručke ka sredini tela u luku, fokus na stiskanje grudnih mišića."},
    {name: "Preskoci na spravi (Pec Deck / Butterfly)", muscleGroup: "grudi", equipment: "mašina", description: "Sedi u spravu, podlaktice na jastučićima, spoji ruke ispred grudi kontrolisanim pokretom i vrati ih polako nazad."},
    {name: "Sunožni upori/Diplovi (Dips)", muscleGroup: "grudi", equipment: "telesna težina", description: "Na uporima, spusti telo savijajući laktove uz lagani nagib napred, pa se potisni nazad nagore, naglašava donji deo grudi."},

    // leđa
    {name: "Mrtvo dizanje (Deadlift)", muscleGroup: "leđa", equipment: "šipka", description: "Šipka blizu golenih kostiju, leđa ravna, podigni je uz ispravljanje kukova i kolena istovremeno do stajaćeg položaja."},
    {name: "Zgibovi (Pull-up)", muscleGroup: "leđa", equipment: "telesna težina", description: "Hvat širi od ramena, povuci telo nagore dok brada ne pređe šipku, pa se kontrolisano spusti nazad."},
    {name: "Sunožno povlačenje na spravi (Lat Pulldown)", muscleGroup: "leđa", equipment: "mašina", description: "Sedi ispred sprave, povuci šipku ka gornjem delu grudi stežući lopatice, pa je polako vrati nagore."},
    {name: "Veslanje sa šipkom (Barbell Row)", muscleGroup: "leđa", equipment: "šipka", description: "Nagni gornji deo tela napred uz ravna leđa, povuci šipku ka stomaku stežući lopatice, pa je spusti kontrolisano."},
    {name: "Veslanje sa bučicom jednom rukom", muscleGroup: "leđa", equipment: "bučice", description: "Kolenom i rukom oslonjen na klupu, povuci bučicu drugom rukom ka kuku uz rotaciju lopatice."},
    {name: "Veslanje na kablu u sedu (Seated Cable Row)", muscleGroup: "leđa", equipment: "kabl", description: "Sedi uspravno, povuci ručku ka stomaku stežući lopatice, laktovi blizu tela, pa polako vrati nazad."},
    {name: "T-Bar veslanje", muscleGroup: "leđa", equipment: "šipka", description: "Nagnut nad T-bar spravom, povuci ručku ka grudima stežući leđa, kontrolisano spusti nazad."},
    {name: "Hiperekstenzije (Hyperextensions)", muscleGroup: "leđa", equipment: "telesna težina", description: "Na spravi za hiperekstenzije, spusti gornji deo tela napred pa ga podigni nazad u ravnu liniju koristeći donji deo leđa."},

    // noge
    {name: "Čučanj sa šipkom (Squat)", muscleGroup: "noge", equipment: "šipka", description: "Šipka na gornjem delu leđa, spusti se savijajući kukove i kolena dok butine ne budu paralelne sa podom, pa se vrati nagore."},
    {name: "Presa za noge (Leg Press)", muscleGroup: "noge", equipment: "mašina", description: "Sedi u spravu, stopala u širini ramena na platformi, savij kolena ka grudima pa potisni platformu nazad u polaznu poziciju."},
    {name: "Opružanje nogu (Leg Extension)", muscleGroup: "noge", equipment: "mašina", description: "Sedi u spravu, opruži noge nagore kontrolisanim pokretom stežući prednju stranu buta, pa ih polako spusti."},
    {name: "Savijanje nogu (Leg Curl)", muscleGroup: "noge", equipment: "mašina", description: "Ležeći ili sedeći u spravi, savij noge ka zadnjici stežući zadnju ložu, pa ih polako ispravi nazad."},
    {name: "Iskoraci (Lunges)", muscleGroup: "noge", equipment: "bučice", description: "Napravi korak napred i spusti zadnje koleno ka podu, pa se odgurni nazad u početni stav i ponovi drugom nogom."},
    {name: "Rumunsko mrtvo dizanje (Romanian Deadlift)", muscleGroup: "noge", equipment: "šipka", description: "Noge lagano savijene, spusti šipku niz noge uz ravna leđa dok ne osetiš istezanje zadnje lože, pa se ispravi nazad."},
    {name: "Podizanje na prste (Calf Raise)", muscleGroup: "noge", equipment: "mašina", description: "Stojeći na platformi, podigni pete što više nagore stežući listove, pa ih polako spusti ispod nivoa platforme."},
    {name: "Bugarski rasplet (Bulgarian Split Squat)", muscleGroup: "noge", equipment: "bučice", description: "Zadnja noga oslonjena na klupu iza tebe, spusti se u čučanj na prednjoj nozi pa se vrati nagore."},
    {name: "Hip Thrust", muscleGroup: "noge", equipment: "šipka", description: "Gornja leđa oslonjena na klupu, šipka preko kukova, podigni kukove nagore stežući zadnjicu, pa ih spusti kontrolisano."},

    // ramena
    {name: "Potisak iznad glave (Overhead Press)", muscleGroup: "ramena", equipment: "šipka", description: "Stojeći, šipka u visini ramena, potisni je pravo nagore iznad glave dok se ruke ne isprave, pa spusti nazad."},
    {name: "Potisak bučicama iznad glave", muscleGroup: "ramena", equipment: "bučice", description: "Sedeći ili stojeći, bučice u visini ramena, potisni ih nagore dok se skoro ne dodirnu, pa ih spusti kontrolisano."},
    {name: "Bočno podizanje (Lateral Raise)", muscleGroup: "ramena", equipment: "bučice", description: "Ruke pored tela, podigni bučice u stranu do visine ramena laganim pokretom, pa ih polako spusti."},
    {name: "Podizanje napred (Front Raise)", muscleGroup: "ramena", equipment: "bučice", description: "Podigni bučicu ili šipku pravo napred do visine ramena, pa je polako spusti kontrolišući pokret."},
    {name: "Zadnje rameno na sprave (Rear Delt Fly)", muscleGroup: "ramena", equipment: "bučice", description: "Nagnut napred, podigni bučice u stranu fokusirajući se na zadnji deo ramena, pa ih spusti nazad."},
    {name: "Arnold Press", muscleGroup: "ramena", equipment: "bučice", description: "Počni sa dlanovima okrenutim ka sebi, rotiraj i potisni bučice nagore dok dlanovi ne budu okrenuti napred."},
    {name: "Veslanje uz telo (Upright Row)", muscleGroup: "ramena", equipment: "šipka", description: "Povuci šipku uz telo nagore do visine grudi vodeći laktove iznad ruku, pa je spusti nazad."},
    {name: "Face Pull", muscleGroup: "ramena", equipment: "kabl", description: "Povuci uže ka licu razdvajajući ruke, laktovi visoko, naglašava zadnja ramena i rotatornu manžetnu."},

    // ruke
    {name: "Podizanje šipke za biceps (Barbell Curl)", muscleGroup: "ruke", equipment: "šipka", description: "Stojeći, šipka u rukama, savij laktove podižući šipku nagore stežući biceps, pa je polako spusti."},
    {name: "Podizanje bučica za biceps (Dumbbell Curl)", muscleGroup: "ruke", equipment: "bučice", description: "Stojeći ili sedeći, naizmenično ili istovremeno savijaj laktove podižući bučice ka ramenima."},
    {name: "Hammer Curl", muscleGroup: "ruke", equipment: "bučice", description: "Dlanovi okrenuti jedan ka drugom, savijaj laktove podižući bučice nagore, naglašava podlakticu i bočni biceps."},
    {name: "Potiskivanje na kablu za triceps (Tricep Pushdown)", muscleGroup: "ruke", equipment: "kabl", description: "Laktovi uz telo, potisni ručku nadole dok se ruke potpuno ne isprave, pa je polako vrati nazad."},
    {name: "Francuski potisak (Skull Crusher)", muscleGroup: "ruke", equipment: "šipka", description: "Ležeći, spusti šipku ka čelu savijajući samo laktove, pa je vrati nagore ispravljajući ruke."},
    {name: "Uski hvat potisak (Close-Grip Bench Press)", muscleGroup: "ruke", equipment: "šipka", description: "Uzan hvat na šipci, spusti je ka donjem delu grudi, pa je potisni nagore naglašavajući triceps."},
    {name: "Propovednička klupa za biceps (Preacher Curl)", muscleGroup: "ruke", equipment: "šipka", description: "Ruke oslonjene na nagnutu klupu, savij laktove podižući teg nagore, pa ga polako spusti."},
    {name: "Triceps ekstenzija iznad glave", muscleGroup: "ruke", equipment: "bučice", description: "Bučica iznad glave sa obe ruke, spusti je iza glave savijajući laktove, pa je vrati nagore ispravljanjem ruku."},

    // core
    {name: "Plank", muscleGroup: "core", equipment: "telesna težina", description: "Oslonac na podlakticama i prstima stopala, telo u pravoj liniji, drži poziciju stežući stomak."},
    {name: "Trbušnjaci (Crunch)", muscleGroup: "core", equipment: "telesna težina", description: "Ležeći na leđima, kolena savijena, podigni gornji deo tela ka kolenima stežući stomak, pa se spusti nazad."},
    {name: "Ruski uvrtaji (Russian Twist)", muscleGroup: "core", equipment: "telesna težina", description: "Sedeći sa nagnutim telom unazad, rotiraj trup levo-desno dodirujući pod pored kuka."},
    {name: "Podizanje nogu u visu (Hanging Leg Raise)", muscleGroup: "core", equipment: "telesna težina", description: "Visi na šipci za zgibove, podigni ispružene ili savijene noge ka grudima, pa ih spusti kontrolisano."},
    {name: "Trbušnjaci na kablu (Cable Crunch)", muscleGroup: "core", equipment: "kabl", description: "Kleci ispred kabla sa užetom iza vrata, savij trup nadole stežući stomak, pa se polako vrati nagore."},
    {name: "Podizanje trupa (Sit-up)", muscleGroup: "core", equipment: "telesna težina", description: "Ležeći na leđima, kolena savijena, podigni ceo gornji deo tela dok ne sedneš uspravno, pa se spusti nazad."},
    {name: "Planinar (Mountain Climbers)", muscleGroup: "core", equipment: "telesna težina", description: "Iz pozicije za sklekove, naizmenično dovodi kolena ka grudima brzim tempom, telo ostaje u pravoj liniji."},
    {name: "Kotrljanje sa točkom (Ab Wheel Rollout)", muscleGroup: "core", equipment: "oprema (ab točak)", description: "Klečeći, kotrljaj točak napred ispravljajući telo koliko god kontrolisano možeš, pa se vrati nazad stežući stomak."},
];

async function seed(){
    await connectDB();

    let created = 0;
    let updated = 0;

    for(const exercise of exercises){
        const result = await Exercise.findOneAndUpdate(
            {name: exercise.name},
            exercise,
            {upsert: true, new: true, setDefaultsOnInsert: true, rawResult: true}
        );

        if(result.lastErrorObject?.updatedExisting){
            updated++;
        }else{
            created++;
        }
    }

    console.log(`Seed završen: ${created} novih vežbi kreirano, ${updated} postojećih ažurirano.`);

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((error) => {
    console.error("Greška pri seed-ovanju vežbi:", error);
    process.exit(1);
});
