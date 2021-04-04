const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');

const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

function csvlist() {
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
      list.shift();
      return list;
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function () {
      // always executed
    });
}

// function getContent(filePath) {
//   instance
//     .get('https://10.1.33.80/report-khorasan-razavi/daily' + filePath, {
//       auth: {
//         username: 'khorasan-razavi',
//         password: 'iMaif3uh4PaeBohg',
//       },
//     })
//     .then(function (response) {
//       console.log(response.data);
//     })
//     .catch(function (error) {
//       console.log(error);
//     })
//     .then(function () {
//       // always executed
//     });
// }
// const r = csvlist();
// console.log(r);
csvlist();
