import { attendee, fullName, newMember } from './types';
import HTTPError from 'http-errors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import axios from "axios";
import { key } from './elvanto-api-key.json'
import { PrintQueue } from './print';

let newMembers: newMember[] = [];

export function doHash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function memberRegular(id: string, printQueue: PrintQueue, adultAttendees: attendee[], people: Map<string, fullName>) {
  if (!people.has(id)) throw HTTPError(403, 'Invalid id.');
  const { firstname, lastname } = people.get(id);
  printQueue.push(firstname + ',' + lastname);
  adultAttendees.push({ id, firstname, lastname, date: new Date()});
  console.log(adultAttendees);
  return {};
}

export function regularGetAll(adultAttendees: attendee[]) {
  return { attendees: adultAttendees.map(attendee => {
    return {
      firstname: attendee.firstname,
      lastname: attendee.lastname,
      date: format(attendee.date, 'H:mm'),
    }
  })};
}

/**
 * 
 * @returns all the new people from this session
 */
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

/**
 * Creates a new member and registers them in elvanto. Puts them in the 'New person' people flow in elvanto as well
 * @param firstname The new user's firstname.
 * @param lastname The new user's lastname.
 * @param contact The new user's either phone number or email.
 * @param adultAttendees The array of attendees created in index.ts.
 */
export async function memberNew(firstname: string, lastname: string, contact: string, adultAttendees: attendee[]) {
  let payload;
  if (contact.includes('@')) {
    payload = { firstname, lastname, email: contact }
  } else {
    payload = { firstname, lastname, phone: contact }
  }

  let personId = await axios.post('https://api.elvanto.com/v1/people/create.json', 
    {...payload, category_id: '0ee3d6b3-d425-4eba-a714-a34b1dfa504e'},
    { auth: { username: key, password: 'x' }
  }).then(result => { 
    console.log(result);
    return result.data.person.id
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

  adultAttendees.push({ id: personId, firstname, lastname, date: new Date()});
  newMembers.push({...payload, date: new Date()});
}