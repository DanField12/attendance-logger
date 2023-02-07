import { attendee, newMember } from './types';
import HTTPError from 'http-errors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import axios from "axios";
import { key } from './elvanto-api-key.json'
import { PrintQueue } from './print';

let adultAttendees: attendee[] = [];
let newMembers: newMember[] = [];

export function doHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function getSessions(): string[] {
  return JSON.parse(fs.readFileSync(path.join(__dirname, './sessions.json')).toString()).sessions;
}

function saveSessions(sessions: string[]) {
  fs.writeFileSync(path.join(__dirname, './sessions.json'), JSON.stringify({ sessions: sessions }));
}

export function memberRegular(firstname: string, lastname: string, printQueue: PrintQueue) {
  if (firstname === '' || firstname === undefined) throw HTTPError(400, 'firstname is invalid');
  if (lastname === '' || lastname === undefined) throw HTTPError(400, 'lastname is invalid');
  for (let attendee of adultAttendees) {
    if (attendee.firstname === firstname && attendee.lastname === lastname) {
      throw HTTPError(400, 'user has already signed in');
    }
  }
  printQueue.push(firstname + ',' + lastname);
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

export async function memberNew(firstname: string, lastname: string, email: string, phone: string) {
  let personId = await axios.post('https://api.elvanto.com/v1/people/create.json', 
    { firstname, lastname, email, phone, category_id: '0ee3d6b3-d425-4eba-a714-a34b1dfa504e' }, 
    { auth: { username: key, password: 'x' }
  }).then(result => { return result.data.person.id
  }).catch(err => { 
    console.log(err);
    throw HTTPError(500, 'Error connecting to elvanto in create')
  });

  await axios.post('https://api.elvanto.com/v1/peopleFlows/steps/addPerson.json',
    { step_id: 'c6ca4b16-3e4b-4c97-841b-507e623d4db6', person_id: personId },
    { auth: { username: key, password: 'x' }
  }).catch(err => { 
    console.log(err);
    throw HTTPError(500, 'Error connecting to elvanto in addPerson');
  });

  adultAttendees.push({firstname, lastname, date: new Date()});
  newMembers.push({firstname, lastname, email, phone, date: new Date()});
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
  const correctPassword = fs.readFileSync(path.join(__dirname, './hashed-password')).toString()
  if (doHash(password) === correctPassword) {
    let sessionId = Math.random().toString().slice(2);
    let sessions = getSessions();
    sessions.push(sessionId);
    saveSessions(sessions);
    return { sessionId: sessionId };
  }
  throw HTTPError(403, 'incorrect password');
}
