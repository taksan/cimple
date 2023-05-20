export class Event {
    id: string;
    date: string;
    content: string;
    isNew: boolean = false;
    environment: string;

    constructor(id: string, date: string, content: string, environment: string) {
        this.id = id;
        this.date = date;
        this.content = content;
        this.environment = environment;
    }
}
