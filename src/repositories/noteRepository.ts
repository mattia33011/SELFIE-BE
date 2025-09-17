import {Repository} from "./repository";
import {Collection, ObjectId} from "mongodb";
import {Note} from "../types/event";
import timeMachine from "../managers/timeMachine";

class NoteRepository extends Repository {
    private readonly notes: Collection;

    constructor() {
        super("notes");
        this.notes = this.collection
    }

async deleteNote(noteID: string, userIdentifier: string): Promise<{ success: boolean, deletedCount: number }> {
    try {
        // Validate inputs
        if (!noteID) {
            throw new Error('Note ID is required');
        }

        if (!ObjectId.isValid(noteID)) {
            throw new Error(`Invalid noteID format: ${noteID}`);
        }

        const noteObjectId = new ObjectId(noteID);

        // First remove from any parent's children array
        await this.notes.updateMany(
            { "children._id": noteObjectId },
            { $pull: { children: { _id: noteObjectId } } as any}
        );

        // Then delete the note itself and all its children recursively
        const deleteChildrenRecursive = async (parentId: ObjectId) => {
            const children = await this.notes.find({ parent: parentId }).toArray();
            for (const child of children) {
                await deleteChildrenRecursive(child._id);
                await this.notes.deleteOne({ _id: child._id });
            }
        };

        await deleteChildrenRecursive(noteObjectId);
        const deleteResult = await this.notes.deleteOne({ _id: noteObjectId });

        if (deleteResult.deletedCount === 0) {
            throw new Error('Note not found');
        }

        return {
            success: true,
            deletedCount: deleteResult.deletedCount
        };
    } catch (error) {
        console.error(`Error deleting note ${noteID}:`, error);
        throw error;
    }
}
 
async findByUser(username: string): Promise<Note[]> {
    const note= this.notes.find({
        $or: [{ author: username }, { members: username }]
    })
    .toArray();
    //console.log('Documenti dal DB:', note);

    return (await note).map(doc => ({
        _id: doc._id, // Mantieni l'ObjectId originale
        label: doc.label, // Prendi quello che c'è (può essere undefined)
        expanded: doc.expanded,
        content: doc.content,
        icon: doc.icon,
        children: doc.children,
        type: doc.type,
        parent: doc.parent,
        droppableNode: doc.droppableNode,
        lastEdit: doc.lastEdit,
    }));
}

async saveNote(event: any, userID: string) {
    const note = event["0"]; // Estrai la nota vera
    console.log(note);
    return this.notes.insertOne({ ...note, lastEdit: new Date(note.lastEdit), userID });
}

async readNote(userID: string) {
    const notes = await this.notes.find({ user: userID }).toArray();

    return notes
        .filter(doc => doc && typeof doc === 'object')
        .map(doc => ({
            _id: doc._id,
            label: doc.label,

            expanded: doc.expanded,
            content: doc.content,
            icon: doc.icon,
            children: doc.children,
            type: doc.type,
            parent: doc.parent,
            droppableNode: doc.droppableNode,
            lastEdit: doc.lastEdit
        }) as Note & {_id: ObjectId});
}
    async readNoteByIdLinkedToUser(noteID: string) {
        return this.notes.findOne({ _id: new ObjectId(noteID) });
    }
    async updateNote(note: Note) {
        return this.notes.updateOne({$and: [{_id: note._id}]}, {$set: {...note, lastEdit: timeMachine.getToday()}});
    }
    async readRecentNote(userID: string) {
        return this.notes.find({userID: userID}).sort({lastEdit: -1}).limit(5).toArray();
    }
}

const noteRepository = new NoteRepository()

export default noteRepository;