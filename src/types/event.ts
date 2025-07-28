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
    label: string;
    expanded: boolean;
    content: string;
    icon: string;
    children: ObjectId[];
    type: 'note' | 'folder';
    parent: string | null | ObjectId;
    droppableNode: boolean;
    lastEdit: Date;
    _id?: ObjectId;
    data?: string;
};

export type Pomodoro = {
    pomodoroNumber: number,
    pomodoroType: string, //mi dice se siamo ad un pomodoro o una pausa (lunga o corta)
    //settings per il pomodoro
    pomodoroDuration: number,
    shortBreakDuration: number,
    longBreakDuration: number, 
    longBreakInterval: number,
    id: string
}
export type DBPomorodo = Pomodoro & {userID: string}

export type Pomodoros = Pomodoro[];

export type StudySession={
    id: number,
    _id: ObjectId,
    pomodoroNumber: number,
    taskCompleted: number,
    date: string
}
export type StudySessions=StudySession[];

export type Task = {
    _id?: ObjectId
    taskName: string,
    taskStatus: string,
    taskCompleted: boolean
}
export type Tasks=Task[];

export function isNote(note: any): note is Note {
    return "children" in note && "content" in note && "droppableNode" in note && "expanded" in note && "icon" in note && "label" in note && "lastEdit" in note && "parent" in note && "type" in note;
}

export function isNoteList(note: any): note is Notes {
    return Array.isArray(note) && note.every(isNote);
}

export function isPomodoro(pomodoro: any): pomodoro is Pomodoro {
    return "pomodoroNumber" in pomodoro && "pomodoroType" in pomodoro && "pomodoroDuration" in pomodoro && "shortBreakDuration" in pomodoro && "longBreakDuration" in pomodoro && "longBreakInterval" in pomodoro;
}

export function isSession(session: any): session is StudySession {
    if(session === null) return false;
    return "pomodoroNumber" in session && "taskCompleted" in session && "date" in session;
}

export function isTask(task: any): task is Task {
    return "taskName" in task && "taskStatus" in task && "taskCompleted" in task;
}

export type EventDB = Event | Note & {
    userID: string
}

