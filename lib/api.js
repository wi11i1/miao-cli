import fetch from "node-fetch";

export const fetchShowAvatarIds = async (uid) => {
  const res = await fetch(`https://enka.network/u/${uid}/__data.json`);
  const { nodes } = await res.json();
  const { data } = nodes[1];
  const p1 = data[0].playerInfo;
  const p2 = data[p1].showAvatarInfoList;
  return data[p2].map((p) => data[data[p].avatarId]);
};

export const fetchAvatars = async () => {
  const res = await fetch("https://api.ambr.top/v2/jp/avatar");
  const { data } = await res.json();
  return data.items;
};
