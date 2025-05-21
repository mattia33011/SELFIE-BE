import PomodoroRepository from "../repositories/pomodoroRepository";
import {Pomodoro, Pomodoros, Session, Sessions, Task, Tasks} from "../types/event";

export class PomodoroManager {
    public async fetchPomodoro(userID: string): Promise<Pomodoros> {
        return PomodoroRepository
            .readPomodoro(userID)
            .then(pomodoros => {
                console.log(pomodoros);
                return pomodoros.map((pomodoro) => ({
                    pomodoroNumber: pomodoro.pomodoroNumber,
                    pomodoroType: pomodoro.pomodoroType,
                    pomodoroDuration: pomodoro.pomodoroDuration,
                    shortBreakDuration: pomodoro.shortBreakDuration,
                    longBreakDuration: pomodoro.longBreakDuration,
                    longBreakInterval: pomodoro.longBreakInterval,
                }))
            })
    }
    public async insert(pomodoro: Pomodoro, userID: string): Promise<boolean> {
        return PomodoroRepository.save(pomodoro, userID).then(it => it.acknowledged)
    }

    public async fetchStudySessions(userID: string): Promise<Sessions> {
        return PomodoroRepository
            .readSession(userID)
            .then(sessions => {
                console.log(sessions);
                return sessions.map((session): Session => ({
                    pomodoroNumber: session.pomodoroNumber,
                    taskCompleted: session.taskCompleted,
                    date: session.date
                }))
            })
    }

    public async insertStudySession(session: Session, userID: string): Promise<boolean> {
        return PomodoroRepository.saveSession(session, userID).then(it => it.acknowledged)
    }
    public async deleteStudySession(sessionID: string, userID: string): Promise<boolean> {
        return PomodoroRepository.deleteSession(sessionID, userID).then(it => it.acknowledged)
    }

    public async fetchTasks(userID: string): Promise<Tasks> {
        return PomodoroRepository
            .readTask(userID)
            .then(tasks => {
                console.log(tasks);
                return tasks.map((task): Task => ({
                    taskName: task.taskName,
                    taskStatus: task.taskStatus,
                    taskCompleted: task.taskCompleted
                }))
            })
    }
    public async insertTask(task: Task, userID: string): Promise<boolean> {
        return PomodoroRepository.saveTask(task, userID).then(it => it.acknowledged)
    }

    public async deleteTask(taskID: string, userID: string): Promise<boolean> {
        return PomodoroRepository.deleteTask(taskID, userID).then(it => it.acknowledged)
    }
}

export const pomodoroManager = new PomodoroManager();