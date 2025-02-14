import {Collection, Db, MongoClient} from "mongodb";

export abstract class Repository {
  protected client: Db;
  private readonly connectionUri = process.env.MONGO_URI;
  readonly collection: Collection;

  protected constructor(collectionName: string) {
    if (!this.connectionUri)
      throw new Error("MongoDB connection Uri in undefined");
    const client = new MongoClient(this.connectionUri);
    this.client = client.db("selfie");
    this.collection = this.client.collection(collectionName)
  }
}


export enum MongoDBErrorCode {
  DUPLICATE_KEY = 11000
}