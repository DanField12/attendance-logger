import { attendee, newMember, fullName } from './types';
import HTTPError from 'http-errors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import axios from 'axios';
import { key } from './elvanto-api-key.json'

let adultAttendees: attendee[] = [];
let newMembers: newMember[] = [];
let printQueue: string[] = [];

function doHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function getSessions(): string[] {
  return JSON.parse(fs.readFileSync(path.join(__dirname, './sessions.json')).toString()).sessions;
}

function saveSessions(sessions: string[]) {
  fs.writeFileSync(path.join(__dirname, './sessions.json'), JSON.stringify({ sessions: sessions }));
}

export async function getPeople(): Promise<fullName[]> {
  let people: fullName[] = [];
  let i = 1;
  while (true) {
    let result = await axios.get(`https://api.elvanto.com/v1/people/getAll.json?page=${i}`, {
      auth: { username: key, password: 'x' }
    });
    for (let person of await result.data.people.person) {
      people.push({ firstname: person.firstname, lastname: person.lastname })
    }
    i++;
    if (result.data.people.on_this_page < 1000) break;
  }
  return people;
}

export function memberRegular(firstname: string, lastname: string) {
  if (firstname === '' || firstname === undefined) throw HTTPError(400, 'firstname is invalid');
  if (lastname === '' || lastname === undefined) throw HTTPError(400, 'lastname is invalid');
  for (let attendee of adultAttendees) {
    if (attendee.firstname === firstname && attendee.lastname === lastname) {
      throw HTTPError(400, 'user has already signed in');
    }
  }
  printQueue.push(firstname);
  adultAttendees.push({ firstname, lastname, date: new Date()});
  console.log(adultAttendees);
  return {};
}

export function regularGetAll() {
  return { attendees: adultAttendees.map(attendee => {
    return {
      firstname: attendee.firstname,
      lastname: attendee.lastname,
      date: format(attendee.date, 'H:mm'),
    }
  })};
}

export function newGetAll() {
  return { attendees: newMembers.map(attendee => {
    return {
      firstname: attendee.firstname,
      lastname: attendee.lastname,
      email: attendee.email,
      phone: attendee.phone,
      date: format(attendee.date, 'H:mm'),
    }
  })};
}

export function memberNew(firstname: string, lastname: string, email: string, phone: string) {
  printQueue.push(firstname);
  adultAttendees.push({firstname, lastname, date: new Date()});
  newMembers.push({firstname, lastname, email, phone, date: new Date()});
  return {};
}

export function csv(sessionId: string, before: number, after: number) {
  let sessions = getSessions();
  if (!sessions.includes(sessionId)) throw HTTPError(403, 'invalid session');

  let beforeDate = new Date();
  beforeDate.setHours(before);
  beforeDate.setMinutes(0);
  let afterDate = new Date();
  afterDate.setHours(after);
  afterDate.setMinutes(0);

  // return { text: adultAttendees.filter((curr))
  // }

  return { text: adultAttendees.reduce(
    (accumulator, curr) => {
      if (curr.date.getTime() > beforeDate.getTime() && curr.date.getTime() < afterDate.getTime()) {
        return `${accumulator}${curr.firstname},${curr.lastname}\n`
      }
      return accumulator;
    }, ""
  )};
}

export function clear(sessionId: string) {
  let sessions = getSessions();
  if (!sessions.includes(sessionId)) throw HTTPError(403, 'invalid session');
  adultAttendees = [];
  return {};
}

export function adminLogIn(password: string) {
  if (password === '123') {
    let sessionId = Math.random().toString().slice(2);
    let sessions = getSessions();
    sessions.push(sessionId);
    saveSessions(sessions);
    return { sessionId: sessionId };
  }
  throw HTTPError(403, 'incorrect password');
}

export function getPrintQueue() {
  let res = printQueue.join()
  printQueue = [];
  return res;
}