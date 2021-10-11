const axios = require("axios");
const https = require("https");
const cheerio = require("cheerio");
const _ = require("lodash");
const fs = require("fs");
const moment = require("jalali-moment");

// برای رد شدن از https بدون لایسنس
const instance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // این آپشن لازم است تا گواهینامه های امن بدون اعتبار نادیده گرفته شوند
  }),
});

async function makeFile() {
  try {
    const response = await instance.get(
      "https://10.1.33.80/report-khorasan-razavi",
      {
        auth: {
          username: "khorasan-razavi",
          password: "iMaif3uh4PaeBohg",
        },
      }
    );
    const $ = cheerio.load(response.data);
    const list = $("a").text().split("daily");
    console.log("Making CSV File...");
    fs.appendFile(
      "output1.csv",
      "date,dateFa,yearFa,monthFa,dwnldTB,upldTB,sumTB,fileLink\n",
      function (err) {
        if (err) console.log(err);
      }
    );
    list.map((item) => {
      if (!item.includes("user") && item.includes("razavi")) {
        process(item);
      }
    });
  } catch (error) {
    console.error(error);
  }
}

async function process(path) {
  try {
    const response = await instance.get(
      "https://10.1.33.80/report-khorasan-razavi/daily" + path,
      {
        auth: {
          username: "khorasan-razavi",
          password: "iMaif3uh4PaeBohg",
        },
      }
    );
    feedFile(response.data, path);
  } catch (error) {
    console.error(error);
  }
}

function feedFile(input, path) {
  if (!input) return;
  const lines = input.split("\n"); // جدا کردن خط ها در یک آرایه
  const master = lines.find((line) => line.includes("Master")); // پیدا کردن اولین خط دارای مستر
  const masterReverse = lines
    .slice()
    .reverse()
    .find((line) => line.includes("Master")); // پیدا کردن آخرین خط دارای مستر

  let masterSplit = master.split(",");
  const masterReverseSplit = masterReverse.split(",");

  //ممکن است در بعضی فایل ها دو خط مستر داشته باشیم و مستر با عدد بزرگتر مورد نظر است، که باید چک شود و برداشته شود
  // در بعضی فایل ها اعداد با دابل کوت احاطه شده که حذفشان می کنیم
  if (
    masterSplit[2].replace(/['"]+/g, "") <
    masterReverseSplit[2].replace(/['"]+/g, "") //حذف دابل و سینگل کوت
  )
    masterSplit = masterReverseSplit;
  const download = _.round(
    masterSplit[2].replace(/['"]+/g, "") / 1024 / 1024 / 1024 / 1024,
    1
  );
  const upload = _.round(
    masterSplit[3].replace(/['"]+/g, "") / 1024 / 1024 / 1024 / 1024,
    1
  );
  const date = path.split("zavi_")[1].split(".csv")[0]; // استخراج تاریخ از روی نام فایل
  const dateFa = moment(date, "YYYY-MM-DD").locale("fa").format("YYYY-MM-DD");
  const yr = moment(date, "YYYY-MM-DD").locale("fa").format("YYYY");
  const mon = moment(date, "YYYY-MM-DD").locale("fa").format("MM");
  const out = `${date},${dateFa},${yr},${mon},${download},${upload},${_.round(
    download + upload,
    1
  )},${"https://10.1.33.80/report-khorasan-razavi/daily" + path}\n`;
  fs.appendFile("output1.csv", out, function (err) {
    if (err) console.log(err);
  });
}

makeFile();
