import { ObjectId } from "mongodb";

export  type CalendarEvent = {
  title: string;
  color?: string;
  start?: Date | string;
  end?: Date | string;
  allDay?: boolean;
  _id: ObjectId;
  rrule: any;
  extendedProps?: {
    luogo?: string;
    tipo?: 'attività' | 'evento';
    stato?: 'da_fare' | 'in_corso' | 'completata';
  };
}

export type Events = CalendarEvent[];

export function isEvent(event: any): event is CalendarEvent {
    if (event.allDay==true)
        return "title" in event && "color" in event;
    else
        return "title" in event && "end" in event && "color" in event;
}

export function isEventid(event: any): event is CalendarEvent {
    if (event.allDay==true)
        return "title" in event && "color" in event && "_id" in event;
    else
        return "title" in event && "end" in event && "color" in event && "_id" in event;
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

