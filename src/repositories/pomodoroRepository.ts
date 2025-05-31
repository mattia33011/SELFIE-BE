import { Repository } from "./repository";
import { Collection, ObjectId } from "mongodb";
import { DBPomorodo, Pomodoro, Session, Task } from "../types/event";

class PomodoroRepository extends Repository {
  private readonly pomodoros: Collection;
  private readonly sessions: Collection;
  private readonly tasks: Collection;

  constructor() {
    super("pomodoros");
    this.pomodoros = this.collection;
    this.sessions = this.client.collection("sessions");
    this.tasks = this.client.collection("tasks");
    this._setupCollections();
  }
  async _setupCollections() {
    await this.pomodoros.createIndex({ id: 1 }, { unique: false });
    await this.sessions.createIndex({ id: 1 }, { unique: false });
    await this.tasks.createIndex({ id: 1 }, { unique: false });
  }

  async save(pomodoro: DBPomorodo) {
    return this.pomodoros.updateOne({userID: pomodoro.userID}, {$set: pomodoro});
  }

  async readPomodoro(userID: string) {
    return this.pomodoros.find({ userID: userID }).toArray();
  }

  async saveSession(session: Session[], userID: string) {
    const mappedSession= session.map(it => ({ ...it, userID: userID }))
    return this.sessions.insertMany(mappedSession);
  }
  async readSession(userID: string) {
    return this.sessions.find({ userID: userID }).toArray();
  }

  async deleteSession(sessionID: string, userID: string) {
    return this.sessions.deleteOne({
      _id: new ObjectId(sessionID),
      userID: userID,
    });
  }

  async readTask(userID: string) {
    return this.tasks.find({ userID: userID }).toArray();
  }
  async saveTask(tasks: Task[], userID: string) {
    const mappedTasks = tasks.map((task) => ({ ...task, userID: userID }));
    return this.tasks.insertMany(mappedTasks);
  }
  async deleteTask(taskID: string, userID: string) {
    return this.tasks.deleteOne({ _id: new ObjectId(taskID), userID: userID });
  }
}
const pomodoroRepository = new PomodoroRepository();
export default pomodoroRepository;
