import {Event} from "./Event";
import {format} from "date-fns";
import React from "react";

export function EventTable({events}: { events: Event[] }) {
    return (
        <table className="table table-hover task-list">
            <thead>
            <tr className="table-dark">
                <th className="col-2">Environment</th>
                <th className="col-2">Date</th>
                <th className="col-8">Event</th>
            </tr>
            </thead>
            <tbody>
            {events.map((event: Event) => (
                <tr key={event.id} data-testid={"event-" + event.id} className={event.isNew ? "flash": ""}>
                    <td data-testid={"event-" + event.id + "-environment"}>{event.environment}</td>
                    <td>{format(new Date(event.date), 'dd/MM/yyyy HH:mm')}</td>
                    <td data-testid={"event-" + event.id + "-content"}>{event.content}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}
