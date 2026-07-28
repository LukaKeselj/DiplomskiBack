import { getAccessToken } from "../config/fatsecret.js";
import { AppError } from "../errors/AppError.js";

const BASE_URL = "https://platform.fatsecret.com/rest/server.api";

function toArray(value){
    if(!value) return [];
    return Array.isArray(value) ? value : [value];
}

async function callFatSecret(params){
    const token = await getAccessToken();
    const url = new URL(BASE_URL);
    url.searchParams.set("format", "json");
    for(const [key, value] of Object.entries(params)){
        url.searchParams.set(key, value);
    }

    const response = await fetch(url, {
        headers: {Authorization: `Bearer ${token}`},
    });

    const data = await response.json();

    if(data.error){
        throw new AppError(`FatSecret greška: ${data.error.message}`, 502);
    }

    return data;
}

async function searchFoods(query){
    if(!query || !query.trim()){
        throw new AppError("Upit za pretragu je obavezan", 400);
    }

    const data = await callFatSecret({method: "foods.search", search_expression: query, max_results: 20});
    const foods = toArray(data.foods?.food);

    return foods.map((food) => ({
        foodId: food.food_id,
        name: food.food_name,
        description: food.food_description,
    }));
}

async function getFoodDetails(foodId){
    if(!foodId){
        throw new AppError("ID namirnice je obavezan", 400);
    }

    const data = await callFatSecret({method: "food.get.v2", food_id: foodId});
    const food = data.food;

    if(!food){
        throw new AppError("Namirnica nije pronađena", 404);
    }

    const servings = toArray(food.servings?.serving);

    return {
        foodId: food.food_id,
        name: food.food_name,
        servings: servings.map((serving) => ({
            servingId: serving.serving_id,
            description: serving.serving_description,
            calories: Number(serving.calories),
            protein: Number(serving.protein),
            fat: Number(serving.fat),
            carbs: Number(serving.carbohydrate),
            fiber: Number(serving.fiber) || 0,
        })),
    };
}

export function createFatsecretService(){
    return { searchFoods, getFoodDetails };
}
