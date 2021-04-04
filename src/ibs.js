const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');
const _ = require('lodash');
const fse = require('fs-extra');

// برای رد شدن از https بدون لایسنس
const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // این آپشن لازم است تا گواهینامه های امن بدون اعتبار نادیده گرفته شوند
  }),
});

function printList() {
  instance
    .get('https://10.1.33.80/report-khorasan-razavi', {
      auth: {
        username: 'khorasan-razavi',
        password: 'iMaif3uh4PaeBohg',
      },
    })
    .then(function (response) {
      const $ = cheerio.load(response.data);
      const list = $('a').text().split('daily');

      list.map((item) => {
        if (!item.includes('user') && item.includes('razavi'))
          processFileContent(item);
      });
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function () {
      // always executed
    });
}

function processFileContent(filePath) {
  instance
    .get('https://10.1.33.80/report-khorasan-razavi/daily' + filePath, {
      auth: {
        username: 'khorasan-razavi',
        password: 'iMaif3uh4PaeBohg',
      },
    })
    .then(function (response) {
      createOneLine(response.data, filePath);
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function () {
      // always executed
    });
}

function createOneLine(input, filePath) {
  if (!input) return;
  const lines = input.split('\n'); // جدا کردن خط ها در یک آرایه
  const master = lines.find((line) => line.includes('Master')); // پیدا کردن اولین خط دارای مستر
  const masterReverse = lines
    .slice()
    .reverse()
    .find((line) => line.includes('Master')); // پیدا کردن آخرین خط دارای مستر

  let masterSplit = master.split(',');
  const masterReverseSplit = masterReverse.split(',');

  //ممکن است در بعضی فایل ها دو خط مستر داشته باشیم و مستر با عدد بزرگتر مورد نظر است، که باید چک شود و برداشته شود
  // در بعضی فایل ها اعداد با دابل کوت احاطه شده که حذفشان می کنیم
  if (
    masterSplit[2].replace(/['"]+/g, '') <
    masterReverseSplit[2].replace(/['"]+/g, '') //حذف دابل و سینگل کوت
  )
    masterSplit = masterReverseSplit;
  const download = _.round(
    masterSplit[2].replace(/['"]+/g, '') / 1024 / 1024 / 1024 / 1024,
    1
  );
  const upload = _.round(
    masterSplit[3].replace(/['"]+/g, '') / 1024 / 1024 / 1024 / 1024,
    1
  );
  const out = `${
    filePath.split('zavi_')[1].split('.csv')[0] // استخراج تاریخ از روی نام فایل
  },${download},${upload},${_.round(download + upload, 1)},${
    'https://10.1.33.80/report-khorasan-razavi/daily' + filePath
  }`;
  return out;
}

function makeFile() {
  //console.log('date,download,upload,sum,link\n');

  const file = 'file.csv';
  const data = printList();
  // With Promises:
  fse
    .outputFile(file, 'date,download,upload,sum,link\n' + data)
    .catch((err) => {
      console.error(err);
    });
}

async function example(f, data) {
  try {
    await fse.outputFile(f, 'date,download,upload,sum,link\n' + data);
  } catch (err) {
    console.error(err);
  }
}

example(file.csv, printList());
//makeFile();
