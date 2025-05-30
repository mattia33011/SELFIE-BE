import { ObjectId } from "mongodb";

export type Events = Event[]

export type Event = {
    title: string,
    expireDate: Date,
    description?: string,
    color?: string,
}
export function isEvent(event: any): event is Event {
    return "title" in event && "expireDate" in event && "description" in event;
}
export type Notes = Note[]

export type Note = {
    label: string,
    expanded: Boolean,
    content: string,
    icon: String,
    children: Notes,
    type: string,
    parent: string,
    droppable: Boolean,
    lastEdit: Date,
}

export type Pomodoro = {
    pomodoroNumber: number,
    pomodoroType: string, //mi dice se siamo ad un pomodoro o una pausa (lunga o corta)
    //settings per il pomodoro
    pomodoroDuration: number,
    shortBreakDuration: number,
    longBreakDuration: number, 
    longBreakInterval: number,
}
export type DBPomorodo = Pomodoro & {_id?: ObjectId, userID: string}

export type Pomodoros = Pomodoro[];

export type Session={
    pomodoroNumber: number,
    taskCompleted: number,
    date: string
}
export type Sessions=Session[];

export type Task = {
    id?: ObjectId
    taskName: string,
    taskStatus: string,
    taskCompleted: boolean
}
export type Tasks=Task[];

export function isNote(note: any): note is Note {
    return "title" in note && "lastEdit" in note && "content" in note && "created" in note;
}

export function isNoteList(note: any): note is Notes {
    return Array.isArray(note) && note.every(isNote);
}

export function isPomodoro(pomodoro: any): pomodoro is Pomodoro {
    return "pomodoroNumber" in pomodoro && "pomodoroType" in pomodoro && "pomodoroDuration" in pomodoro && "shortBreakDuration" in pomodoro && "longBreakDuration" in pomodoro && "longBreakInterval" in pomodoro;
}

export function isSession(session: any): session is Session {
    return "pomodoroNumber" in session && "taskCompleted" in session && "date" in session;
}

export function isTask(task: any): task is Task {
    return "taskName" in task && "taskStatus" in task && "taskCompleted" in task;
}

export type EventDB = Event | Note & {
    userID: string
}

