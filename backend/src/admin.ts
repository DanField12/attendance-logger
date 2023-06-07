import HTTPError from 'http-errors';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns'
import { doHash } from './attendance';
import { attendee } from './types';

const gatherings = {'5:15pm': '515pm Gathering', '10am': '10am Gathering', '8am': '8am Gathering'};
const serviceTimes = {'5:15pm': '05:15 PM', '10am': '10:00 AM', '8am': '08:00 AM'};

function getSessions(): string[] {
  return JSON.parse(fs.readFileSync(path.join(__dirname, './sessions.json')).toString()).sessions;
}

function saveSessions(sessions: string[]) {
  fs.writeFileSync(path.join(__dirname, './sessions.json'), JSON.stringify({ sessions: sessions }));
}

export function csv(sessionId: string, adultAttendees: attendee[], service) {
  let sessions = getSessions();
  if (!sessions.includes(sessionId)) throw HTTPError(403, 'invalid session');

  return { text: 'First Name,Last Name,Service Date & Time,Location,Check-In Time\n' + adultAttendees.reduce(
    (accumulator, curr) => `${accumulator}${curr.firstname},${curr.lastname},${format(curr.date, 'd/MM/y')} ${serviceTimes[service]},${gatherings[service]},${format(curr.date, 'H:mm')}\n`, ""
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
