import { Buffer } from "buffer";

const DEFAULT_METADATA = {
  packname: "SkyStore",
  author: "SkyStore Bot",
  emojis: ["🛒"],
};

async function addExifToWebp(webpBuffer, metadata = {}) {
  try {
    const { exiftool } = await import("exiftool-vendored").catch(() => null) || {};
    if (!exiftool) return webpBuffer;

    const pack = metadata.packname || DEFAULT_METADATA.packname;
    const auth = metadata.author || DEFAULT_METADATA.author;

    const jsonMeta = JSON.stringify({
      "sticker-pack-name": pack,
      "sticker-pack-publisher": auth,
      emojis: metadata.emojis || DEFAULT_METADATA.emojis,
    });

    const enc = new TextEncoder();
    const jsonBuf = enc.encode(jsonMeta);

    const exifHeader = Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    ]);

    const exifData = Buffer.concat([exifHeader, jsonBuf]);

    const RIFF = webpBuffer.slice(0, 4);
    const SIZE = webpBuffer.slice(4, 8);
    const WEBP = webpBuffer.slice(8, 12);
    const rest = webpBuffer.slice(12);

    const exifChunkName = Buffer.from("EXIF");
    const exifChunkSize = Buffer.allocUnsafe(4);
    exifChunkSize.writeUInt32LE(exifData.length, 0);

    const newRiffSize = Buffer.allocUnsafe(4);
    newRiffSize.writeUInt32LE(
      4 + 4 + exifData.length + (exifData.length % 2) + rest.length + 8,
      0
    );

    const result = Buffer.concat([
      RIFF,
      newRiffSize,
      WEBP,
      exifChunkName,
      exifChunkSize,
      exifData,
      exifData.length % 2 ? Buffer.from([0x00]) : Buffer.alloc(0),
      rest,
    ]);

    return result;
  } catch {
    return webpBuffer;
  }
}

export { addExifToWebp, DEFAULT_METADATA };
