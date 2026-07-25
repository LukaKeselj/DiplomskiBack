/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const up = async (db, client) => {
    const users = await db.collection("users").find({createdAt: {$exists: false}}).toArray();

    for(const user of users){
        const createdAt = user._id.getTimestamp();
        await db.collection("users").updateOne(
            {_id: user._id},
            {$set: {createdAt, updatedAt: createdAt}}
        );
    }
};

/**
 * @param db {import('mongodb').Db}
 * @param client {import('mongodb').MongoClient}
 * @returns {Promise<void>}
 */
export const down = async (db, client) => {
    await db.collection("users").updateMany(
        {},
        {$unset: {createdAt: "", updatedAt: ""}}
    );
};
