/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
    await db.collection("users").updateMany(
        {isBlocked: {$exists: false}},
        {$set: {isBlocked: false}}
    );

    await db.collection("users").updateMany(
        {profileImage: {$exists: false}},
        {$set: {profileImage: ""}}
    );
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
    await db.collection("users").updateMany(
        {},
        {$unset: {isBlocked: "", profileImage: ""}}
    );
};
