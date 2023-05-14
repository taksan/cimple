import React, {useEffect} from 'react';
import './App.css';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootswatch/dist/sketchy/bootstrap.css';
import {Event} from "./Event";
import {EventTable} from "./EventTable";
import useWebSocket, { ReadyState } from 'react-use-websocket';

console.log(window.location.host);
function App() {
    const [events, setEvents] = React.useState<Event[]>([]);
    useEffect(() => {
        fetch("/api/events")
            .then(serverEvents => serverEvents.json())
            .then(eventsFromServer => setEvents(eventsFromServer.reverse()));
    }, [])

    const { lastMessage } = useWebSocket(`ws://${window.location.host}/socket`, {
        onOpen: () => {
          console.log('WebSocket connection established.');
        },
        share: true,
        filter: () => false,
        retryOnError: true,
        shouldReconnect: () => true,
        onMessage: message => {
            let event = JSON.parse(message.data);
            setEvents(events => [event, ...events ]);
        }
    });
    // useEffect(() => {
    //     let ws = new WebSocket('ws://localhost:5000/socket');
    //     ws.addEventListener('error', function (m) {
    //         console.log(m);
    //     });
    //     ws.addEventListener('open', function (m) {
    //         console.log("websocket connection open");
    //     });
    //     ws.addEventListener('message', function (m) {
    //         let event = JSON.parse(m.data);
    //         setEvents(events => [event, ...events ]);
    //     });
    //     return () => {
    //         // Clean up the WebSocket connection on component unmount
    //         ws.close()
    //     };
    // }, []);

    return (
        <div className="container">
            <h1>CImple Event Viewer</h1>
            <EventTable events={events}/>
        </div>
    );
}

export default App;
