import noteRepository from "../repositories/noteRepository";
import {Note, Notes} from "../types/event";

class NoteManager {
    public async fetchNotes(userID: string, dateFilter?: Date): Promise<Notes> {
        return noteRepository
            .readNote(userID, dateFilter)
            .then(notes => {
                console.log(notes);
                return notes.map<Note>(note  => ({
                    content: note.content,
                    created: note.created,
                    lastEdit: note.lastEdit,
                    title: note.title,
                    color: note.color
                }))
            })
    }

    public async insert(note: Note, userID: string): Promise<boolean> {
        return noteRepository.save(note, userID).then(it => it.acknowledged)
    }
}

export const noteManager = new NoteManager();