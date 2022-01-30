import { Router } from 'express';
import { set, ref } from "firebase/database";
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