/*
Run this script using 'npm run admin' to set a new admin password. This creates a new text file with the
hashed password, which will then be read when a user tries to sign in.
*/ 

import { doHash } from "../attendance";
import readline from 'readline';
import fs from 'fs';
import path from "path";

const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

r1.question('Enter the new password: ', password => {
  r1.question('Enter the new password again to confirm: ', passwordConfirm => {
    if (password !== passwordConfirm) {
      console.log('The passwords do not match.');
    } else {
      fs.writeFileSync(path.join(__dirname, '../hashed-password'), doHash(password));
      fs.writeFileSync(path.join(__dirname, '../sessions.json'), '{"sessions":[]}');
      console.log('The new password has been set');
    }
    r1.close();
  })
})

