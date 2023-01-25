import { attendee, newMember } from './types';
import HTTPError from 'http-errors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns'

let adultAttendees: attendee[] = [];
let kidsAttendees: attendee[] = [];
let newMembers: newMember[] = [];

function doHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function getSessions(): string[] {
  return JSON.parse(fs.readFileSync(path.join(__dirname, './sessions.json')).toString()).sessions;
}

function saveSessions(sessions: string[]) {
  fs.writeFileSync(path.join(__dirname, './sessions.json'), JSON.stringify({ sessions: sessions }));
}

export function memberRegular(firstname: string, lastname: string) {
  for (let attendee of adultAttendees) {
    if (attendee.firstname === firstname && attendee.lastname === lastname) {
      throw HTTPError(400, 'user has already signed in');
    }
  }
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