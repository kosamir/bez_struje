import puppeteer from "puppeteer";

var brow;
/*
 * run only one instance of chromium
 */
export const getBrowser = async () => {
  if (!brow) {
    brow = await puppeteer.launch({
      headless: true,
      defaultViewport: null
    });
  }
  return brow;
};

/**
 * getDistributionAreaSelectChild i.e second select input on
 * `https://www.hep.hr/ods/bez-struje/19?dp=sbrod
` */
export const getDistributionAreaSelectChild = async dp => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(`${process.env.HEP_URL_BASE}?dp=${dp}`, {
    waitUntil: "domcontentloaded"
  });
  //  multiple elements and get second puppeteer stuff
  let elementsHandles = await page.evaluateHandle(() =>
    document.querySelectorAll("select")
  );
  let elements = await elementsHandles.getProperties();
  let elements_arr = Array.from(elements.values());
  const outer_html = await (
    await elements_arr[1].getProperty("outerHTML")
  ).jsonValue();
  return outer_html;
};

/**
 * getDistributionAreaSelect i.e first select  on
 * `https://www.hep.hr/ods/bez-struje/19
` */
export const getDistributionAreaSelect = async () => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(`${process.env.HEP_URL_BASE}`, {
    waitUntil: "domcontentloaded"
  });

  const element = await page.$("#dp");
  const element_property = await element.getProperty("outerHTML");
  const outer_html = await element_property.jsonValue();
  return outer_html;
};

const getInnerTextFromElements = async (page, selector) => {
  const elements = await page.$$(selector);
  let promises = elements.map(async e => {
    const text = await (await e.getProperty("innerText")).jsonValue();
    return await text;
  });
  return await Promise.all(promises);
};

/*
 * get data from https://www.hep.hr/ods/bez-struje/19
 *
 */
export const hepCrawler = async (dp, dpChild) => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(`${process.env.HEP_URL_BASE}?dp=${dp}&el=${dpChild}`, {
    waitUntil: "domcontentloaded"
  });

  const handles = await page.$$(".dan");
  const propertyJsHandles = await Promise.all(
    handles.map(handle => handle.getProperty("href"))
  );
  const hrefs2 = await Promise.all(
    propertyJsHandles.map(handle => handle.jsonValue())
  );
  let results = [];
  for (let i = 0; i < hrefs2.length; ++i) {
    const link = hrefs2[i];
    const datum = link.substring(link.lastIndexOf("=") + 1);
    await Promise.all([page.waitForNavigation(), page.goto(link)]);

    const gradovi = await getInnerTextFromElements(page, ".grad");
    const ulice = await getInnerTextFromElements(page, ".ulica");
    const kada = await getInnerTextFromElements(page, ".kada");
    const tipovi = await getInnerTextFromElements(page, ".tip");
    for (let i = 0; i < gradovi.length; ++i) {
      results.push({
        datum: datum,
        vrijeme: kada[i],
        grad: gradovi[i],
        ulice: ulice[i],
        tip: tipovi[i]
      });
    }
  }
  await browser.close();
  return [results, dp, dpChild];
};
