const { chromium } = require("playwright");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

(async () => {
  const cheesesDetails = [];

  const db = await open({
    filename: "./cheeseDB.sqlite",
    driver: sqlite3.Database,
  });

  // Tworzenie tabeli 'cheese', jeśli nie istnieje
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
      isVegetarian TEXT,
      isVegan TEXT,
      family TEXT,
      region TEXT
    )
  `);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`https://www.cheese.com/?per_page=100&page=1`);
  await page.waitForLoadState("load");
  await page.click("#cmpwelcomebtnyes > a");
  await page.click("#PopupSignupForm_0 > div.mc-modal > button");

  const cheesePage = await context.newPage();

  // Otwieranie strony z szczegółami sera Canadian Cheddar
  await cheesePage.goto(`https://www.cheese.com/canadian-cheddar/`);
  await cheesePage.waitForLoadState("load");

  // Inicjalizacja zmiennych na wypadek niepowodzenia
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
    region = null;

  // Pobieranie informacji, jeśli element istnieje na stronie
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
    isVegetarian,
    isVegan,
    family,
    region,
  });

  console.log(cheesesDetails);
  await browser.close();
  await db.close();
  console.log("Browser and db connection has been closed");
})().catch(console.error);

async function getElementTextIfExists(page, selector) {
  const element = await page.$(selector);
  if (element) {
    const text = await element.textContent();
    return text.trim();
  }
  return null;
}
