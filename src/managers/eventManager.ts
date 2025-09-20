import { CalendarEvent, Events } from "../types/event";
import eventRepository from "../repositories/eventRepository";
import { ObjectId } from "mongodb";
import timeMachine from "./timeMachine";
import {
  compareDatesByDay,
  dateIsAfterOtherDate,
  dateIsBeforeOtherDate,
  dateIsBetweenOtherDates,
} from "../utils";

class EventManager {
  public async fetchEvents(userID: string): Promise<Events> {
    return eventRepository.readEventById(userID).then((notes) => {
      return notes.map<CalendarEvent>((note) => ({
        title: note.title,
        color: note.color,
        end: note.end,
        start: note.start,
        _id: note._id,
        rrule: note.rrule,
        allDay: note.allDay,
        extendedProps: {
          luogo: note.luogo,
          tipo: note.tipo,
          stato: note.stato,
        },
      }));
    });
  }
  public async fetchTodayEvents(userID: string): Promise<Events> {
    return eventRepository.readEventById(userID).then((events) => {
      return events
        .map<CalendarEvent>((event) => ({
          title: event.title,
          color: event.color,
          end: event.end,
          start: event.start,
          _id: event._id,
          rrule: event.rrule,
          allDay: event.allDay,
          extendedProps: {
            luogo: event.luogo,
            tipo: event.tipo,
            stato: event.stato,
          },
        }))
        .filter((it) => {
          const start = it.start ? new Date(it.start) : undefined;
          const end = it.end ? new Date(it.end) : undefined;
          const today = new Date(timeMachine.getToday());

          today.setHours(0);
          today.setMinutes(0);
          today.setSeconds(0);
          today.setMilliseconds(0);
          
          console.log("start", start);
          console.log("end", end);
          console.log("today", today);
          if (!start) return false;

          if (!end) {
            console.log("compareDatesByDay", compareDatesByDay(today, start));
            return compareDatesByDay(today, start);
          }
          console.log(
            "dateIsBetweenOtherDates",
            dateIsBetweenOtherDates(today, end, start)
          );
          return dateIsBetweenOtherDates(today, end, start);
        });
    });
  }
  public async insert(
    event: CalendarEvent,
    userID: string
  ): Promise<CalendarEvent> {
    const id = await eventRepository
      .save(event, userID)
      .then((it) => it.insertedId);
    return eventRepository.readEvent(id).then(
      (it) =>
        ({
          title: it?.title,
          color: it?.color,
          end: it?.end,
          start: it?.start,
          _id: it?._id,
          rrule: it?.rrule,
          allDay: it?.allDay,
          extendedProps: {
            luogo: it?.luogo,
            tipo: it?.tipo,
            stato: it?.stato,
          },
        } as CalendarEvent)
    );
  }
  public async delete(eventID: string, userID: string): Promise<boolean> {
    return eventRepository
      .delete(eventID, userID)
      .then((it) => it.acknowledged);
  }
  public async update(
    eventID: string,
    userID: string,
    event: CalendarEvent
  ): Promise<ObjectId | null> {
    return eventRepository.update(event, eventID).then((it) => it.upsertedId);
  }
}

export const eventManager = new EventManager();
