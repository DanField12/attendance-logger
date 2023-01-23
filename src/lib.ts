import { attendee, newMember } from './types';
import HTTPError from 'http-errors';

let adultAttendees: attendee[] = [];
let kidsAttendees: attendee[] = [];
let newMembers: newMember[] = [];

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

export function memberNew(firstname: string, lastname: string, email: string, phone: string) {
  adultAttendees.push({firstname, lastname, date: new Date()});
  newMembers.push({firstname, lastname, email, phone});
  return {};
}

  // must compare dates first
export function csv(before: string, after: string) {
  return adultAttendees.reduce(
    (accumulator, curr) => `${accumulator}${curr.firstname},${curr.lastname}\n`, ""
  );
}