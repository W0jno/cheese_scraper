const { chromium } = require("playwright");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

(async () => {
  const cheesesDetails = [];

  const db = await open({
    filename: "./cheeseDB.db",
    driver: sqlite3.Database,
  });

  async function getElementTextIfExists(page, selector) {
    const element = await page.$(selector);
    if (element) {
      const text = await element.textContent();
      return text.trim();
    }
    return null;
  }

  async function parseVegetarian(phrase) {
    return (await phrase) === "Vegetarian: no" ? false : true;
  }

  async function parseVegan(phrase) {
    return (await phrase) === "Vegan: no" ? false : true;
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS cheese (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      ingredients TEXT,
      country TEXT,
      type TEXT,
      texture TEXT,
      rind TEXT,
      colour TEXT,
      flavour TEXT,
      aroma TEXT,
      synonyms TEXT,
      isVegetarian TINYINT,
      isVegan TINYINT,
      family TEXT,
      region TEXT,
      imageURL TEXT
    )
  `);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const numberOfPages = 20;

  for (let currentPage = 1; currentPage <= numberOfPages; currentPage++) {
    await page.goto(`https://www.cheese.com/?per_page=100&page=${currentPage}`);
    console.log(
      `Current page: https://www.cheese.com/?per_page=100&page=${currentPage}`
    );
    await page.waitForLoadState("load");

    if (currentPage == 1) {
      await page.click("#cmpwelcomebtnyes > a");
      await page.click("#PopupSignupForm_0 > div.mc-modal > button");
    }

    const cheesesElements = await page.$$(".cheese-item > h3 > a");

    for (const cheeseElement of cheesesElements) {
      const cheesePage = await context.newPage();
      const href = await cheeseElement.getAttribute("href");

      await cheesePage.goto(`https://www.cheese.com${href}`);
      await cheesePage.waitForLoadState("load");

      let name = null,
        ingredients = null,
        country = null,
        type = null,
        texture = null,
        rind = null,
        colour = null,
        flavour = null,
        aroma = null,
        synonyms = null,
        isVegetarian = null,
        isVegan = null,
        family = null,
        region = null,
        imageURL = null;

      name = await getElementTextIfExists(cheesePage, "h1");
      ingredients = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_milk > p"
      );
      country = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_country > p"
      );
      type = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_moisture_and_type > p"
      );
      texture = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_texture > p"
      );
      rind = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_rind > p"
      );
      colour = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_tint > p"
      );
      flavour = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_taste > p"
      );
      aroma = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_smell > p"
      );
      synonyms = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_synonym > p"
      );
      isVegetarian = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_vegetarian > p"
      );
      isVegan = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_vegan > p"
      );
      family = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_family > p"
      );
      region = await getElementTextIfExists(
        cheesePage,
        "#collapse-information > div > ul > li.summary_region > p"
      );

      if (await cheesePage.$("div.cheese-image-border a img")) {
        imageURL = await cheesePage.$eval(
          "div.cheese-image-border a img",
          (img) => img.src
        );
      } else {
        imageURL = null;
      }
      cheesesDetails.push({
        name,
        ingredients,
        country,
        type,
        texture,
        rind,
        colour,
        flavour,
        aroma,
        synonyms,
        isVegetarian: await parseVegetarian(isVegetarian),
        isVegan: await parseVegan(isVegan),
        family,
        region,
        imageURL,
      });

      await cheesePage.close();
    }
  }

  for (const cheese of cheesesDetails) {
    await db.run(
      `INSERT INTO cheese (name, ingredients, country, type, texture, rind, colour, flavour, aroma, synonyms, isVegetarian, isVegan, family, region, imageURL) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cheese.name,
        cheese.ingredients,
        cheese.country,
        cheese.type,
        cheese.texture,
        cheese.rind,
        cheese.colour,
        cheese.flavour,
        cheese.aroma,
        cheese.synonyms,
        cheese.isVegetarian,
        cheese.isVegan,
        cheese.family,
        cheese.region,
        cheese.imageURL,
      ]
    );
  }

  console.log(cheesesDetails);
  await browser.close();
  await db.close();
  console.log("Browser and db connection has been closed");
})().catch(console.error);
