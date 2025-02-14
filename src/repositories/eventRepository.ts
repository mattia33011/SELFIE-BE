import {Repository} from "./repository";
import {Collection, ObjectId} from "mongodb";
import {Event, Note} from "../types/event";

class EventRepository extends Repository {
    private readonly events: Collection;

    constructor() {
        super("events");
        this.events = this.collection;
    }

    async save(event: Event, userID: string) {
        return this.events.insertOne({...event, userID: userID});
    }

    readEventById(userID: string) {
        return this.events.find({$and: [{userID: userID}]}).toArray();
    }
    async updateNote(noteID: ObjectId, note: Note) {
        return this.events.updateOne({$and: [{_id: noteID}]}, {$set: {...note, lastEdit: new Date()}});
    }
}

const eventRepository = new EventRepository()

export default eventRepository;