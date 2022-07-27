import express from "express";
import basicAuth from "express-basic-auth";

const app = express();

import pg from "pg";

const pool = new pg.Pool({
  database: "petshop",
});

app.use(basicAuth({
  users: {'admin': 'meowmix'},
  unauthorizedResponse: getUnauthorizedResponse
}))

function getUnauthorizedResponse(req) {
  return req.auth
      ? ('Unauthorized: Credentials ' + req.auth.user + ':' + req.auth.password + ' rejected')
      : 'Unauthorized'
}

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

  var sql = `INSERT INTO pets (name, kind, age) VALUES ('${name}', '${kind}', ${age});`;

  pool
    .query(sql)
    .then(() => {
      res.set("Content-Type", "application/json");
      res.send(newPet);
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
  var sql = "SELECT * FROM pets;";

  res.setHeader("Authorization", "Basic ", "whatever");

  pool
    .query(sql)
    .then((result) => {
      res.set("Content-Type", "application/json");
      res.send(result.rows);
    })
    .catch((err) => {
      error500(res, err);
    });
});

//get request for specific pet id
app.get("/pets/:id", (req, res, next) => {
  const petId = Number(req.params.id);

  var sql = `SELECT * FROM pets WHERE id = ${petId};`;

  pool
    .query(sql)
    .then((result) => {
      if (result.rows.length === 0) {
        next("Not found");
      } else {
        res.set("Content-Type", "application/json");
        res.send(result.rows);
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

  var sql = `SELECT * FROM pets WHERE id = ${petId};`;

  pool
    .query(sql)
    .then((result) => {
      if (result.rows.length === 0) {
        next("Not found");
      } else {
        const newInfo = req.body;

        let updatePet = (newInfo) => {
          var sqlSelector = Object.keys(newInfo);
          var sqlValue = newInfo[Object.keys(newInfo)];

          var sql2 = `UPDATE pets SET ${sqlSelector} = '${sqlValue}' WHERE id = ${petId}`;

          pool.query(sql2).then(() => {
            res.set("Content-Type", "text/plain");
            res.send(`Updated`);
          });
        };

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

// patch error handlers
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

//Delete request for specific pet id
app.delete("/pets/:id", (req, res, next) => {
  const petId = Number(req.params.id);

  var sql = `SELECT * FROM pets WHERE id = ${petId};`;

  var sql2 = `DELETE FROM pets WHERE id = ${petId};`;

  pool
    .query(sql)
    .then((result) => {
      if (result.rows.length === 0) {
        next("Not found");
      } else {
        pool.query(sql2).then(() => {
          res.set("Content-Type", "TEXT/plain");
          res.send(`Deleted ${result.rows[0]["name"]} from database.`);
        });
      }
    })
    .catch((err) => {
      error500(res, err);
    });
});

//delete error handlers
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

// //internal server error handler function
let error500 = (res, err) => {
  console.error(err.stack);
  res.status(500);
  res.set("Content-Type", "text/plain");
  pool.end();
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
