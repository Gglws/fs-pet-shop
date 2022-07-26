import express from "express";
const app = express();

import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";

app.use(express.json());

app.post("/pets", (req, res) => {
  const newPet = req.body;
  //variables for new pet object
  const age = Number(newPet["age"]);
  const kind = newPet["kind"];
  const name = newPet["name"];

  //helps prevent bad input
  if (!age || !kind || !name) {
    console.error("Please enter age, kind, and name for the new pet.");
    next();
  }

  //reads file, adds new pet object to existing pets, writes file
  readFile("pets.json", "utf8")
    .then((str) => {
      let existingPets = [];
      let newId = 0;

      if (str.length !== 0) {
        existingPets = JSON.parse(str);
        newId = existingPets.length + 1;
      }

      const newPet = {
        id: newId,
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
});

//post error handlers.
app.post("/", (req, res) => {
  next();
});

app.post("/:id", (req, res) => {
  next();
});

app.post("/pets/:id", (req, res) => {
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
app.get("/pets/:id", (req, res, next) => {
  const petId = Number(req.params.id);

  readFile("pets.json", "utf8")
    .then((str) => {
      const data = JSON.parse(str);
      let found = false;

      data.forEach((el) => {
        if (el.id === petId) {
          res.set("Content-Type", "application/json");
          res.send(el);
          found = true;
        }
      });

      if (!found) {
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

//update request for specific pet id
app.patch("/pets/:id", (req, res, next) => {
  const petId = Number(req.params.id);

  readFile("pets.json", "utf8")
    .then((str) => {
      const data = JSON.parse(str);
      let found = false;
      let currentPet = "";

      data.forEach((el) => {
        if (el.id === petId) {
          currentPet = el;
          found = true;
        }
      });

      //function for updating pet and saving to file
      let updatePet = (newInfo) => {
        currentPet[Object.keys(newInfo)] = newInfo[Object.keys(newInfo)];

        writeFile("pets.json", JSON.stringify(data))
          .then(() => {
            res.set("Content-Type", "application/json");
            res.send(currentPet);
          })
          .catch((err) => {
            error500(res, err);
          });
      };

      if (!found) {
        next("Not found");
      } else {
        const newInfo = req.body;

        //testers for valid information
        if (
          Object.keys(newInfo) == "kind" &&
          newInfo[Object.keys(newInfo)] != ""
        ) {
          updatePet(newInfo);
        } else if (
          Object.keys(newInfo) == "name" &&
          newInfo[Object.keys(newInfo)] != ""
        ) {
          updatePet(newInfo);
        } else if (
          Object.keys(newInfo) == "age" &&
          !isNaN(newInfo[Object.keys(newInfo)])
        ) {
          updatePet(newInfo);
        } else {
          error400(res);
        }
      }
    })
    .catch((err) => {
      error500(res, err);
    });
});

//get error handlers
app.patch("/", (req, res) => {
  next();
});

app.patch("/:id", (req, res) => {
  next();
});

app.use((err, req, res, next) => {
  res.set("Content-Type", "text/plain");
  res.status(404);
  res.send("Not found");
});

//get request for specific pet id
app.delete("/pets/:id", (req, res, next) => {
  const petId = Number(req.params.id);

  readFile("pets.json", "utf8")
    .then((str) => {
      const data = JSON.parse(str);
      let found = false;

      data.forEach((el) => {
        if (el.id === petId) {
          data.splice(el.id - 1, 1);
          found = true;
        }
      });

      if (!found) {
        next("Not found");
      } else {
        writeFile("pets.json", JSON.stringify(data))
          .then(() => {
            res.set("Content-Type", "text/plain");
            res.send("Successfully deleted pet.");
          })
          .catch((err) => {
            error500(res, err);
          });
      }
    })
    .catch((err) => {
      error500(res, err);
    });
});

//get error handlers
app.delete("/", (req, res) => {
  next();
});

app.delete("/:id", (req, res) => {
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

let error400 = (res) => {
  console.error("Please enter valid age, kind, or name for the pet.");
  res.set("Content-Type", "text/plain");
  res.status(400);
  res.send("Bad request");
};

//runs server
app.listen(3000, () => {
  console.log("server is running");
});
