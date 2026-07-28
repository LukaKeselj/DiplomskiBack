import { createContainer, asFunction, InjectionMode } from "awilix";

import { createUserRepository } from "./repositories/userRepository.js";
import { createRefreshTokenRepository } from "./repositories/refreshTokenRepository.js";
import { createAuditLogRepository } from "./repositories/auditLogRepository.js";
import { createExerciseRepository } from "./repositories/exerciseRepository.js";
import { createNutritionLogRepository } from "./repositories/nutritionLogRepository.js";
import { createSupplementLogRepository } from "./repositories/supplementLogRepository.js";
import { createSupplementRepository } from "./repositories/supplementRepository.js";
import { createUserSupplementRepository } from "./repositories/userSupplementRepository.js";
import { createWeightLogRepository } from "./repositories/weightLogRepository.js";
import { createWorkoutLogRepository } from "./repositories/workoutLogRepository.js";
import { createWorkoutPlanRepository } from "./repositories/workoutPlanRepository.js";
import { createWorkoutSessionRepository } from "./repositories/workoutSessionRepository.js";

import { createAuditLogService } from "./services/auditLogService.js";
import { createMailService } from "./services/mailService.js";
import { createAuthService } from "./services/authService.js";
import { createUserService } from "./services/userService.js";
import { createExerciseService } from "./services/exerciseService.js";
import { createFatsecretService } from "./services/fatsecretService.js";
import { createNutritionLogService } from "./services/nutritionLogService.js";
import { createSupplementLogService } from "./services/supplementLogService.js";
import { createSupplementService } from "./services/supplementService.js";
import { createUserSupplementService } from "./services/userSupplementService.js";
import { createWeightLogService } from "./services/weightLogService.js";
import { createWorkoutLogService } from "./services/workoutLogService.js";
import { createWorkoutPlanService } from "./services/workoutPlanService.js";
import { createWorkoutSessionService } from "./services/workoutSessionService.js";

import { createAuthController } from "./controllers/authController.js";
import { createUsersController } from "./controllers/usersController.js";
import { createExercisesController } from "./controllers/exercisesController.js";
import { createFoodController } from "./controllers/foodController.js";
import { createNutritionLogsController } from "./controllers/nutritionLogsController.js";
import { createSupplementLogsController } from "./controllers/supplementLogsController.js";
import { createSupplementsController } from "./controllers/supplementsController.js";
import { createUserSupplementsController } from "./controllers/userSupplementsController.js";
import { createWeightLogsController } from "./controllers/weightLogsController.js";
import { createWorkoutLogsController } from "./controllers/workoutLogsController.js";
import { createWorkoutPlansController } from "./controllers/workoutPlansController.js";
import { createWorkoutSessionsController } from "./controllers/workoutSessionsController.js";

const container = createContainer({
    injectionMode: InjectionMode.PROXY,
});

container.register({
    // repositories
    userRepository: asFunction(createUserRepository).singleton(),
    refreshTokenRepository: asFunction(createRefreshTokenRepository).singleton(),
    auditLogRepository: asFunction(createAuditLogRepository).singleton(),
    exerciseRepository: asFunction(createExerciseRepository).singleton(),
    nutritionLogRepository: asFunction(createNutritionLogRepository).singleton(),
    supplementLogRepository: asFunction(createSupplementLogRepository).singleton(),
    supplementRepository: asFunction(createSupplementRepository).singleton(),
    userSupplementRepository: asFunction(createUserSupplementRepository).singleton(),
    weightLogRepository: asFunction(createWeightLogRepository).singleton(),
    workoutLogRepository: asFunction(createWorkoutLogRepository).singleton(),
    workoutPlanRepository: asFunction(createWorkoutPlanRepository).singleton(),
    workoutSessionRepository: asFunction(createWorkoutSessionRepository).singleton(),

    // services
    auditLogService: asFunction(createAuditLogService).singleton(),
    mailService: asFunction(createMailService).singleton(),
    authService: asFunction(createAuthService).singleton(),
    userService: asFunction(createUserService).singleton(),
    exerciseService: asFunction(createExerciseService).singleton(),
    fatsecretService: asFunction(createFatsecretService).singleton(),
    nutritionLogService: asFunction(createNutritionLogService).singleton(),
    supplementLogService: asFunction(createSupplementLogService).singleton(),
    supplementService: asFunction(createSupplementService).singleton(),
    userSupplementService: asFunction(createUserSupplementService).singleton(),
    weightLogService: asFunction(createWeightLogService).singleton(),
    workoutLogService: asFunction(createWorkoutLogService).singleton(),
    workoutPlanService: asFunction(createWorkoutPlanService).singleton(),
    workoutSessionService: asFunction(createWorkoutSessionService).singleton(),

    // controllers
    authController: asFunction(createAuthController).singleton(),
    usersController: asFunction(createUsersController).singleton(),
    exercisesController: asFunction(createExercisesController).singleton(),
    foodController: asFunction(createFoodController).singleton(),
    nutritionLogsController: asFunction(createNutritionLogsController).singleton(),
    supplementLogsController: asFunction(createSupplementLogsController).singleton(),
    supplementsController: asFunction(createSupplementsController).singleton(),
    userSupplementsController: asFunction(createUserSupplementsController).singleton(),
    weightLogsController: asFunction(createWeightLogsController).singleton(),
    workoutLogsController: asFunction(createWorkoutLogsController).singleton(),
    workoutPlansController: asFunction(createWorkoutPlansController).singleton(),
    workoutSessionsController: asFunction(createWorkoutSessionsController).singleton(),
});

export default container;
