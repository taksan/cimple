import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders event table with fetched events', async () => {
    // Mock the fetch function to return sample events
    // @ts-ignore
    jest.spyOn(window, 'fetch').mockResolvedValueOnce({
      json: () =>
        Promise.resolve([
          { id: 1, date: '2023-05-14', content: 'Event 1' },
          { id: 2, date: '2023-05-15', content: 'Event 2' },
        ]),
    });

    // Render the App component
    render(<App />);

    // Wait for the fetch and event rendering to complete
    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
    });

    // Verify that the fetch function was called with the correct URL
    expect(window.fetch).toHaveBeenCalledWith('/api/events');
  });
});
