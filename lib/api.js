import fetch from "node-fetch";

export const fetchShowAvatarIds = async (uid) => {
  const res = await fetch(`https://enka.network/api/uid/${uid}/?info`);
  const data = await res.json();
  return data.playerInfo.showAvatarInfoList.map((a) => a.avatarId);
};

export const fetchAvatars = async () => {
  const res = await fetch("https://api.ambr.top/v2/jp/avatar");
  const { data } = await res.json();
  return data.items;
};
