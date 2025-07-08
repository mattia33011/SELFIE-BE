import {Task} from "./task"
import {ObjectId} from "mongodb";

export type Project = {
    id: string;
    tasks: Task[];
    name: string;
    note: string;
    author: string;
    expire: Date;
    start: Date;
    members: string[];
};

export type ProjectCreateRequest = Omit<Project, "id" | "author">