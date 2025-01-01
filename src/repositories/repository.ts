import { User, UserSession } from '../types/user';
import { Collection, Db, MongoClient } from 'mongodb';
import fs from 'fs';
import passwordManager from '../managers/passwordManager';
import { log } from 'console';

class Repository {
  client: Db;
  private connectionUri = process.env.MONGO_URI;

  constructor() {
    if(!this.connectionUri)
      throw new Error('MongoDB connection Uri in undefined')
    const client = new MongoClient(this.connectionUri);
    log(this.connectionUri)
    this.client = client.db('selfie');
  }

  // DON'T USED
  private basePathGen = (path: string) => `src/db/${path}`;
  private async readFile(username: string): Promise<UserSession | undefined> {
    const filePath = this.basePathGen(`${username}.json`);
    try {
      const jsonData = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(jsonData) as UserSession;
    } catch (e: any) {
      return undefined;
    }
  }
  private insertFile(user: User): boolean {
    const filePath = this.basePathGen(`${user.username}.json`);

    if (fs.existsSync(filePath)) return false;

    fs.writeFile(
      filePath,
      JSON.stringify({
        ...user,
        password: passwordManager.crypt(user.password),
      }),
      (err) => {
        if (err) {
          console.log('Error writing file:', err);
        } else {
          console.log('Successfully wrote file');
        }
      }
    );

    return true;
  }
}

const repository = new Repository();

export default repository;
