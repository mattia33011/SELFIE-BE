import userRepository from "../repositories/userRepository";
import PomodoroRepository from "../repositories/pomodoroRepository";
import {
    DBPomorodo,
  Pomodoro,
  Pomodoros,
  StudySession,
  StudySessions,
  Task,
  Tasks,
} from "../types/event";
import pomodoroRepository from "../repositories/pomodoroRepository";

export class PomodoroManager {
  public async fetchPomodoro(userID: string): Promise<Pomodoros> {
    return PomodoroRepository.readPomodoro(userID).then((pomodoros) => {
      console.log(pomodoros);
      return pomodoros.map((pomodoro) => ({
        pomodoroNumber: pomodoro.pomodoroNumber,
        pomodoroType: pomodoro.pomodoroType,
        pomodoroDuration: pomodoro.pomodoroDuration,
        shortBreakDuration: pomodoro.shortBreakDuration,
        longBreakDuration: pomodoro.longBreakDuration,
        longBreakInterval: pomodoro.longBreakInterval,
        id: pomodoro.id,
      }));
    });
  }
  public async save(pomodoro: Pomodoro, userID: string): Promise<boolean> {
    const user = await userRepository.read(userID);
    if (!user) {
      throw new Error("User not found");
    }
    const pomodoroToUpdate = await PomodoroRepository.readPomodoro(user.email) as unknown as DBPomorodo[];
    let pomodoroToSave: DBPomorodo = { ...pomodoro, userID: user.email };
    if (pomodoroToUpdate.length !== 0) {
      pomodoroToSave.id = pomodoroToUpdate[0].id;
    }

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
