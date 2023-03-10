import HTTPError from 'http-errors';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns'
import { doHash } from './attendance';
import { attendee } from './types';

function getSessions(): string[] {
  return JSON.parse(fs.readFileSync(path.join(__dirname, './sessions.json')).toString()).sessions;
}

function saveSessions(sessions: string[]) {
  fs.writeFileSync(path.join(__dirname, './sessions.json'), JSON.stringify({ sessions: sessions }));
}

export function csv(sessionId: string, before: number, after: number, adultAttendees: attendee[]) {
  let sessions = getSessions();
  if (!sessions.includes(sessionId)) throw HTTPError(403, 'invalid session');

  return { text: 'First Name,Last Name,Service Date & Time,Location\n' + adultAttendees.reduce(
    (accumulator, curr) => {
        
      let beforeDate = new Date(curr.date);
      beforeDate.setHours(before, 0);
      let afterDate = new Date(curr.date);
      afterDate.setHours(after, 0);
      if (curr.date.getTime() > beforeDate.getTime() && curr.date.getTime() < afterDate.getTime()) {
        return `${accumulator}${curr.firstname},${curr.lastname},${format(curr.date, 'd/MM/y')} 05:15 PM,515pm Gathering\n`
      }
      return accumulator;
    }, ""
  )};
}

export function clear(sessionId: string, adultAttendees: attendee[]) {
  let sessions = getSessions();
  if (!sessions.includes(sessionId)) throw HTTPError(403, 'invalid session');
  adultAttendees.length = 0;
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

export function validSession(sessionId: string) {
  console.log(sessionId)
  let sessions = getSessions();
  if (!sessions.includes(sessionId)) throw HTTPError(403, 'invalid session');
  return {};
}
