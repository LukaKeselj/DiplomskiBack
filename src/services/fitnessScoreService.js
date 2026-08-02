import { AppError } from "../errors/AppError.js";
import { normalizeDate, getScheduledDay } from "./workoutSessionService.js";

const WEEK_LENGTH = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const WEIGHTS = {
    workout: 0.35,
    nutrition: 0.25,
    supplements: 0.25,
    weight: 0.15,
};

function getWeekStart(date){
    const start = normalizeDate(date);
    const day = start.getUTCDay(); // 0 = nedelja, 1 = ponedeljak, ... 6 = subota
    const diffToMonday = day === 0 ? 6 : day - 1;
    start.setUTCDate(start.getUTCDate() - diffToMonday);
    return start;
}

// Nutrition plans aren't pinned to real weekdays — the cycle starts at activation
// (that day is plan.days[0]) and repeats based on how many days the plan has.
function getNutritionCycleDayIndex(startDate, targetDate, dayCount){
    if(!startDate || !dayCount) return 0;
    const diffDays = Math.round((targetDate - startDate) / MS_PER_DAY);
    return ((diffDays % dayCount) + dayCount) % dayCount;
}

function addDays(date, amount){
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + amount);
    return next;
}

function toIsoDate(date){
    return date.toISOString().slice(0, 10);
}

function clampScore(value){
    return Math.max(0, Math.min(100, Math.round(value)));
}

const BMI_HEALTHY_MIN = 18.5;
const BMI_HEALTHY_MAX = 24.9;
const BMI_LOW_FLOOR = 15;
const BMI_HIGH_CEIL = 35;

// Score peaks in the healthy BMI range and tapers linearly toward 0 at the under/overweight extremes,
// so logging a weight only scores well when it reflects a healthy height-to-weight ratio.
function computeBmiScore(bmi){
    if(bmi >= BMI_HEALTHY_MIN && bmi <= BMI_HEALTHY_MAX) return 100;
    if(bmi < BMI_HEALTHY_MIN){
        return clampScore(((bmi - BMI_LOW_FLOOR) / (BMI_HEALTHY_MIN - BMI_LOW_FLOOR)) * 100);
    }
    return clampScore(100 - ((bmi - BMI_HEALTHY_MAX) / (BMI_HIGH_CEIL - BMI_HEALTHY_MAX)) * 100);
}

function computeWeek({
    weekStart, weekEnd, windowEnd,
    plan, planStart, activeSupplementIds, heightCm,
    nutritionPlan, nutritionPlanStart,
    completedSessionDates, nutritionLoggedDates, loggedNutritionItemKeys, weightByDate, takenSupplementDates,
}){
    if(windowEnd < weekStart){
        return {
            weekStart: toIsoDate(weekStart),
            weekEnd: toIsoDate(weekEnd),
            overall: null,
            breakdown: {
                workout: {score: null, completed: 0, expected: 0},
                nutrition: {score: null, loggedDays: 0, totalDays: 0, completed: 0, expected: 0},
                weight: {score: null, logged: false, weight: null, bmi: null},
                supplements: {score: null, completed: 0, expected: 0},
            },
        };
    }

    const windowDays = Math.round((windowEnd - weekStart) / MS_PER_DAY) + 1;

    let workoutExpected = 0;
    let workoutCompleted = 0;
    if(plan?.days?.length && planStart){
        for(let offset = 0; offset < windowDays; offset++){
            const date = addDays(weekStart, offset);
            if(date < planStart) continue;
            const scheduled = getScheduledDay(plan, planStart, date);
            if(scheduled.isRestDay === false){
                workoutExpected++;
                if(completedSessionDates.has(toIsoDate(date))) workoutCompleted++;
            }
        }
    }
    const workoutScore = workoutExpected > 0 ? clampScore((workoutCompleted / workoutExpected) * 100) : null;

    let nutritionLoggedDays = 0;
    for(let offset = 0; offset < windowDays; offset++){
        const date = addDays(weekStart, offset);
        if(nutritionLoggedDates.has(toIsoDate(date))) nutritionLoggedDays++;
    }

    let nutritionExpected = 0;
    let nutritionCompleted = 0;
    if(nutritionPlan?.days?.length && nutritionPlanStart){
        for(let offset = 0; offset < windowDays; offset++){
            const date = addDays(weekStart, offset);
            if(date < nutritionPlanStart) continue;
            const dayIndex = getNutritionCycleDayIndex(nutritionPlanStart, date, nutritionPlan.days.length);
            const planDay = nutritionPlan.days[dayIndex];
            const isoDate = toIsoDate(date);
            for(const item of planDay.items){
                nutritionExpected++;
                if(loggedNutritionItemKeys.has(`${isoDate}_${item._id.toString()}`)) nutritionCompleted++;
            }
        }
    }
    // With an active plan, score adherence to its planned items; otherwise fall back
    // to plain logging consistency since there's no plan to measure against.
    const nutritionScore = nutritionExpected > 0
        ? clampScore((nutritionCompleted / nutritionExpected) * 100)
        : clampScore((nutritionLoggedDays / windowDays) * 100);

    let weightLogged = false;
    let latestWeight = null;
    for(let offset = 0; offset < windowDays; offset++){
        const date = addDays(weekStart, offset);
        const value = weightByDate.get(toIsoDate(date));
        if(value !== undefined){
            weightLogged = true;
            latestWeight = value;
        }
    }
    const heightM = heightCm / 100;
    const bmi = weightLogged && heightM > 0 ? latestWeight / (heightM * heightM) : null;
    const weightScore = bmi !== null ? computeBmiScore(bmi) : 0;

    let supplementsExpected = 0;
    let supplementsCompleted = 0;
    if(activeSupplementIds.length > 0){
        for(let offset = 0; offset < windowDays; offset++){
            const isoDate = toIsoDate(addDays(weekStart, offset));
            for(const supplementId of activeSupplementIds){
                supplementsExpected++;
                if(takenSupplementDates.has(`${supplementId}_${isoDate}`)) supplementsCompleted++;
            }
        }
    }
    const supplementsScore = activeSupplementIds.length > 0
        ? clampScore((supplementsCompleted / supplementsExpected) * 100)
        : null;

    const components = [
        {score: workoutScore, weight: WEIGHTS.workout},
        {score: nutritionScore, weight: WEIGHTS.nutrition},
        {score: weightScore, weight: WEIGHTS.weight},
        {score: supplementsScore, weight: WEIGHTS.supplements},
    ].filter((component) => component.score !== null);

    const totalWeight = components.reduce((sum, component) => sum + component.weight, 0);
    const overall = totalWeight > 0
        ? clampScore(components.reduce((sum, component) => sum + component.score * component.weight, 0) / totalWeight)
        : null;

    return {
        weekStart: toIsoDate(weekStart),
        weekEnd: toIsoDate(weekEnd),
        overall,
        breakdown: {
            workout: {score: workoutScore, completed: workoutCompleted, expected: workoutExpected},
            nutrition: {score: nutritionScore, loggedDays: nutritionLoggedDays, totalDays: windowDays, completed: nutritionCompleted, expected: nutritionExpected},
            weight: {score: weightScore, logged: weightLogged, weight: latestWeight, bmi: bmi !== null ? Math.round(bmi * 10) / 10 : null},
            supplements: {score: supplementsScore, completed: supplementsCompleted, expected: supplementsExpected},
        },
    };
}

export function createFitnessScoreService({
    userRepository,
    workoutPlanRepository,
    workoutSessionRepository,
    nutritionLogRepository,
    nutritionPlanRepository,
    weightLogRepository,
    supplementLogRepository,
    userSupplementRepository,
}){
    async function getScoreHistory(userId, {weeks} = {}){
        const weeksCount = Math.min(26, Math.max(1, Math.round(Number(weeks)) || 8));

        const user = await userRepository.findById(userId);
        if(!user) throw new AppError("Korisnik nije pronađen", 404);

        const today = normalizeDate();
        const currentWeekStart = getWeekStart(today);
        const earliestWeekStart = addDays(currentWeekStart, -(weeksCount - 1) * WEEK_LENGTH);

        const [plan, nutritionPlan, userSupplements, sessions, nutritionLogs, weightLogs, takenSupplementLogs] = await Promise.all([
            user.activeWorkoutPlan ? workoutPlanRepository.findById(user.activeWorkoutPlan) : null,
            user.activeNutritionPlan ? nutritionPlanRepository.findById(user.activeNutritionPlan) : null,
            userSupplementRepository.findAllByUser(userId),
            workoutSessionRepository.findByUserAndDateRange(userId, earliestWeekStart, today),
            nutritionLogRepository.findAllByUser(userId, {date: {$gte: earliestWeekStart, $lte: today}}),
            weightLogRepository.findAllByUser(userId, {date: {$gte: earliestWeekStart, $lte: today}}),
            supplementLogRepository.findAllByUser(userId, {date: {$gte: earliestWeekStart, $lte: today}, taken: true}),
        ]);

        const planStart = plan && user.activeWorkoutPlanStartDate
            ? normalizeDate(user.activeWorkoutPlanStartDate)
            : null;
        const nutritionPlanStart = nutritionPlan && user.activeNutritionPlanStartDate
            ? normalizeDate(user.activeNutritionPlanStartDate)
            : null;
        const activeSupplementIds = userSupplements
            .filter((item) => item.active)
            .map((item) => item._id.toString());

        const completedSessionDates = new Set(
            sessions
                .filter((session) => session.status === "completed")
                .map((session) => toIsoDate(normalizeDate(session.date)))
        );
        const nutritionLoggedDates = new Set(
            nutritionLogs.map((log) => toIsoDate(normalizeDate(log.date)))
        );
        const loggedNutritionItemKeys = new Set(
            nutritionLogs
                .filter((log) => log.nutritionPlanItem)
                .map((log) => `${toIsoDate(normalizeDate(log.date))}_${log.nutritionPlanItem.toString()}`)
        );
        const weightByDate = new Map(weightLogs.map((log) => [toIsoDate(normalizeDate(log.date)), log.weight]));
        const takenSupplementDates = new Set(
            takenSupplementLogs.map(
                (log) => `${log.supplement.toString()}_${toIsoDate(normalizeDate(log.date))}`
            )
        );

        const weeks_ = [];
        for(let i = weeksCount - 1; i >= 0; i--){
            const weekStart = addDays(currentWeekStart, -i * WEEK_LENGTH);
            const weekEnd = addDays(weekStart, WEEK_LENGTH - 1);
            const windowEnd = weekEnd < today ? weekEnd : today;

            weeks_.push(computeWeek({
                weekStart,
                weekEnd,
                windowEnd,
                plan,
                planStart,
                activeSupplementIds,
                heightCm: user.height,
                nutritionPlan,
                nutritionPlanStart,
                completedSessionDates,
                nutritionLoggedDates,
                loggedNutritionItemKeys,
                weightByDate,
                takenSupplementDates,
            }));
        }

        return weeks_;
    }

    return { getScoreHistory };
}
