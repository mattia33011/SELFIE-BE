import { Repository } from "./repository";
import { Collection, ObjectId } from "mongodb";
import { DBPomorodo, Pomodoro, StudySession, Task, Tasks, StudySessions, StudyPlan } from "../types/event";

class PomodoroRepository extends Repository {
  private readonly pomodoros: Collection;
  private readonly sessions: Collection;
  private readonly tasks: Collection;
  private readonly plans: Collection;

  constructor() {
    super("pomodoros");
    this.pomodoros = this.client.collection("pomodoroinfo");
    this.sessions = this.client.collection("sessions");
    this.tasks = this.client.collection("tasks");
    this.plans=this.client.collection("plans");
    this._setupCollections();
  }
  async _setupCollections() {
    await this.pomodoros.createIndex({ id: 1 }, { unique: false });
    await this.sessions.createIndex({ id: 1 }, { unique: false });
    await this.tasks.createIndex({ id: 1 }, { unique: false });
    await this.plans.createIndex({ id: 1 }, { unique: false });
  }
 
  async save(pomodoro: DBPomorodo) {
    const result = await this.pomodoros.updateOne(
      { userID: pomodoro.userID },
      { $set: pomodoro },
      { upsert: true }
    );
    console.log('MongoDB result:', result); // Log del risultato
    return result;
  }

  async readPomodoro(query: any) {
    return this.pomodoros.findOne(query);
  }

  async saveSession(session: StudySession[], userID: string) {
    const mappedSession= session.map((session) => ({ ...session, userID: userID }));

    await this.sessions.insertMany(mappedSession);
    return this.readSession(userID) as Promise<StudySessions>;
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
  async readStudyPlan(userID: string){
    return this.plans.find({userID: userID}).toArray();
  }

async findStudyPlan(userID: string, plan: StudyPlan): Promise<StudyPlan | null> {
  if (!plan._id) throw new Error('Plan ID is undefined');

  return this.plans.findOne({
    _id: new ObjectId(plan._id),
    userID: userID
  }) as Promise<StudyPlan | null>;
}





async saveStudyPlan(plan: StudyPlan, userID: string) {
  if (plan._id) {
    console.log(plan.days[0].step);
    const result = await this.plans.updateOne(
      {userID: userID, _id: new ObjectId(plan._id) }, // <<< converti in ObjectId
      { $set: { days: plan.days } }
    );
    if (result.matchedCount === 0) {
      throw new Error('Plan not found for update');
    }
    return this.findStudyPlan(userID, plan);
  } else {
    const toInsert = { ...plan, userID };
    const insertResult = await this.plans.insertOne(toInsert);
    return this.findStudyPlan(userID, { ...plan, _id: insertResult.insertedId });
  }
}

async deletePlan(planid: string, userID: string) {
  return this.plans.deleteOne({
    _id: new ObjectId(planid),
    userID: userID,
  });
}




  async readTask(userID: string) {
    return this.tasks.find({ userID: userID }).toArray();
  }
  async saveTask(tasks: Task[], userID: string):Promise<Tasks> {
    const mappedTasks = tasks.map((task) => ({ ...task, userID: userID }));
    await this.tasks.insertMany(mappedTasks);
    return this.readTask(userID) as Promise<Tasks>;
  }
  async updateTask(tasks: Task[], userID: string) {
    const mappedTasks = tasks.map((task) => ({ ...task, userID: userID }));
    return mappedTasks.map((task) =>
      this.tasks.updateOne({userID: userID, _id:new ObjectId(task._id)},{$set:{
        taskName: task.taskName,
        taskStatus: task.taskStatus,
        taskCompleted: task.taskCompleted,
      }}, { upsert: true })
    );
  }

  async deleteTask(taskID: string, userID: string) {
    return this.tasks.deleteOne({ 
      _id: new ObjectId(taskID), 
      userID: userID });
  }
}
const pomodoroRepository = new PomodoroRepository();
export default pomodoroRepository;
