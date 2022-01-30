import { Router } from 'express';
import { get, child, set, ref, remove, push } from "firebase/database";
import { db } from "../index";

export const user = Router();

user.get('/add', (req, res) => {
  const { query } = req;
  if (!query || !query.username ) {
    res.status(400).send(`'username' is a required parameter`);
    return;
  }
  if (!query || !query.name ) {
    res.status(400).send(`'name' is a required parameter`);
    return;
  }
  if (!query || !query.age ) {
    res.status(400).send(`'age' is a required parameter`);
    return;
  }
  if (!query || !query.gender ) {
    res.status(400).send(`'gender' is a required parameter`);
    return;
  }
  if (!query || !query.flights ) {
    res.status(400).send(`'flights' is a required parameter`);
    return;
  }

  const {username} = query;
  set(ref(db, `users/${  username}`), {
      name: query.name,
      age: query.age,
      gender: query.gender,
      flights: query.flights,
  });
  res.json({message: "User Added Successfully"});
});

user.get('/addFlight', (req, res) => {
  const { query } = req;
  if (!query || !query.username ) {
    res.status(400).send(`'username' is a required parameter`);
    return;
  }
  if (!query || !query.flight ) {
    res.status(400).send(`'flight' is a required parameter`);
    return;
  }

  const {username, flight} = query;
  set(ref(db, `users/${username}/flights/${flight}`), {
      match:"None"
  });
  res.json({message: "Flight Added Successfully"});
});

user.get('/match', (req, res) => {
  const { query } = req;
  if (!query || (!query.user || typeof query.user != "string")) {
    res.status(400).send(`"user" param required`);
    return;
  }
  const u = query.user;
  
  get(child(ref(db), `users`)).then((snapshot) => {
    let users = snapshot.val()
    if (!users[u]) {
      res.status(400).send(`${query.user} username is invalid`);
      return;
    }
    const user = users[u];


    // res.json({match: match});
  }).catch((error) => {console.error(error)});
});

user.get('/reject', (req, res) => {
  const { query } = req;
  if (!query || (!query.user || typeof query.user != "string")) {
    res.status(400).send(`"user" param required`);
    return;
  }
  if (!query || (!query.flight || typeof query.flight != "string")) {
    res.status(400).send(`"flight" param required`);
    return;
  }
  const u = query.user;
  const flight = query.flight;

  get(child(ref(db), `users/${u}`)).then((snapshot) => {
    if (!snapshot.val()) {
      res.status(400).send(`${query.user} username is invalid`);
      return;
    }
    let user = snapshot.val();
    const flightDetails = user.flights[flight];
    const match = flightDetails["match"];
    const blacklistRef = ref(db, `users/${query.user}/flights/${query.flight}/blacklist`);
    const newBlacklistRef = push(blacklistRef);
    set(newBlacklistRef, match);
    const blacklistRef2 = ref(db, `users/${match}/flights/${query.flight}/blacklist`);
    const newBlacklistRef2 = push(blacklistRef2);
    set(newBlacklistRef2, query.user);
    remove(ref(db, `users/${match}/flights/${query.flight}/match`));
  }).catch((error) => {console.error(error)});

  remove(ref(db, `users/${query.user}/flights/${query.flight}/match`));
  res.json({message: "Match Removed Successfully"});
});