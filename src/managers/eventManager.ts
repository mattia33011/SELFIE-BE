import {CalendarEvent, Events} from "../types/event";
import eventRepository from "../repositories/eventRepository";

class EventManager {
    public async fetchEvents(userID: string): Promise<Events> {
        return eventRepository
            .readEventById(userID)
            .then(notes => {
                return notes.map<CalendarEvent>(note  => ({
                    title: note.title,
                    color: note.color,
                    end: note.end,
                    start: note.start,
                    _id: note._id,
                    allDay: note.allDay,
                    extendedProps: {
                        luogo: note.luogo,
                        tipo: note.tipo,
                        stato: note.stato,
                    }
                }))
            })
    }
    public async insert(event: CalendarEvent, userID: string): Promise<boolean> {
        return eventRepository.save(event, userID).then(it => it.acknowledged)
    }
    public async delete(eventID: string, userID: string): Promise<boolean> {
        return eventRepository.delete(eventID, userID).then(it => it.acknowledged);
    }
    /* public async update(event: Event, userID: string): Promise<boolean> {
        return eventRepository.update(event, userID).then(it => it.acknowledged);
    } */
}

export const eventManager = new EventManager();