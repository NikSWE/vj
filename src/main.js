const inquirer = require("inquirer");

const utils = require("./utils");

inquirer.registerPrompt("date", require("inquirer-date-prompt"));

inquirer
  .prompt([
    {
      type: "number",
      name: "Set",
      validate: (input) => {
        if (input >= 1 && input <= 28) return true;
        else return "Pick from 1 - 28";
      },
    },
    {
      type: "list",
      name: "Questions",
      choices: [10, 20, 30, 40],
      default: 2,
    },
    {
      type: "list",
      name: "Difficulty",
      choices: [
        "Very Easy",
        "Easier than Average",
        "About Average",
        "Harder than Average",
        "Very Hard",
      ],
      default: 2,
    },
    {
      type: "list",
      name: "Speed",
      choices: ["Slow", "Normal", "Fast", "No Time Limit"],
      default: 1,
    },
    {
      type: "list",
      name: "Teams",
      choices: [2, 3, 4],
      default: 1,
    },
    {
      type: "date",
      name: "Timestamp",
      format: {
        day: undefined,
        month: undefined,
        year: undefined,
        second: "numeric",
      },
    },
  ])
  .then((answers) => {
    utils.createVocabJam(answers);
  })
  .catch((error) => {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else went wrong
    }
  });
