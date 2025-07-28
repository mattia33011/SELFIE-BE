import userRepository from "../repositories/userRepository";
import noteRepository from "../repositories/noteRepository";
import {Note, Notes} from "../types/event";

class NoteManager {
    public async fetchNotes(userID: string): Promise<Notes> {
        const user = await userRepository.read(userID);
        if (!user) {
            throw new Error('User not found');
        }

        const notes = await noteRepository.readNote(user.username);
        
        return notes

    }
    public async insertNote(note: Note, userID: string): Promise<boolean> {
        return noteRepository.saveNote(note, userID).then(it => it.acknowledged)
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