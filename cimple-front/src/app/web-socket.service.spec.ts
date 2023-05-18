import {WebSocketService} from './web-socket.service';
import {MyIdService} from './my-id.service';
import {WS} from 'jest-websocket-mock';

describe('WebSocketService', () => {
  let myIdServiceSpy: jest.Mocked<MyIdService>;

  beforeEach(() => {
    const myIdServiceSpyObj = {
      get: jest.fn()
    };

    myIdServiceSpy = myIdServiceSpyObj as unknown as jest.Mocked<MyIdService>;
  });
  afterEach(() => {
    WS.clean()
  })

  it('should send the client ID on connection', async () => {
    const clientId = 'my-client-id';
    myIdServiceSpy.get.mockReturnValue(clientId);
    let server = new WS("ws://localhost:8000/ws");
    let webSocketService: WebSocketService = new WebSocketService(myIdServiceSpy);

    await server.connected
    // @ts-ignore
    await expect(server).toReceiveMessage(JSON.stringify({clientId: "my-client-id"}));

    let messages: any[] = []
    webSocketService.messages.subscribe(message => {
      expect(message.type).toEqual("some")
      messages.push(message)
    })
    server.send(JSON.stringify({type: "some", message: "yes"}))
    expect(messages).toEqual([{type: "some", message: "yes"}])

    webSocketService.messages.next({type: "hello", message: "good bye", details: null})
    // @ts-ignore
    await expect(server).toReceiveMessage(JSON.stringify({type: "hello", message: "good bye", details: null}));

    server.close()
  });
});
