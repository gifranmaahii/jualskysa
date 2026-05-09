async function getProfilePicture(sock, jid) {
  try {
    return await sock.profilePictureUrl(jid, "image");
  } catch {
    return null;
  }
}

async function getProfileBuffer(sock, jid) {
  try {
    const url = await sock.profilePictureUrl(jid, "image");
    if (!url) return null;
    const { default: axios } = await import("axios");
    const res = await axios.get(url, { responseType: "arraybuffer", timeout: 10000 });
    return Buffer.from(res.data);
  } catch {
    return null;
  }
}

export { getProfilePicture, getProfileBuffer };
