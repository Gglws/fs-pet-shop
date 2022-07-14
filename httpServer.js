"use strict";

import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";

import http from "http";

var port = process.env.PORT || 8000;

var petRegExp = /^\/pets\/(.*)$/;

var server = http.createServer(function (req, res) {
  if (req.method === "GET") {
    //checks for match, returns null or an array
    const iNum = req.url.match(petRegExp);

    async function f1() {
      //rest of code will wait on result of f2
      //Not efficient, but wanted to work with await and promises for practice
      const tester = await f2();

      //runs first if statement if /pets or /pets/ is the URL
      if (req.url === "/pets" || (iNum !== null && iNum[1] === "")) {
        readFile("pets.json", "utf8")
          .then((str) => {
            res.setHeader("Content-Type", "application/json");
            res.end(str);
          })
          .catch((err) => {
            error500(res, err);
          });
      }
      //runs else if if tester is true. Displays result based on index of entered number.
      else if (tester !== false) {
        readFile("pets.json", "utf8")
          .then((str) => {
            const data = JSON.parse(str);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data[iNum[1]]));
          })
          .catch((err) => {
            error500(res, err);
          });
      } else {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        return res.end("Not found.");
      }
    }

    function f2() {
      return new Promise((resolve) => {
        resolve(
          readFile("pets.json", "utf8")
            .then((str) => {
              const data = JSON.parse(str);

              //if iNum isnt null and the entered number is a index in pets.json returns true
              if (iNum !== null && iNum[1] >= 0 && iNum[1] < data.length) {
                return true;
              }
              return false;
            })
            .catch((err) => {
              error500(res, err);
            })
        );
      });
    }

    f1();
  } else if (req.method === "POST" && req.url === "/pets") {
    let body = "";

    //collects all the chunks and adds them to body variable
    req.on("data", (chunk) => {
      body += chunk;
    });


    //runs after finishing gathering data
    req.on("end", () => {
      const newPet = body.split(" ");

      //variables for new pet object
      const age = Number(newPet[0]);
      const kind = newPet[1];
      const name = newPet[2];


      //helps prevent bad input
      if (!age || !kind || !name) {
        error400(res);
      }

      if (newPet.length !== 3) {
        error400(res);
      } else { //reads file, adds new pet object to existing pets, writes file 
        readFile("pets.json", "utf8").then((str) => {
          const existingPets = JSON.parse(str);
          const newPet = {
            age: age,
            kind: kind,
            name: name,
          };
          existingPets.push(newPet);
          writeFile("pets.json", JSON.stringify(existingPets)).then(() => {
            res.setHeader("Content-Type", "application/json");
            res.end();
          });
        });
      }
    });
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    return res.end("Not found.");
  }
});

let error500 = (res, err) => {
  console.error(err.stack);
  res.statusCode = 500;
  res.setHeader("Content-Type", "text/plain");
  return res.end("Internal Server Error");
};

let error400 = (res) => {
  console.error("Please enter an age, kind, and name for the pet.");
  res.statusCode = 400;
  res.setHeader("Content-Type", "text/plain");
  return res.end("Bad Request");
};

server.listen(port, () => {
  console.log("Listening on port", port);
});
