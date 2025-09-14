import userRepository from "../repositories/userRepository";
import PomodoroRepository from "../repositories/pomodoroRepository";
import {
    DBPomorodo,
  Pomodoro,
  Pomodoros,
  StudyPlan,
  StudySession,
  StudySessions,
  Task,
  Tasks,
} from "../types/event";

  export class PomodoroManager {
    public async fetchPomodoro(userID: string, pomodoroId: string): Promise<Pomodoro> {
      const query: any = { userID };
    if (pomodoroId) {
      query.id = pomodoroId;
    }
    const pomodoro = await PomodoroRepository.readPomodoro(query);
    if (!pomodoro) {
      throw new Error("Pomodoro not found");
    }

  return {
    pomodoroNumber: pomodoro.pomodoroNumber,
    pomodoroType: pomodoro.pomodoroType,
    pomodoroDuration: pomodoro.pomodoroDuration,
    shortBreakDuration: pomodoro.shortBreakDuration,
    longBreakDuration: pomodoro.longBreakDuration,
    longBreakInterval: pomodoro.longBreakInterval,
    id: pomodoro.id,
  };
  }
  public async save(pomodoro: Pomodoro, userID: string): Promise<boolean> {
    const user = await userRepository.read(userID);
    if (!user) {
      throw new Error("User not found");
    }
    let pomodoroToSave: DBPomorodo = { ...pomodoro, userID: userID };
    
      pomodoroToSave.id = pomodoro.id;
      pomodoroToSave.pomodoroNumber = pomodoro.pomodoroNumber;
      pomodoroToSave.pomodoroType = pomodoro.pomodoroType;
      pomodoroToSave.pomodoroDuration = pomodoro.pomodoroDuration;
      pomodoroToSave.shortBreakDuration = pomodoro.shortBreakDuration;
      pomodoroToSave.longBreakDuration = pomodoro.longBreakDuration;
      pomodoroToSave.longBreakInterval = pomodoro.longBreakInterval;

    return PomodoroRepository.save(pomodoroToSave).then(
      (it) => it.acknowledged
    );
  }

  public async fetchStudySessions(userID: string): Promise<StudySessions> {
    const user = await userRepository.read(userID);
    return PomodoroRepository.readSession(user!.email).then((sessions) => {
      console.log(sessions);
      return sessions.map(
        (session): StudySession => ({
          id: sessions.indexOf(session) + 1,
          _id: session._id,
          pomodoroNumber: session.pomodoroNumber,
          taskCompleted: session.taskCompleted,
          date: session.date,
        })
      );
    });
  }

  public async insertStudySession(
    session: StudySession[],
    userID: string
  ): Promise<StudySessions> {
    const user = await userRepository.read(userID);
    return PomodoroRepository.saveSession(session, user!.email).then(
      (it) => it
    );
  }
  public async deleteStudySession(
    sessionID: string,
    userID: string
  ): Promise<boolean> {
    const user = await userRepository.read(userID);
    return PomodoroRepository.deleteSession(sessionID, user!.email).then(
      (it) => it.acknowledged
    );
  }

  public async fetchTasks(userID: string): Promise<Tasks> {
    const user = await userRepository.read(userID);
    return PomodoroRepository.readTask(user!.email).then((tasks) => {
      console.log(tasks);
      return tasks.map(
        (task): Task => ({
          _id: task._id,
          taskName: task.taskName,
          taskStatus: task.taskStatus,
          taskCompleted: task.taskCompleted,
        })
      );
    });
  }

  public async fetchStudyPlan(userIdentifier: string) {
    // se userIdentifier contiene '@' assumiamo sia già un'email
    let email: string | undefined = undefined;
    if (typeof userIdentifier === 'string' && userIdentifier.includes('@')) {
      email = userIdentifier;
    } else {
      const user = await userRepository.read(userIdentifier);
      email = user?.email;
    }

    if (!email) {
      console.log('fetchStudyPlan: no email resolved for', userIdentifier);
      return []; // niente piani
    }

    // ora leggiamo i piani salvati con userID = email
    const records = await PomodoroRepository.readStudyPlan(email);
    return records.map((plan): StudyPlan => ({
      settings: plan.settings,
      plan: plan.plan,
      totalTime: plan.totalTime ?? plan.TotalTime,
      days: plan.days,
      _id: plan._id
    }));
  }


public async insertStudyPlan(plan: StudyPlan, userID: string): Promise<StudyPlan> {
  const user = await userRepository.read(userID);

  if (!user) throw new Error('User not found');
  // Salva o aggiorna il piano e ritorna il piano aggiornato
  const savedPlan = await PomodoroRepository.saveStudyPlan(plan, userID);

  if (!savedPlan) throw new Error('Errore nel salvataggio del piano');
  return savedPlan;
}



  public async insertTask(task: Task[], userID: string): Promise<Tasks> {
    const user = await userRepository.read(userID);
    return PomodoroRepository.saveTask(task, user!.email).then(
      (it) => it
    );
  }

  public async updateTask(task: Task[], userID: string): Promise<boolean> {
    const user = await userRepository.read(userID);
    return PomodoroRepository.updateTask(task, user!.email).then(
      (it) => true
    );
  }


  public async deleteTask(taskID: string, userID: string): Promise<boolean> {
    const user = await userRepository.read(userID);
    return PomodoroRepository.deleteTask(taskID, user!.email).then(
      (it) => it.acknowledged
    );
  }
}

export const pomodoroManager = new PomodoroManager();
