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

function computeWeek({
    weekStart, weekEnd, windowEnd,
    plan, planStart, activeSupplementIds,
    completedSessionDates, nutritionLoggedDates, weightLoggedDates, takenSupplementDates,
}){
    if(windowEnd < weekStart){
        return {
            weekStart: toIsoDate(weekStart),
            weekEnd: toIsoDate(weekEnd),
            overall: null,
            breakdown: {
                workout: {score: null, completed: 0, expected: 0},
                nutrition: {score: null, loggedDays: 0, totalDays: 0},
                weight: {score: null, logged: false},
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
    const nutritionScore = clampScore((nutritionLoggedDays / windowDays) * 100);

    let weightLogged = false;
    for(let offset = 0; offset < windowDays; offset++){
        const date = addDays(weekStart, offset);
        if(weightLoggedDates.has(toIsoDate(date))){
            weightLogged = true;
            break;
        }
    }
    const weightScore = weightLogged ? 100 : 0;

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
            nutrition: {score: nutritionScore, loggedDays: nutritionLoggedDays, totalDays: windowDays},
            weight: {score: weightScore, logged: weightLogged},
            supplements: {score: supplementsScore, completed: supplementsCompleted, expected: supplementsExpected},
        },
    };
}

export function createFitnessScoreService({
    userRepository,
    workoutPlanRepository,
    workoutSessionRepository,
    nutritionLogRepository,
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

        const [plan, userSupplements, sessions, nutritionGroups, weightLogs, takenSupplementLogs] = await Promise.all([
            user.activeWorkoutPlan ? workoutPlanRepository.findById(user.activeWorkoutPlan) : null,
            userSupplementRepository.findAllByUser(userId),
            workoutSessionRepository.findByUserAndDateRange(userId, earliestWeekStart, today),
            nutritionLogRepository.sumByUserAndDateRange(userId, earliestWeekStart, today),
            weightLogRepository.findAllByUser(userId, {date: {$gte: earliestWeekStart, $lte: today}}),
            supplementLogRepository.findAllByUser(userId, {date: {$gte: earliestWeekStart, $lte: today}, taken: true}),
        ]);

        const planStart = plan && user.activeWorkoutPlanStartDate
            ? normalizeDate(user.activeWorkoutPlanStartDate)
            : null;
        const activeSupplementIds = userSupplements
            .filter((item) => item.active)
            .map((item) => item._id.toString());

        const completedSessionDates = new Set(
            sessions
                .filter((session) => session.status === "completed")
                .map((session) => toIsoDate(normalizeDate(session.date)))
        );
        const nutritionLoggedDates = new Set(nutritionGroups.map((group) => group._id));
        const weightLoggedDates = new Set(weightLogs.map((log) => toIsoDate(normalizeDate(log.date))));
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
                completedSessionDates,
                nutritionLoggedDates,
                weightLoggedDates,
                takenSupplementDates,
            }));
        }

        return weeks_;
    }

    return { getScoreHistory };
}
