import {Repository} from "./repository";
import {Collection, ObjectId} from "mongodb";
import {Note} from "../types/event";

class NoteRepository extends Repository {
    private readonly events: Collection;

    constructor() {
        super("notes");
        this.events = this.collection
    }

    async save(event: Note, userID: string) {
        return this.events.insertOne({...event, userID: userID});
    }

    async readNote(userID: string, dateFilter?: Date) {
        dateFilter = dateFilter ?? new Date();
        return this.events.find({userID: userID, lastEdit: {$lte: dateFilter.toISOString()}}).toArray();
    }

    async updateNote(noteID: ObjectId, note: Note) {
        return this.events.updateOne({$and: [{_id: noteID}]}, {$set: {...note, lastEdit: new Date()}});
    }
}

const noteRepository = new NoteRepository()

export default noteRepository;