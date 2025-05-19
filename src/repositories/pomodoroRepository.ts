import {Repository} from "./repository";
import {Collection, ObjectId} from "mongodb";
import {Pomodoro, Session, Task} from "../types/event";

class PomodoroRepository extends Repository {
    private readonly pomodoros: Collection;
    private readonly sessions: Collection;
    private readonly tasks: Collection;

    constructor() {
        super("pomodoros");
        this.pomodoros = this.collection
        this.sessions = this.client.collection("sessions");
        this.tasks = this.client.collection("tasks");
    }

    async save(pomodoro: Pomodoro, userID: string) {
        return this.pomodoros.insertOne({...pomodoro, userID: userID});
    }

    async readPomodoro(userID: string) {
        return this.pomodoros.find({userID: userID}).toArray();
    }

    async saveSession(session: Session, userID: string) {
        return this.sessions.insertOne({...session, userID: userID});

    }
    async readSession(userID: string) {
        return this.sessions.find({userID: userID}).toArray();
    }

    async readTask(userID: string) {
        return this.tasks.find({userID: userID}).toArray();
    }
    async saveTask(task: Task, userID: string) {
        return this.tasks.insertOne({...task, userID: userID});
    }
}
const pomodoroRepository = new PomodoroRepository()
export default pomodoroRepository;