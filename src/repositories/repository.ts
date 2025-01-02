import { Db, MongoClient } from "mongodb";

export abstract class Repository {
  protected client: Db;
  private readonly connectionUri = process.env.MONGO_URI;

  protected constructor() {
    if (!this.connectionUri)
      throw new Error("MongoDB connection Uri in undefined");
    const client = new MongoClient(this.connectionUri);
    console.log(this.connectionUri);
    this.client = client.db("selfie");
  }
}


export enum MongoDBErrorCode {
  DUPLICATE_KEY = 11000
}