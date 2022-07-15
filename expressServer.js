"use strict";

import express, { application } from "express";
const app = express();

import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";

app.use(express.text());

//user can create a new pet by entering an age, kind, and name
//using the /pets path
app.post("/pets", (req, res) => {
  const newPet = req.body.split(" ");

  //variables for new pet object
  const age = Number(newPet[0]);
  const kind = newPet[1];
  const name = newPet[2];

  //helps prevent bad input
  if (!age || !kind || !name) {
    console.error("Please enter age, kind, and name for the new pet.");
    next();
  }

  if (newPet.length !== 3) {
    console.error("Please enter age, kind, and name for the new pet.");
    next();
  } else {
    //reads file, adds new pet object to existing pets, writes file
    readFile("pets.json", "utf8")
      .then((str) => {
        let existingPets = [];

        if (str.length !== 0) {
          existingPets = JSON.parse(str);
        }

        const newPet = {
          age: age,
          kind: kind,
          name: name,
        };

        existingPets.push(newPet);
        writeFile("pets.json", JSON.stringify(existingPets))
          .then(() => {
            res.set("Content-Type", "application/json");
            res.send(newPet);
          })
          .catch((err) => {
            error500(res, err);
          });
      })
      .catch((err) => {
        error500(res, err);
      });
  }
});

//post error handlers.
app.post("/", (req, res) => {
  next();
});

app.post("/:id", (req, res) => {
  next();
});

app.use((err, req, res, next) => {
  res.set("Content-Type", "text/plain");
  res.status(400);
  res.send("Bad request");
});

//general get request for all pets
app.get("/pets", (req, res) => {
  readFile("pets.json", "utf8")
    .then((str) => {
      res.set("Content-Type", "application/json");
      res.send(str);
    })
    .catch((err) => {
      error500(res, err);
    });
});

//get request for specific pet id
app.get("/pets/:num", (req, res, next) => {
  const indexNum = req.params.num;

  readFile("pets.json", "utf8")
    .then((str) => {
      const data = JSON.parse(str);

      if (indexNum >= 0 && indexNum < data.length) {
        res.set("Content-Type", "application/json");
        res.send(data[indexNum]);
      } else {
        next("Not found");
      }
    })
    .catch((err) => {
      error500(res, err);
    });
});

//get error handlers
app.get("/", (req, res) => {
  next();
});

app.get("/:id", (req, res) => {
  next();
});

app.use((err, req, res, next) => {
  res.set("Content-Type", "text/plain");
  res.status(404);
  res.send("Not found");
});

//internal server error handler function
let error500 = (res, err) => {
  console.error(err.stack);
  res.status(500);
  res.set("Content-Type", "text/plain");
  return res.send("Internal Server Error");
};

//runs server
app.listen(3000, () => {
  console.log("server is running");
});
