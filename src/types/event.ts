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
    title: string,
    lastEdit: Date,
    created: Date,
    content: string,
    color?: string
}

export function isNote(note: any): note is Note {
    return "title" in note && "lastEdit" in note && "content" in note && "created" in note;
}

export type EventDB = Event | Note & {
    userID: string
}

