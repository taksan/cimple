import React, {useEffect} from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootswatch/dist/sketchy/bootstrap.css';
import {Event} from "./Event";
import {EventTable} from "./EventTable";
import useWebSocket from 'react-use-websocket';

function App() {
    const [events, setEvents] = React.useState<Event[]>([]);
    useEffect(() => {
        fetch("/api/events")
            .then(serverEvents => serverEvents.json())
            .then(eventsFromServer => setEvents(eventsFromServer.reverse()));
    }, [])

    useWebSocket(`ws://${window.location.host}/socket`, {
        onOpen: () => {
          console.log('WebSocket connection established.');
        },
        share: true,
        filter: () => false,
        retryOnError: true,
        shouldReconnect: () => true,
        onMessage: message => {
            let event = JSON.parse(message.data);
            event.isNew = true
            let updated = [event, ...events ]
            setEvents(events => updated);
            setTimeout(() => {
                event.isNew = false;
                let updatedEvents = updated.slice()
                setEvents(updatedEvents)
            }, 2000)
        }
    });

    return (
        <div className="container">
            <h1>CImple Event Viewer</h1>
            <a href="{{FRONT_URL}}">Cimple Front</a>
            <EventTable events={events}/>
        </div>
    );
}

export default App;
