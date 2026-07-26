let cachedToken = null;
let tokenExpiresAt = 0;

async function fetchNewToken(){
    const credentials = Buffer.from(`${process.env.FOOD_CLIENT_ID}:${process.env.FOOD_CLIENT_SECRET}`).toString("base64");

    const response = await fetch("https://oauth.fatsecret.com/connect/token", {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials&scope=basic",
    });

    if(!response.ok){
        throw new Error(`FatSecret token request failed: ${response.status}`);
    }

    return response.json();
}

export async function getAccessToken(){
    const now = Date.now();

    if(cachedToken && now < tokenExpiresAt){
        return cachedToken;
    }

    const data = await fetchNewToken();
    cachedToken = data.access_token;
    tokenExpiresAt = now + (data.expires_in - 60) * 1000; // osveži 60s pre isteka

    return cachedToken;
}
