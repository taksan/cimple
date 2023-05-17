import {Injectable} from '@angular/core';
import {adjectives} from "./utils/adjectives"
import {nouns} from "./utils/nouns";

@Injectable({
  providedIn: 'root'
})
export class MyIdService {
  myId: string;
  constructor() {
    this.myId = localStorage.getItem('myId') || this.generate()
    localStorage.setItem('myId', this.myId)
  }

  get(): string {
    return this.myId
  }

  logout() {
    localStorage.removeItem('myId')
  }


  private generate() : string {
    let name1 = adjectives;
    let name2 = nouns;

  return this.capFirst(name1[this.getRandomInt(0, name1.length + 1)])
      + ' ' +
      this.capFirst(name2[this.getRandomInt(0, name2.length + 1)]);
  }

  private capFirst(generated: string):string {
    return generated.charAt(0).toUpperCase() + generated.slice(1);
  }

  private getRandomInt(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min)) + min;
  }

}
