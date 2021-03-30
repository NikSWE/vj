const fs = require("fs");
const path = require("path");
const url = require("url");

const _ = require("lodash");
const moment = require("moment");
const parse = require("csv-parse/lib/sync");
const puppeteer = require("puppeteer");

const creds = require("../creds.json");

function fetchWordsFromCSV() {
  const CSVPath = path.join(__dirname, "..", "words.csv");
  const rawCSV = fs.readFileSync(CSVPath);
  return parse(rawCSV);
}

async function login(page) {
  await page.goto("https://www.vocabulary.com/login/");
  await page.focus(
    "#loginform > div.field.username.required > div.value > input"
  );
  await page.keyboard.type(creds.email);
  await page.focus(
    "#loginform > div.field.password.required > div.value > input"
  );
  await page.keyboard.type(creds.password);
  await page.click("#loginform > div.actions > button");
}

async function fetchList(page) {
  await page.goto("https://www.vocabulary.com/account/lists/");
  return await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        "#pageContent > div > div.maincontent > div > div > div > div > table > tbody > tr > td > a"
      ),
      (a) => ({
        name: a.innerHTML.split("\n")[0],
        link: a.getAttribute("href"),
      })
    )
  );
}

function listContains(list, num) {
  for (const value of list) {
    if (value.name === `Greg Mat's Set - ${num}`) return true;
  }
  return false;
}

async function createList(page, num) {
  const list = await fetchList(page);

  if (listContains(list, num)) {
    for (const value of list) {
      if (value.name === `Greg Mat's Set - ${num}`)
        return "https://www.vocabulary.com" + value.link;
    }
  } else {
    const words = fetchWordsFromCSV()[num - 1];
    await page.goto("https://www.vocabulary.com/lists/vocabgrabber");
    await page.focus(
      "#pageContent > div > section > div.content-wrapper.slide.entertext.selected > div > div > textarea"
    );
    await page.keyboard.type(_.join(words, "\n"));
    await page.click(
      "#pageContent > div > section > div.content-wrapper.slide.entertext.selected > div > div > button"
    );
    await page.waitForSelector(
      "#pageContent > div > section > div.content-wrapper.slide.results.withlist.selected > form > div.resultsonly > div > div > input"
    );
    await page.focus(
      "#pageContent > div > section > div.content-wrapper.slide.results.withlist.selected > form > div.resultsonly > div > div > input"
    );
    await page.keyboard.type(`Greg Mat's Set - ${num}`);
    await page.click(
      "#pageContent > div > section > div.content-wrapper.slide.results.withlist.selected > form > div.actions > span > button.green.ss-check"
    );
    await page.waitForNavigation();
    const url = new URL(await page.url());
    url.pathname = url.pathname.replace("/practice", "/edit");
    await page.goto(url.href);

    await page.waitForSelector("#listForm #sharedPrivate");
    await page.click("#listForm #sharedPrivate");

    await page.waitForSelector("#listForm > .grid > .col > .actions > .green");
    await page.click("#listForm > .grid > .col > .actions > .green");

    await page.waitForNavigation();
    return await page.url();
  }
}

async function createVocabJam(config, debug) {
  const browser = await puppeteer.launch({ headless: !debug });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();

  await page.setDefaultTimeout(0);

  await login(page);
  await page.waitForNavigation();

  const url = await createList(page, config.Set);

  await page.goto(url + "/jam");

  switch (config.Questions) {
    case 10:
      await page.waitForSelector(
        ".col > .questions > .value > label:nth-child(1) > .label"
      );
      await page.click(
        ".col > .questions > .value > label:nth-child(1) > .label"
      );
      break;
    case 20:
      await page.waitForSelector(
        ".col > .questions > .value > label:nth-child(2) > .label"
      );
      await page.click(
        ".col > .questions > .value > label:nth-child(2) > .label"
      );
      break;
    case 30:
      await page.waitForSelector(
        ".col > .questions > .value > label:nth-child(3) > .label"
      );
      await page.click(
        ".col > .questions > .value > label:nth-child(3) > .label"
      );
      break;
    case 40:
      await page.waitForSelector(
        ".col > .questions > .value > label:nth-child(4) > .label"
      );
      await page.click(
        ".col > .questions > .value > label:nth-child(4) > .label"
      );
      break;
  }

  switch (config.Difficulty) {
    case "Very Easy":
      await page.waitForSelector(".value > .slider > label > .very-easy > use");
      await page.click(".value > .slider > label > .very-easy > use");
      break;

    case "Easier than Average":
      await page.waitForSelector(".value > .slider > label > .easy > use");
      await page.click(".value > .slider > label > .easy > use");
      break;

    case "About Average":
      await page.waitForSelector(".field > .value > .slider > label > .normal");
      await page.click(".field > .value > .slider > label > .normal");
      break;

    case "Harder than Average":
      await page.waitForSelector(".value > .slider > label > .hard > use");
      await page.click(".value > .slider > label > .hard > use");
      break;

    case "Very Hard":
      await page.waitForSelector(".value > .slider > label > .very-hard > use");
      await page.click(".value > .slider > label > .very-hard > use");
      break;
  }

  switch (config.Speed) {
    case "Slow":
      await page.waitForSelector(
        ".col > .speed > .value > label:nth-child(1) > .label"
      );
      await page.click(".col > .speed > .value > label:nth-child(1) > .label");
      break;

    case "Normal":
      await page.waitForSelector(
        ".col > .speed > .value > label:nth-child(2) > .label"
      );
      await page.click(".col > .speed > .value > label:nth-child(2) > .label");
      break;

    case "Fast":
      await page.waitForSelector(
        ".col > .speed > .value > label:nth-child(3) > .label"
      );
      await page.click(".col > .speed > .value > label:nth-child(3) > .label");
      break;

    case "No Time Limit":
      await page.waitForSelector(
        ".col > .speed > .value > label:nth-child(4) > .label"
      );
      await page.click(".col > .speed > .value > label:nth-child(4) > .label");
      break;
  }

  switch (config.Teams) {
    case 2:
      await page.waitForSelector(
        ".col > .teams > .value > label:nth-child(1) > .label"
      );
      await page.click(".col > .teams > .value > label:nth-child(1) > .label");
      break;

    case 3:
      await page.waitForSelector(
        ".col > .teams > .value > label:nth-child(2) > .label"
      );
      await page.click(".col > .teams > .value > label:nth-child(2) > .label");
      break;

    case 4:
      await page.waitForSelector(
        ".col > .teams > .value > label:nth-child(3) > .label"
      );
      await page.click(".col > .teams > .value > label:nth-child(3) > .label");
      break;
  }

  await page.click(
    "#pageContent > div > div.slide.options.selected > div > form > div.actions > button.green"
  );

  await page.waitForNavigation();

  console.log(`Vocab Jam URL => ${await page.url()}`);

  const startsIn = moment(config.Timestamp).diff(moment());

  let remaining_count = 3;
  setTimeout(async function run() {
    await page.waitForSelector(
      ".jam > .clearfloat > .setup > .actions > .ss-play"
    );
    await page.click(".jam > .clearfloat > .setup > .actions > .ss-play");

    const res = await page.$(
      "body > div.dialogpane.alert > div > div.content > h3"
    );

    if (!_.isNull(res)) {
      await page.click(".jam > .clearfloat > .setup > .actions > .ss-play");

      if (remaining_count-- === 0) {
        console.log("Not enough players joined on time, create a new jam");
        process.exit(1);
      } else {
        console.log("Not enough players, will try again after 1 min");
      }

      setTimeout(run, 60000);
    } else {
      console.log("Jam has started");
    }
  }, startsIn);

  page
    .waitForSelector("body > main > section.gamesummary.current > div > h1", {
      visible: true,
    })
    .then(async () => {
      console.log("Jam has ended");
      await page.close();
      await browser.close();
    });
}

module.exports = { createVocabJam };
