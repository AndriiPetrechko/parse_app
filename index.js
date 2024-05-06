const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');

const URL = 'https://www.tus.si/#s2';
const FILE_NAME = 'catalogs.json';
const FOLDER_NAME = 'downloaded';

async function parsePage(pageUrl){
  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();
  await page.goto(pageUrl);

  const catalogsInfo = [];

  const domElements = await page.$$('.card-catalogue');

  await Promise.all(
    domElements.map(async (element, i) => {
      const obj = {}

      const catalogueName = await element.$('.hover > h3 > a');
      obj.catalogueName = (await catalogueName.evaluate(el => el.textContent, element)).trim();

      const link = await element.$('.hover > .zoom > figcaption > a.pdf');
      obj.link = (await link.evaluate(el => el.href, element)).trim();

      await downloadFile(obj.link, `${FOLDER_NAME}/${obj.catalogueName}_${i}.pdf`);      
      
      const date = await element.$('p');
      obj.date = (await date.evaluate(el => el.textContent, element)).trim();
      
      catalogsInfo.push(obj);
      return obj
    })
  )
  
  fs.writeFileSync(`${FOLDER_NAME}/${FILE_NAME}`, JSON.stringify(catalogsInfo, null, 2));
  console.log(`Catalogs information saved to ${FOLDER_NAME}/${FILE_NAME}`);

  await browser.close();
};


async function createFolder(folderName) {
  fs.mkdir(folderName, (err) => {
  if (err) {
    console.error('Error creating folder', err);
    return;
  }
  console.log(`Folder "${folderName}" created successfully`);
});
}

async function downloadFile(fileUrl, filePath) {
  try {
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'arraybuffer' 
    });

    fs.writeFileSync(filePath, response.data); 
    console.log(`File ${filePath} saved successfully`);
  } catch (error) {
    console.log(error);
  }
};

createFolder(FOLDER_NAME);
parsePage(URL);
