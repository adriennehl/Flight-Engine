import { Router } from 'express';
import { child, get, ref } from "firebase/database";
import { db } from "../index";

export const seats = Router();

seats.get('/', (req, res) => {
  const { query } = req;
  if (!query || !query.flightNumber) {
    res.status(400).send(`'flightNumber' is a required parameter`);
    return;
  }
  
  res.json(generatedSeats);
});

seats.get('/rec', (req, res) => {
  const { query } = req;
  if (!query || (!query.user1 || typeof query.user1 != "string") || (!query.user2 || typeof query.user2 != "string")) {
    res.status(400).send(`Two users required`);
    return;
  }
  const u1 = query.user1;
  const u2 = query.user2;
  
  get(child(ref(db), `users`)).then((snapshot) => {
    let users = snapshot.val()
    console.log(users)
    if (!users[u1]) {
      res.status(400).send(`${query.user1} username is invalid`);
      return;
    }
    if (!users[u2]) {
      res.status(400).send(`${query.user2} username is invalid`);
      return;
    }
    const user1 = users[u1];
    const user2 = users[u2];
    const min1 = user1.priceRange && typeof user1.priceRange[0] == "string" ? parseInt(user1.priceRange[0]) : 0
    const min2 = user2.priceRange && typeof user2.priceRange[0] == "string" ? parseInt(user2.priceRange[0]) : 0
    const max1 = user1.priceRange && typeof user1.priceRange[1] == "string" ? parseInt(user1.priceRange[1]) : Infinity
    const max2 = user2.priceRange && typeof user2.priceRange[1] == "string" ? parseInt(user2.priceRange[1]) : Infinity
    const min = Math.max(min1, min2)
    const max = Math.min(max1, max2)
    // get affordable seats
    const affordableSeats = generatedSeats.available.filter((seat) => {
      return seat.price >= min && seat.price <= max
    })
    // find pairs of seats
    let pairs: {row: number, seat: string, type: string, class: string, price: number}[][] = [];
    for (let i = 0; i < affordableSeats.length - 1; i++) {
      if (affordableSeats[i].row == affordableSeats[i+1].row &&
        Math.abs(seatToNum(affordableSeats[i].seat) - seatToNum(affordableSeats[i+1].seat)) == 1) {
          pairs.push([affordableSeats[i], affordableSeats[i+1]])
        }
    }
    res.json({pairs: pairs});
  }).catch((error) => {console.error(error)});
  
})



const seatToNum = (seat: string) => {
  if (seat == "A") return 1; 
  else if (seat == "B") return 2;
  else if (seat == "C") return 3;
  else if (seat == "D") return 5;
  else if (seat == "E") return 6;
  else if (seat == "F") return 7;
  else return -1;
}

const generatedSeats = { available: [{row: 5, seat: 'B', type: 'middle', class: 'first', price: 149}, 
    {row: 5, seat: 'C', type: 'aisle', class: 'first', price: 149},
    {row: 7, seat: 'A', type: 'window', class: 'first', price: 149},
    {row: 7, seat: 'D', type: 'aisle', class: 'first', price: 149},
    {row: 7, seat: 'E', type: 'middle', class: 'first', price: 149},
    {row: 7, seat: 'F', type: 'window', class: 'first', price: 149},
    {row: 9, seat: 'B', type: 'middle', class: 'first', price: 149},
    {row: 9, seat: 'C', type: 'aisle', class: 'first', price: 149},
    {row: 13, seat: 'B', type: 'middle', class: 'preferred', price: 125},
    {row: 13, seat: 'C', type: 'aisle', class: 'preferred', price: 125},
    {row: 13, seat: 'D', type: 'aisle', class: 'preferred', price: 125},
    {row: 13, seat: 'E', type: 'middle', class: 'preferred', price: 125},
    {row: 14, seat: 'B', type: 'middle', class: 'preferred', price: 115},
    {row: 14, seat: 'C', type: 'aisle', class: 'preferred', price: 115},
    {row: 15, seat: 'D', type: 'aisle', class: 'preferred', price: 115},
    {row: 15, seat: 'E', type: 'middle', class: 'preferred', price: 115},
    {row: 17, seat: 'B', type: 'middle', class: 'preferred', price: 105},
    {row: 17, seat: 'C', type: 'aisle', class: 'preferred', price: 105},
    {row: 18, seat: 'D', type: 'aisle', class: 'preferred', price: 105},
    {row: 18, seat: 'E', type: 'middle', class: 'preferred', price: 105},
    {row: 19, seat: 'A', type: 'window', class: 'preferred', price: 97},
    {row: 19, seat: 'B', type: 'middle', class: 'preferred', price: 97},
    {row: 22, seat: 'B', type: 'middle', class: 'economy', price: 70},
    {row: 22, seat: 'C', type: 'aisle', class: 'economy', price: 70},
    {row: 23, seat: 'D', type: 'aisle', class: 'economy', price: 70},
    {row: 23, seat: 'E', type: 'middle', class: 'economy', price: 70},
    {row: 25, seat: 'A', type: 'window', class: 'economy', price: 70},
    {row: 25, seat: 'B', type: 'middle', class: 'economy', price: 70},
    {row: 27, seat: 'B', type: 'middle', class: 'economy', price: 55},
    {row: 27, seat: 'C', type: 'aisle', class: 'economy', price: 55},
    {row: 27, seat: 'D', type: 'aisle', class: 'economy', price: 55},
    {row: 29, seat: 'E', type: 'middle', class: 'economy', price: 55},
    {row: 29, seat: 'A', type: 'window', class: 'economy', price: 55},
    {row: 29, seat: 'B', type: 'middle', class: 'economy', price: 55},
    {row: 31, seat: 'B', type: 'middle', class: 'economy', price: 55},
    {row: 31, seat: 'C', type: 'aisle', class: 'economy', price: 55},
    {row: 33, seat: 'D', type: 'aisle', class: 'economy', price: 45},
    {row: 33, seat: 'E', type: 'middle', class: 'economy', price: 45},
    {row: 36, seat: 'A', type: 'window', class: 'economy', price: 45},
    {row: 36, seat: 'B', type: 'middle', class: 'economy', price: 45}]}
