import fs from "fs";
import artTemplate from "art-template";
import puppeteer from "puppeteer";
import { profileArtis } from "../plugins/miao-plugin/apps/profile/ProfileArtis.js";
import { renderProfile } from "../plugins/miao-plugin/apps/profile/ProfileDetail.js";
import { Character } from "../plugins/miao-plugin/models/index.js";
import { createClient } from "redis";
import { getProfile } from "../plugins/miao-plugin/apps/profile/ProfileCommon.js";

globalThis.redis = createClient();
redis.on("error", (err) => console.log("Redis Client Error", err));

export async function client({ uid, avatar, mode }) {
  await redis.connect();

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
    await renderProfile(e, char, mode, { dmgIdx: 0 });
  } else if (mode === "artis") {
    await profileArtis(e);
  } else if (mode === "refresh") {
    await getProfile(e);
  }

  await redis.disconnect();
}

async function render(name, path, params, cfg) {
  const pluResPath = process.cwd() + "/plugins/miao-plugin/resources/";

  const additionalParams = cfg.beforeRender({
    data: { pluResPath },
  });

  if (params?.imgs?.splash0) {
    params.imgs.splash0 = params.imgs.splash0.replace(
      "splash0.webp",
      "splash.webp"
    );
  }
  if (params?.splash) {
    params.splash = params.splash.replace("splash0.webp", "splash.webp");
  }

  const html = artTemplate(`${pluResPath}${path}.html`, {
    ...additionalParams,
    ...params,
  });

  let image = params?.data?.name;
  if (image) {
    if (params?.mode) {
      image += `-${params.mode}`;
    } else {
      image += `-${path.split("/")[1]}`;
    }
  } else {
    image = path.replace("/", "-");
  }

  const filepath = await writeHtml(name, html);
  const imageName = await screenshot(image, filepath);
  console.log(`Success to create ${imageName}`);
}

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
  let body = (await page.$("#container")) || (await page.$("body"));

  let randData = {
    // encoding: 'base64',
    type: "jpeg",
    omitBackground: false,
    quality: 90,
  };

  const buff = await body.screenshot(randData);

  await page.close().catch((err) => logger.error(err));

  const filename = `${name}.jpg`;
  await fs.promises.writeFile(filename, buff);
  return filename;
}
