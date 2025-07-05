export type Task = {
    id: string;
    name: string;
    input?: string;
    output?: string;
    isMilestone: boolean;
    start: Date;
    expire: Date;
    linkedTask: string[];
    status: TaskStatus;
    authors: string[];
};

export enum TaskStatus {
    NotStartable,
    Startable,
    Started,
    Done,
    ReStarted,
    Overdue,
    Abandoned,
}

export const TASK_STATUS = [
    'Startable',
    'Started',
    'Done',
    'ReStarted',
    'Abandoned',
];

export function taskStatusToString(status: TaskStatus) {
    switch (status) {
        default:
        case 0:
            return 'NotStartable';
        case 1:
            return 'Startable';
        case 2:
            return 'Started';
        case 3:
            return 'Done';
        case 4:
            return 'ReStarted';
        case 5:
            return 'Overdue';
        case 6:
            return 'Leaved';
    }
}