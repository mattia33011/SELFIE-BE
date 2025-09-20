import userRepository from "../repositories/userRepository";
import noteRepository from "../repositories/noteRepository";
import { Note, Notes } from "../types/event";
import { getSelfieError } from "../types/errors";
import { ObjectId } from "mongodb";

class NoteManager {
  private normalizeNote(note: any): Note {
    return {
      _id: note._id?.toString(),
      label: note.label,
      expanded: note.expanded ?? false,
      content: note.content ?? "",
      icon: note.icon ?? "pi pi-clipboard",
      type: note.type,
      parent: note.parent ?? null,
      droppableNode: note.droppableNode ?? false,
      lastEdit: note.lastEdit ? new Date(note.lastEdit) : new Date(),
      children: note.children?.map((child: any) => {
        return this.normalizeNote(child);
      }),
    };
  }

  public async fetchNotes(userID: string): Promise<Notes> {
    
    const files = await noteRepository.readNote(userID);
    const fileWithParent = files.filter((it) => it.parent);
    const fileWithoutParent = files.filter((it) => !it.parent);

    fileWithParent.forEach((it) => {
      const folder = files.find(
        (f) => f._id == it.parent && f.type == "folder"
      );
      if (!folder) return;

      folder.children.push(it);
    });

    return [...fileWithoutParent];
  }

  public async insertNote(note: Note, userID: string): Promise<Note> {
    const result = await noteRepository.saveNote(note, userID);
    if (!result.acknowledged) throw new Error("Insert failed");
    return { ...note, _id: result.insertedId };
  }

  public async moveNote(
    noteID: string,
    folderID: string,
    userID: string
  ): Promise<boolean> {
    const isSame = noteID == folderID;
    const note = (await noteRepository.readNoteByIdLinkedToUser(
      noteID
    )) as Note & { _id: ObjectId };
    const folder = isSame
      ? undefined
      : ((await noteRepository.readNoteByIdLinkedToUser(folderID)) as Note & {
          _id: ObjectId;
        });

    if (!note || (!folder && !isSame))
      throw getSelfieError("404", 404, "Note or folder not found", {
        note: note,
        folder: folder,
      });

    if (!isSame) note.parent = folder!._id.toString();
    else note.parent = null;
    const result = await noteRepository.updateNote(note);

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
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      console.error(`[NoteManager] Error deleting note ${noteID}:`, error);
      throw new Error(
        `Failed to delete note: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  public async fetchRecentNotes(userID: string): Promise<Notes> {
    return noteRepository.readRecentNote(userID).then((notes) => {
      return notes.map<Note>((note) => ({
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
      }));
    });
  }
  public async saveNote(noteID: string, text: string){
    return await noteRepository.collection.updateOne({_id: new ObjectId(noteID)}, {$set: {content: text}})
  }
  public async insertRecent(note: Note, userID: string): Promise<boolean> {
    return noteRepository.saveNote(note, userID).then((it) => it.acknowledged);
  }
}

export const noteManager = new NoteManager();
