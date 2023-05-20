import React from 'react';
import {render, waitFor, screen, act} from '@testing-library/react';
import App from './App';
import WS from "jest-websocket-mock";

describe('App', () => {
    test('should render events table', async () => {
        // Mock the fetch function to return sample events
        // @ts-ignore
        jest.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: () =>
                Promise.resolve([
                    {id: 1, date: '2023-05-14', content: 'Event 1', environment: 'dev'},
                    {id: 2, date: '2023-05-15', content: 'Event 2', environment: 'prod'},
                ]),
        });

        // Render the App component
        render(<App/>);

        // Wait for the fetch and event rendering to complete
        await waitFor(() => {
            expect(screen.getByTestId('event-1-content')).toHaveTextContent("Event 1")
            expect(screen.getByTestId('event-2-content')).toHaveTextContent("Event 2")
            expect(screen.getByTestId('event-1-environment')).toHaveTextContent("dev")
            expect(screen.getByTestId('event-2-environment')).toHaveTextContent("prod")
        });

        // Verify that the fetch function was called with the correct URL
        expect(window.fetch).toHaveBeenCalledWith('/api/events');
    });

    test('should render new messages and flash it in and out', async () => {
        const server = new WS("ws://localhost/socket");

        // @ts-ignore
        jest.spyOn(window, 'fetch').mockResolvedValueOnce({
            json: () =>
                Promise.resolve([
                    {id: 1, date: '2023-05-14', content: 'Event 1', environment: 'dev' },
                    {id: 2, date: '2023-05-15', content: 'Event 2', environment: 'dev'},
                ]),
        });

        // Render the App component
        render(<App/>);
        await server.connected
        jest.useFakeTimers()
        server.send('{"id": 3, "date": "2023-05-14", "content": "This is a new message"}')

        // Wait for the fetch and event rendering to complete
        await waitFor(() => screen.getByText('Event 1'));


        await waitFor(() => {
          expect(screen.getByText('This is a new message')).toBeInTheDocument();
          expect(screen.getByTestId('event-3')).toHaveClass('flash')
        })

        act(() => {
          jest.advanceTimersByTime(2000);
        });
        expect(screen.getByTestId('event-3')).not.toHaveClass('flash')
        jest.useRealTimers()

        server.close()
    });
});
