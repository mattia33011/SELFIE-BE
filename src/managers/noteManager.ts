import userRepository from "../repositories/userRepository";
import noteRepository from "../repositories/noteRepository";
import {Note, Notes} from "../types/event";

class NoteManager {
private normalizeNote(note: any): Note {
    return {
        _id: note._id?.toString(),
        label: note.label,
        expanded: note.expanded ?? false,
        content: note.content ?? '',
        icon: note.icon ?? 'pi pi-clipboard',
        type: note.type,
        parent: note.parent ?? null,
        droppableNode: note.droppableNode ?? false,
        lastEdit: note.lastEdit ? new Date(note.lastEdit) : new Date(),
        children: (note.children || []).map((child: any) => this.normalizeNote(child))
    };
}

public async fetchNotes(userID: string): Promise<Notes> {
    const user = await userRepository.read(userID);
    if (!user) {
        throw new Error('User not found');
    }
    const files = await noteRepository.readNote(user.username);
    const folders=files.filter(n=>n.type==='folder');
    let notes=files.filter(n=>n.type==='note');
    
    return [...folders.map(folder=>{
       
        folder.children=files.filter(note=>note.parent==folder._id)
        notes=notes.filter(note=>note.parent!=folder._id)
        console.log(folder);
        console.log(notes);
    }), ...notes].map(this.normalizeNote);
}

public async insertNote(note: Note, userID: string): Promise<Note> {
    const result = await noteRepository.saveNote(note, userID);
    if (!result.acknowledged) throw new Error("Insert failed");
    return { ...note, _id: result.insertedId };
}

public async moveNote(noteID: string, folderID: string, userID: string): Promise<boolean> {
    const note=await noteRepository.readNoteById(noteID) as any;
    const folder=await noteRepository.readNoteById(folderID) as any;
    
    /*
    if(folder.children){
        folder.children.push(note);
    }else{
        folder.children=[note];
    }
    */
   note.parent=folder._id;
    const result=await noteRepository.updateNote(note._id, note);
    //const result=await noteRepository.updateNote(folder._id, folder);

    //if(result.acknowledged) noteRepository.deleteNote(noteID, userID);
    return result.acknowledged;
}


    async deleteNote(noteID: string, userIdentifier: string) {
        try {
            const result = await noteRepository.deleteNote(noteID, userIdentifier);
            
            if (!result.success || result.deletedCount === 0) {
                throw new Error("Note not found or already deleted");
            }

            return {
                status: "success",
                message: "Note deleted successfully",
                deletedCount: result.deletedCount
            };
        } catch (error) {
            console.error(`[NoteManager] Error deleting note ${noteID}:`, error);
            throw new Error(`Failed to delete note: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public async fetchRecentNotes(userID: string): Promise<Notes> {
        return noteRepository
            .readRecentNote(userID)
            .then(notes => {
                console.log(notes);
                return notes.map<Note>(note  => ({
                    _id: note._id,
                    label: note.label,
                    expanded: note.expanded,
                    content: note.content,
                    icon: note.icon,
                    children: note.children,
                    type: note.type,
                    parent: note.parent,
                    droppableNode: note.droppableNote,
                    lastEdit: note.lastEdit,
                }))
            })
    }

    public async insertRecent(note: Note, userID: string): Promise<boolean> {
        return noteRepository.saveNote(note, userID).then(it => it.acknowledged)
    }
}

export const noteManager = new NoteManager();