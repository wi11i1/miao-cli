import fs from "fs";
import artTemplate from "art-template";
import puppeteer from "puppeteer";
import { profileArtis } from "../plugins/miao-plugin/apps/profile/ProfileArtis.js";
import ProfileDetail from "../plugins/miao-plugin/apps/profile/ProfileDetail.js";
import { Character } from "../plugins/miao-plugin/models/index.js";
import { getProfileRefresh } from "../plugins/miao-plugin/apps/profile/ProfileCommon.js";

import "./global.js";

export async function client({ uid, avatar, mode }) {
  const e = {
    user_id: 1,
    uid,
    avatar,
    reply: console.log,
    runtime: { render },
  };

  //  await Profile.request(uid, e);

  if (mode === "profile" || mode === "dmg") {
    const char = Character.get(avatar);
    await ProfileDetail.render(e, char, mode, { dmgIdx: 0 });
  } else if (mode === "artis") {
    await profileArtis(e);
  } else if (mode === "refresh") {
    await getProfileRefresh(e);
  }
}

async function render(name, path, params, cfg) {
  const resPath = process.cwd() + "/plugins/miao-plugin/resources/";

  const additionalParams = cfg.beforeRender({
    data: {
      pluResPath: resPath.replace(/\\/g, "/"),
    },
  });

  if (params?.splash) {
    params.splash = renameSplash(params.splash);
  } else if (params?.data?.costumeSplash) {
    params.data.costumeSplash = params.data.imgs.splash;
  }

  const html = artTemplate(`${resPath}${path}.html`, {
    ...additionalParams,
    ...params,
  });

  const filepath = await writeHtml(name, html);

  const image = getImageName(params.data?.name, params.mode, path);
  const imageName = await screenshot(image, filepath);

  console.log(`Success to create ${imageName}`);
}

const renameSplash = (value) => value.replace("splash0.webp", "splash.webp");

const getImageName = (name, mode, path) => {
  if (!name) {
    return path.replace("/", "-");
  }
  if (mode) {
    return `${name}-${mode}`;
  }
  return `${name}-${path.split("/")[1]}`;
};

async function writeHtml(name, html) {
  const htmlDir = process.cwd() + "/data/html/";
  fs.existsSync(htmlDir) || (await fs.promises.mkdir(htmlDir));

  const filepath = htmlDir + `/${name}.html`;
  await fs.promises.writeFile(filepath, html);
  return filepath;
}

async function screenshot(name, filepath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-setuid-sandbox",
      "--no-first-run",
      "--no-sandbox",
      "--no-zygote",
      "--single-process",
    ],
  });

  if (!browser) {
    return console.error("Failed to start puppeteer Chromium");
  }

  const page = await browser.newPage();
  await page.goto(`file://${filepath}`);

  const body = (await page.$("#container")) || (await page.$("body"));
  const buff = await body.screenshot({
    type: "jpeg",
    omitBackground: false,
    quality: 90,
  });

  await page.close();

  const filename = `${name}.jpg`;
  await fs.promises.writeFile(filename, buff);
  return filename;
}
