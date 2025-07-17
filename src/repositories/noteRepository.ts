import {Repository} from "./repository";
import {Collection, ObjectId} from "mongodb";
import {Note} from "../types/event";

class NoteRepository extends Repository {
    private readonly notes: Collection;

    deleteNote(noteID: string, userID: string) {
        return this.notes.deleteOne({
            $and: [{_id: new ObjectId(noteID)}, {userID: userID}] 
        })
    }
    

    constructor() {
        super("notes");
        this.notes = this.collection
    }
    async findByUser(username: string) {
        return this.notes.find({
            $or:[{ author: username}, { members: username }]
        }).toArray();
    }

    async saveNote(event: Note, userID: string) {
        return this.notes.insertOne({...event, userID: userID});
    }

    async readNote(userID: string, dateFilter?: Date) {
        return this.notes.find({user:userID , lastEdit: {$gte: dateFilter || new Date(0)}}).toArray();
    }

    async updateNote(noteID: ObjectId, note: Note) {
        return this.notes.updateOne({$and: [{_id: noteID}]}, {$set: {...note, lastEdit: new Date()}});
    }
    async readRecentNote(userID: string) {
        return this.notes.find({userID: userID}).sort({lastEdit: -1}).limit(5).toArray();
    }
}

const noteRepository = new NoteRepository()

export default noteRepository;