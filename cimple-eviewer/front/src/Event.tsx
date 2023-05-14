export class Event {
    id: string;
    date: string;
    content: string;
    constructor(id: string, date: string, content: string) {
        this.id = id;
        this.date = date;
        this.content = content;
    }
}
