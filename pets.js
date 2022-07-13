const subcommand = process.argv[2];

import fs from "fs";
import { readFile } from "fs/promises";
import { writeFile } from "fs/promises";

switch (subcommand) {
  case "read": {
    const index = process.argv[3];

    readFile("pets.json", "utf-8")
      .then((str) => {
        const data = JSON.parse(str);

        if (index === undefined) {
          return console.log(data);
        }

        if (data[index] === undefined) {
          return console.error("No pet found for specified index: " + index);
        } else {
          console.log(data[index]);
        }
      })
      .catch((err) => {
        console.error(err);
      });

    break;
  }
  case "create": {
    const age = Number(process.argv[3]);
    const kind = process.argv[4];
    const name = process.argv[5];

    if (!age || !kind || !name) {
      console.error("Please enter an age, kind, and name for the pet.");
      break;
    }

    const newPet = {
      age: age,
      kind: kind,
      name: name,
    };

    readFile('pets.json', 'utf-8')
      .then((str) =>{
        
        const data = JSON.parse(str);

        data.push(newPet);

        writeFile("pets.json", JSON.stringify(data))
        .catch((err) =>{
          console.error(err);
        })
        
      
      }).catch((err) => {
        console.error(err);
      })

    break;
  }
  case "update": {
    const index = process.argv[3];
    const age = Number(process.argv[4]);
    const kind = process.argv[5];
    const name = process.argv[6];

    if (!index || !age || !kind || !name) {
      console.error(
        "Please enter index you wish to update with age, kind, and name"
      );
      break;
    }

    const updatedPet = {
      age: age,
      kind: kind,
      name: name,
    };

    fs.readFile("pets.json", "utf-8", function (err, str) {
      if (err) return console.error(err);

      const data = JSON.parse(str);

      data[index] = updatedPet;

      fs.writeFile("pets.json", JSON.stringify(data), (err) => {
        if (err) return console.error(err);
      });
    });

    break;
  }
  case "destroy": {
    const index = process.argv[3];

    if (!index) {
      console.error("Please enter index you wish to delete.");
      break;
    }

    fs.readFile("pets.json", "utf-8", function (err, str) {
      if (err) return console.error(err);

      const data = JSON.parse(str);

      data.splice(index, 1);

      fs.writeFile("pets.json", JSON.stringify(data), (err) => {
        if (err) return console.error(err);
      });
    });

    break;
  }
  default:
    console.error("Usage: node pets.js [read | create | update | destroy]");
    process.exit(1);
}
