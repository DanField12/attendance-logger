import express, { json } from 'express';
import path from 'path';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { deleteNew, deleteRegular, memberNew, memberRegular, memberRegulars, newGetAll, regularGetAll } from './attendance';
import { attendee, fullName } from './types';
import { getFamily, getPeople } from './people';
import { PrintQueue } from './print';
import { adminLogIn, clear, csv, validSession } from './admin';

const app = express()

app.use(json());

app.use(errorHandler());

app.use(cors());

let printQueue = new PrintQueue();

// Retry until a connection can be made to the alvanto api.
let people = new Map<string, fullName>();
function peopleRequest() {
  let intervalId = setInterval(
  async () => {
    people = await getPeople()
    .then((res) => {
      clearInterval(intervalId);
      return res;
    })
    .catch(err => { 
      console.log(err);
      return people;
    });
  }, 2000);
}
peopleRequest();

let attendees = {"8am": [], "10am": [], "5:15pm": []}

// frontend routes
app.get("/", (req, res) => {
  res.set('Content-Type', 'text/html');
  let t = new Date();
  if (t.getDay() == 0 && ((t.getHours() >= 16 && t.getHours() < 18) || (t.getHours() >= 7 && t.getHours() < 9) || (t.getHours() >= 9 && t.getHours() < 11))) {
    res.sendFile(path.join(__dirname, '/../../frontend/index.html'));
  } else {
    res.sendFile(path.join(__dirname, '/../../frontend/unavailable.html'));
  }
});

app.get("/admin/login", (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '/../../frontend/admin-login.html'));
});

app.get("/admin", (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '/../../frontend/admin.html'));
});

// backend routes
app.get("/familyMembers", (req, res) => {
  const id = req.query.id as string;
  res.json(getFamily(id, people))
})

app.get("/people", (req, res) => {
  if (people.size === 0) {
    res.status(500).send()
  } else {
    res.json({ people: Array.from(people.values()).map(person => ({ id: person.id, firstname: person.firstname, lastname: person.lastname })) });
  }
});

app.post("/admin/login/password", (req, res) => {
  const { password } = req.body;
  res.json(adminLogIn(password));
});

app.post("/admin/validSession", (req, res) => {
  const sessionId = req.get('sessionId') as string
  res.json(validSession(sessionId))
})

app.get("/csv", (req, res) => {
  const sessionId = req.get('sessionId') as string
  const service = req.query.service as string;
  res.json(csv(sessionId, attendees[service], service));
});

app.delete("/clear", (req, res) => {
  const sessionId = req.get('sessionId') as string
  const service = req.query.service as string;
  res.json(clear(sessionId, attendees[service]));
});

app.delete("/deleteRegular", (req, res) => {
  const sessionId = req.get('sessionId') as string
  const service = req.query.service as string;
  const id = req.query.id as string;
  res.json(deleteRegular(id, attendees[service]));
});
app.delete("/deleteNew", (req, res) => {
  const sessionId = req.get('sessionId') as string
  const firstname = req.query.firstname as string;
  const lastname = req.query.lastname as string;
  res.json(deleteNew(firstname, lastname));
});

app.post("/member/regular", (req, res) => {
  let { id, service } = req.body;
  console.log(id);
  res.json(memberRegular(id, printQueue, attendees[service], people));
});

app.post("/member/regulars", (req, res) => {
  let { id, familyIds, service } = req.body;
  console.log(id);
  console.log(familyIds);
  
  let ids: string[] = [...familyIds];
  ids.splice(0,0,id);
  res.json(memberRegulars(ids, printQueue, attendees[service], people));
});

app.get("/member/regular/getAll", (req, res) => {
  const service = req.query.service as string;
  res.json(regularGetAll(attendees[service]));
});

app.post("/member/new", async (req, res) => {
  let { firstname, lastname, contact, service } = req.body;
  memberNew(firstname, lastname, contact, attendees[service])
    .then((result) => {
      peopleRequest();
      printQueue.push(firstname + ',' + lastname);
      res.json(result);
    })
    .catch((err) => {
      res.status(500).send();
    })
});

app.get("/member/new/getAll", (req, res) => {
  res.json(newGetAll());
});

app.get("/printQueue", (req, res) => {
  res.send(printQueue.dumpAsCSV());
});

app.listen(8000);