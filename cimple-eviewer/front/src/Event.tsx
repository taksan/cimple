export class Event {
    id: string;
    date: string;
    content: string;
    isNew: boolean = false;
    constructor(id: string, date: string, content: string) {
        this.id = id;
        this.date = date;
        this.content = content;
    }
}
