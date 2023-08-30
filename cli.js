import inquirer from "inquirer";
import { fetchAvatars, fetchShowAvatarIds } from "./lib/api.js";
import { client } from "./lib/client.js";
import fs from "fs";

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
      console.log("キャラクター情報取得中...");
      const [avatars, avatarIds] = await Promise.all([
        fetchAvatars(),
        fetchShowAvatarIds(uid),
      ]);
      return [
        { name: "すべて", value: avatarIds },
        ...avatarIds.map((id) => ({
          name: avatars[id].name,
          value: String(id),
        }))
      ];
    },
  },
]);

await fs.promises.writeFile("data/uid", answer.uid);

if (Array.isArray(answer.avatar)) {
  for (const avatar of answer.avatar) {
    await client({ ...answer, avatar });
  }
} else {
  await client(answer);

}

process.exit(0);
