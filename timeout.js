const puppeteer = require("puppeteer");
const dotenv = require("dotenv");

dotenv.config();

const bundyUrl = `${process.env.BUNDY_URL}`;
const accessCode = `${process.env.ACCESS_CODE}`;
const timeZone = `${process.env.TIMEZONE}`;
const longitude = Number(process.env.LONGITUDE);
const latitude = Number(process.env.LATITUDE);

module.exports = async () => {
  // set some options (set headless to false so we can see
  // this automated browsing experience)
  let launchOptions = { headless: false, args: ["--start-maximized"] };
  const browser = await puppeteer.launch(launchOptions);

  const context = browser.defaultBrowserContext();
  await context.overridePermissions(bundyUrl, ["geolocation", "camera"]);

  const page = await browser.newPage();

  // set approx. office address
  await page.setGeolocation({
    latitude,
    longitude
  });

  await page.setViewport({
    width: 1366,
    height: 768,
    deviceScaleFactor: 1
  });

  // emulate timezone
  await page.emulateTimezone(timeZone);

  await page.goto(bundyUrl);
  // wait 5 seconds to load date/time and geolocation
  await page.waitFor(3000);

  // click Time Out button
  await page.click("#btnOut");

  // input access code
  await page.evaluate(
    val =>
      (document.querySelector(
        "input#actionAccessCode.form-control"
      ).value = val),
    accessCode
  );

  await page.screenshot({ path: "timeOutAcessCode.png" });

  // click Time out button in modal
  await page.click("#actionTimeType");

  await page.waitFor(500);
  await page.screenshot({ path: "timedOut.png" });

  await browser.close();
};
