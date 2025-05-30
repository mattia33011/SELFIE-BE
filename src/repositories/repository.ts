import {Collection, Db, MongoClient} from "mongodb";

const connectionUri = process.env.MONGO_URI;

export abstract class Repository {
    protected client: Db;
    readonly collection: Collection;

    protected constructor(collectionName: string) {
        if (!connectionUri)
            throw new Error("MongoDB connection Uri in undefined");
        const client = new MongoClient(connectionUri!);
        this.client = client.db("selfie");
        this.collection = this.client.collection(collectionName)
    }
}

export async function checkDbConnection() {
    if (!connectionUri)
        throw new Error("MongoDB connection Uri in undefined");
    return new MongoClient(connectionUri).connect().then(async (it) => {
        await it.close(true);
        return true
    }).catch(() => false);
}


export enum MongoDBErrorCode {
    DUPLICATE_KEY = 11000
}