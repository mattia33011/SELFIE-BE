import {Repository} from "./repository";
import {Collection, ObjectId} from "mongodb";
import {CalendarEvent, Note} from "../types/event";

class EventRepository extends Repository {
    private readonly events: Collection;

    constructor() {
        super("events");
        this.events = this.collection;
    }

    async save(event: CalendarEvent, userID: string) {
        return this.events.insertOne({...event, userID: userID});
    }
    async delete(eventID: string, userID: string) {
        return this.events.deleteOne({$and: [{_id: new ObjectId(eventID)}, {userID: userID}]});
    }

    async readEventById(userID: string) {
        return this.events.find({$and: [{userID: userID}]}).toArray();
    }
    async updateNote(noteID: ObjectId, note: Note) {
        return this.events.updateOne({$and: [{_id: noteID}]}, {$set: {...note, lastEdit: new Date()}});
    }
    async readEvent(eventID: ObjectId){
        return this.events.findOne({_id:eventID})
    }
    async update(event: CalendarEvent, eventID: string){
        return this.events.updateOne({$and: [{_id: new ObjectId(eventID)}]}, {$set: event})
    }
}

const eventRepository = new EventRepository()

export default eventRepository;