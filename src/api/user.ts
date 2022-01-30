import { AnyAaaaRecord } from 'dns';
import { Router } from 'express';
import { get, child, set, ref, remove, push } from "firebase/database";
import { userInfo } from 'os';
import { db } from "../index";

export const user = Router();

interface userInfo {
    "age": string,
    "gender": string
    "priceRange": string[]
    "flights": any
    "prefs":{ageRanges:string[], gender:string[]}
}

interface flight {
  destPlans: string[], blacklist: []
}

user.get('/add', (req, res) => {
  const { query } = req;
  if (!query || !query.user) {
    res.status(400).send(`'user' is a required parameter`);
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

  const {user} = query;
  set(ref(db, `users/${  user}`), {
      name: query.name,
      age: query.age,
      gender: query.gender,
      flights: query.flights,
  });
  res.json({message: "User Added Successfully"});
});

user.get('/addFlight', (req, res) => {
  const { query } = req;
  if (!query || !query.user ) {
    res.status(400).send(`'user' is a required parameter`);
    return;
  }
  if (!query || !query.flight ) {
    res.status(400).send(`'flight' is a required parameter`);
    return;
  }

  const {user, flight} = query;
  set(ref(db, `users/${user}/flights/${flight}`), {
      match:"None"
  });
  res.json({message: "Flight Added Successfully"});
});

user.get('/setPrefs', (req, res) => {
  const { query } = req;
  if (!query || !query.user) {
    res.status(400).send(`'user' is a required parameter`);
    return;
  }

  const {user} = query;
  set(ref(db, `users/${user}/prefs`), {
    ageRanges: query.ageRanges,
    gender:query.gender,
    numPeople: query.numPeople,
  });
  res.json({message: "Preferences Added Successfully"});
});

user.get('/setFlightPrefs', (req, res) => {
  const { query } = req;
  if (!query || !query.user) {
    res.status(400).send(`'user' is a required parameter`);
    return;
  }

  const {user} = query;
  set(ref(db, `users/${user}/flights/${query.flight}/destPlans`), query.destPlans);
  res.json({message: "Preferences Added Successfully"});
});

user.get('/match', (req, res) => {
  const { query } = req;
  if (!query || (!query.user || typeof query.user != "string")) {
    res.status(400).send(`"user" param required`);
    return;
  }
  const u = query.user;
  if (!query || (!query.flight || typeof query.flight != "string")) {
    res.status(400).send(`"user" param required`);
    return;
  }
  const flight = query.flight;
  
  get(child(ref(db), `users`)).then((snapshot) => {
    let users = snapshot.val()
    if (!users[u]) {
      res.status(400).send(`${query.user} username is invalid`);
      return;
    }
    const user = users[u];
    const prefs = user.prefs;
    let match = null;
    let maxCount = 0;
    // find a list of all acceptable users and the number of interests they have in common
    for (const [u2, uInfo] of Object.entries(users)) {
      if (u2 != query.user && isOnFlight(uInfo as userInfo, flight)
        && checkAge(prefs.ageRanges, uInfo) && checkAge((uInfo as userInfo).prefs.ageRanges, user) 
        && checkGender(prefs.gender, uInfo) && checkGender((uInfo as userInfo).prefs.gender, user) 
        && checkPrices(user.priceRange, uInfo)
        && checkNotBlacklist(user.flights[flight].blacklist, u2)
        ) {
          let count = calcOverlap(user.flights[flight].destPlans, uInfo, flight);
          if (count >= maxCount)
            match = u2
            maxCount = count
      }
    }
    if (match != null) {
      set(ref(db, `users/${query.user}/flights/${query.flight}/match`), match);
      set(ref(db, `users/${match}/flights/${query.flight}/match`), query.user);
      res.status(200).send(`Match found successfully`);
      return;
    }
    res.status(400).send(`no match found`);
    return;
  }).catch((error) => {console.error(error)});
});

const checkNotBlacklist = (blacklist: string[], u2: string) => {
  if (blacklist != null && Object.values(blacklist).length > 0)
    return !Object.values(blacklist).includes(u2)
  return true
}

const calcOverlap = (destPlans: string[], uInfo: unknown, flight: string) => {
  if(typeof uInfo == 'object' && uInfo) {
    const flights = (uInfo as userInfo).flights
    const destPlans2 = flights[flight].destPlans
    let count = 0
    destPlans.forEach(item => {
      if (destPlans2.includes(item))
        count++
    })
    return count;
  }
  return 0;
}

// ageRanges: ["18-22", "22-30", "30-45", "46+"]
const checkAge = (ageRanges: string[], uInfo: unknown) => {
  if(typeof uInfo == 'object' && uInfo) {
    let age = parseInt((uInfo as userInfo).age)
    for (let i = 0; i < ageRanges.length; i++) {
      if (ageRanges[i] == "18-22" && age >= 18 && age <= 22) return true;
      if (ageRanges[i] == "22-30" && age >= 22 && age <= 30) return true;
      if (ageRanges[i] == "30-45" && age >= 30 && age <= 45) return true;
      if (ageRanges[i] == "46+" && age >= 46) return true;
    }
  }
  return false;
}

const checkGender = (gender: string[], uInfo: unknown) => {
  if(typeof uInfo == 'object' && uInfo) {
    let gender = ((uInfo as userInfo).gender)
    return gender.includes(gender)
  }
  return false;
}

const checkPrices = (priceRange: string[], uInfo: unknown) => {
  if(typeof uInfo == 'object' && uInfo) {
    const priceRange2 = ((uInfo as userInfo).priceRange)
    const min1 = parseInt(priceRange[0]) ?? 0
    const min2 = parseInt(priceRange2[0]) ?? 0
    const max1 = parseInt(priceRange[1]) ?? Infinity
    const max2 = parseInt(priceRange2[1]) ?? Infinity
    const min = Math.max(min1, min2)
    const max = Math.min(max1, max2)
    return min < max
  }
  return false;
}

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

const isOnFlight = (user: userInfo, flight: string) => {
  return (user.flights.hasOwnProperty(flight))
}
