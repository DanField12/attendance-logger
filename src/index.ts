import express, { json } from 'express';
import path from 'path';
// import fs from 'fs';
import errorHandler from 'middleware-http-errors';
import { csv, memberNew, memberRegular } from './lib';

const app = express()

app.use(json());

app.use(errorHandler());

// frontend routes
app.get("/", (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '/frontend/regular.html'));
});

app.get("/new", (req, res) => {
  res.set('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, '/frontend/new.html'));
});

// backend routes
app.get("/csv", (req, res) => {
  const before = req.query.before as string;
  const after = req.query.after as string;
  res.set('Content-Type', 'text/plain');
  res.send(csv(before, after));
});

app.post("/member/regular", (req, res) => {
  let { firstname, lastname } = req.body;
  res.json(memberRegular(firstname, lastname));
});

app.post("/member/new", (req, res) => {
  let {firstname, lastname, email, phone} = req.body;
  res.json(memberNew(firstname, lastname, email, phone));
});


app.listen(8000);