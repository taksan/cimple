import {Injectable} from '@angular/core';
import {map, Observable, Observer, Subject, Subscription} from "rxjs";
import {AnonymousSubject} from "rxjs/internal/Subject";
import {environment} from "../environments/environment";
import {MyIdService} from "./my-id.service";

export class Message {
  type: string = ""
  message: string = ""
  details: any = null
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private subject: AnonymousSubject<MessageEvent> | null = null;
  private messages: Subject<Message>

  constructor(private myId: MyIdService) {
    let wsUrl = environment.backendUrl.replace('http', 'ws')
    this.messages = <Subject<Message>>this.connect(`${wsUrl}/ws`).pipe(
      map(
        (response: MessageEvent): Message => {
          return JSON.parse(response.data)
        }
      )
    );
  }

  public subscribe(observerOrNext?: Partial<Observer<Message>> | ((value: Message) => void) | undefined): Subscription {
    return this.messages.subscribe(observerOrNext)
  }

  public connect(url: string): AnonymousSubject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
    }
    return this.subject
  }

  public create(url: string): AnonymousSubject<MessageEvent> {
    let ws = new WebSocket(url);
    ws.onopen = (evt) => {
      console.log(`Connected, will send my id ${this.myId.get()}`);
      ws.send(JSON.stringify({clientId: this.myId.get()}))
    }
    let observable = new Observable((obs: Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return ws.close.bind(ws)
    })

    // noinspection JSUnusedGlobalSymbols
    let observer = {
      // error and complete must be defined to be compatible with subject
      error: () => {},
      complete: () => {},
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    }
    return new AnonymousSubject<MessageEvent>(observer, observable);
  }
}
