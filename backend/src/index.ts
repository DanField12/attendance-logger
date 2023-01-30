import express, { json } from 'express';
import path from 'path';
// import fs from 'fs';
import errorHandler from 'middleware-http-errors';
import { adminLogIn, clear, csv, memberNew, memberRegular, newGetAll, regularGetAll } from './lib';

const app = express()

app.use(json());

app.use(errorHandler());

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
app.post("/admin/login/password", (req, res) => {
  const { password } = req.body;
  res.json(adminLogIn(password));
});

app.get("/csv", (req, res) => {
  const sessionId = req.get('sessionId') as string
  console.log(sessionId);
  const before = parseInt(req.query.before as string);
  const after = parseInt(req.query.after as string);
  res.json(csv(sessionId, before, after));
});

app.delete("/clear", (req, res) => {
  const sessionId = req.get('sessionId') as string
  res.json(clear(sessionId));
});

app.post("/member/regular", (req, res) => {
  let { firstname, lastname } = req.body;
  res.json(memberRegular(firstname, lastname));
});

app.get("/member/regular/getAll", (req, res) => {
  res.json(regularGetAll());
});

app.post("/member/new", (req, res) => {
  let { firstname, lastname, email, phone } = req.body;
  res.json(memberNew(firstname, lastname, email, phone));
});

app.get("/member/new/getAll", (req, res) => {
  res.json(newGetAll());
});

app.listen(8000);