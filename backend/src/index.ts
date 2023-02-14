import express, { json } from 'express';
import path from 'path';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import { memberNew, memberRegular, newGetAll, regularGetAll } from './attendance';
import { attendee, fullName } from './types';
import { getPeople } from './people';
import { PrintQueue } from './print';
import { adminLogIn, clear, csv, validSession } from './admin';

const app = express()

app.use(json());

app.use(errorHandler());

app.use(cors());

let printQueue = new PrintQueue();

// Retry until a connection can be made to the alvanto api.
let people: fullName[] = [];
let intervalId = setInterval(
async () => {
  people = await getPeople()
  .then((res) => {
    clearInterval(intervalId);
    return res;
  })
  .catch(err => { 
    console.log(err);
    return [];
  });
}, 2000);


let adultAttendees: attendee[] = [];

// frontend routes
app.get("/", (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '/../../frontend/index.html'));
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
  res.json({
    family: [
      "Bob Smith",
      "John Smith",
      "Sarah Smith"
    ]
  })
})

app.get("/people", (req, res) => {
  if (people.length === 0) {
    res.status(500).send()
  } else {
    res.json({ people });
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
  const before = parseInt(req.query.before as string);
  const after = parseInt(req.query.after as string);
  res.json(csv(sessionId, before, after, adultAttendees));
});

app.delete("/clear", (req, res) => {
  const sessionId = req.get('sessionId') as string
  res.json(clear(sessionId, adultAttendees));
});

app.post("/member/regular", (req, res) => {
  let { firstname, lastname } = req.body;
  console.log(firstname, lastname);
  res.json(memberRegular(firstname, lastname, printQueue, adultAttendees));
});

app.get("/member/regular/getAll", (req, res) => {
  res.json(regularGetAll(adultAttendees));
});

app.post("/member/new", async (req, res) => {
  let { firstname, lastname, contact } = req.body;
  memberNew(firstname, lastname, contact, adultAttendees)
    .then(() => {
      people.push({ firstname, lastname })
      printQueue.push(firstname + ',' + lastname);
      res.json({});
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