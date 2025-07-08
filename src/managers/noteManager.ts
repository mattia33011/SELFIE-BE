import noteRepository from "../repositories/noteRepository";
import {Note, Notes} from "../types/event";

class NoteManager {
    public async fetchNotes(userID: string, dateFilter?: Date): Promise<Notes> {
        return noteRepository
            .readNote(userID, dateFilter)
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
                    droppable: note.droppable,
                    lastEdit: note.lastEdit,
                }))
            })
    }

    public async insertNote(note: Note, userID: string): Promise<boolean> {
        return noteRepository.saveNote(note, userID).then(it => it.acknowledged)
    }
    async deleteNote(noteID: string, userID: string): Promise<boolean> {
        return noteRepository.delete(noteID, userID).then(it => it.deletedCount === 1)
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
                    droppable: note.droppable,
                    lastEdit: note.lastEdit,
                }))
            })
    }

    public async insertRecent(note: Note, userID: string): Promise<boolean> {
        return noteRepository.saveNote(note, userID).then(it => it.acknowledged)
    }
}

export const noteManager = new NoteManager();