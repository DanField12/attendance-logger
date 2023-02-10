import axios from "axios";
import { fullName } from "./types";
import { key } from './elvanto-api-key.json'
import HTTPError from 'http-errors';

/**
 * Gets all people from the elvanto api. If it can't connect, it throws an Error.
 */
export async function getPeople(): Promise<fullName[]> {
  let people: fullName[] = [];
  let i = 1;
  while (true) {
    let result = await axios.get(`https://api.elvanto.com/v1/people/getAll.json?page=${i}`, {
      auth: { username: key, password: 'x' }
    })
    .then(async (result) => {
      for (let person of await result.data.people.person) {
        people.push({ firstname: person.firstname, lastname: person.lastname })
      }
      return result;
    })
    .catch(err => { throw HTTPError(500, 'cannot connect to elvanto api') });
    i++;
    if (result.data.people.on_this_page < 1000) break;
  }
  return people;
}
