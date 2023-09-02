import fs from "fs";
import inquirer from "inquirer";
import { getPlayerAvatars, createImge } from "./lib/client.js";

const answer = await inquirer.prompt([
  {
    type: "list",
    name: "mode",
    message: "モードを選択",
    choices: [
      { value: "profile", name: "カード作成：プロフィール" },
      { value: "artis", name: "カード作成：聖遺物のみ" },
      { value: "dmg", name: "カード作成：ダメージのみ" },
      { value: "refresh", name: "ステータス更新" },
    ],
    default: "profile",
  },
  {
    name: "uid",
    message: "UIDを入力",
    default: () => {
      if (fs.existsSync("data/uid")) {
        return fs.readFileSync("data/uid").toString();
      }
    },
    validate: (input) => {
      if (!/[1-9][0-9]{8}/.test(input)) {
        return "UIDが不正です";
      }
      return true;
    },
  },
  {
    type: "list",
    name: "avatar",
    message: "キャラクターを選択",
    when: ({ mode }) => mode !== "refresh",
    choices: async ({ uid }) => {
      const data = await getPlayerAvatars(uid);
      const all = data.map(({ value }) => value);
      return [{ value: all, name: "すべて" }, ...data];
    },
  },
]);

await fs.promises.writeFile("data/uid", answer.uid);

if (Array.isArray(answer.avatar)) {
  await Promise.all(
    answer.avatar.map((avatar) => createImge({ ...answer, avatar })),
  );
} else {
  await createImge(answer);
}

process.exit(0);
