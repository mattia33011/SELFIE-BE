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
async findByUser(username: string): Promise<Note[]> {
    const note= this.notes.find({
        $or: [{ author: username }, { members: username }]
    })
    .toArray();
    console.log('Documenti dal DB:', note);

    return (await note).map(doc => ({
        _id: doc._id, // Mantieni l'ObjectId originale
        label: doc.label, // Prendi quello che c'è (può essere undefined)
        author: doc.author,
        members: doc.members,
        expanded: doc.expanded,
        content: doc.content,
        icon: doc.icon,
        children: doc.children,
        type: doc.type,
        parent: doc.parent,
        droppableNode: doc.droppableNode,
        lastEdit: doc.lastEdit
    }));
}

    async saveNote(event: Note, userID: string) {
        return this.notes.insertOne({...event, userID: userID});
    }

    async readNote(userID: string) {
        return this.notes.find({user:userID}).toArray();
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