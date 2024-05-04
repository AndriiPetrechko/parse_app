const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'https://www.tus.si/#s2';
const FILE_NAME = 'catalogs.json';

(async () => {
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();
  await page.goto(URL);

  const catalogsInfo = [];

  const domElements = await page.$$('.card-catalogue');
  for (let element of domElements) {
    const obj = {}

    const catalogueName = await element.$('.hover > h3 > a');
    obj.catalogueName = (await catalogueName.evaluate(el => el.textContent, element)).trim();

    const link = await element.$('.hover > h3 > a');
    obj.link = (await link.evaluate(el => el.href, element)).trim();
    
    const date = await element.$('p');
    obj.date = (await date.evaluate(el => el.textContent, element)).trim();   
    
    catalogsInfo.push(obj);
  }

  console.log(catalogsInfo);
  
  fs.writeFileSync(FILE_NAME, JSON.stringify(catalogsInfo, null, 2));
  console.log(`Catalogs information saved to file ${FILE_NAME}`);

  await browser.close();
})();