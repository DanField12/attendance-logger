import axios from "axios";
import { fullName } from "./types";
import { key } from './elvanto-api-key.json'
import HTTPError from 'http-errors';

/**
 * Gets all people from the elvanto api. If it can't connect, it throws an Error.
 */
export async function getPeople(): Promise<Map<string, fullName>> {
  let people = new Map<string, fullName>();
  let i = 1;
  while (true) {
    let result = await axios.get(`https://api.elvanto.com/v1/people/getAll.json?page=${i}`, {
      auth: { username: key, password: 'x' }
    })
    .then(async (result) => {
      for (let person of await result.data.people.person) {
        let firstname;
        if (person.preferred_name !== "" && person.preferred_name.length < person.firstname.length) {
            firstname = person.preferred_name;
        } else {
            firstname = person.firstname;
        }
        people.set(person.id, { id: person.id, firstname: firstname, lastname: person.lastname, familyId: person.family_id })
      }
      return result;
    })
    .catch(err => { throw HTTPError(500, 'cannot connect to elvanto api') });
    i++;
    if (result.data.people.on_this_page < 1000) break;
  }
  return people;
}

export function getFamily(id: string, people: Map<string, fullName>) {
  if (!people.has(id)) throw HTTPError(403, 'Invalid id.');
  const familyId = people.get(id).familyId;
  if (familyId === "") return {};
  return {
    family: Array.from(people.values()).filter(person => familyId === person.familyId && id !== person.id)
  }
}
