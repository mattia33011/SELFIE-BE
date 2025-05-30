import {Event, Events} from "../types/event";
import eventRepository from "../repositories/eventRepository";

class EventManager {
    public async fetchEvents(userID: string): Promise<Events> {
        return eventRepository
            .readEventById(userID)
            .then(notes => {
                return notes.map<Event>(note  => ({
                    title: note.title,
                    color: note.color,
                    expireDate: note.expireDate,
                    description: note.description,
                }))
            })
    }
    public async insert(event: Event, userID: string): Promise<boolean> {
        return eventRepository.save(event, userID).then(it => it.acknowledged)
    }
}

export const eventManager = new EventManager();