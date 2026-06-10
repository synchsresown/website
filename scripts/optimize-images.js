const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC = path.join(__dirname, "../src/site/img");
const DEST = path.join(__dirname, "../dist/img");
const MAX_WIDTH = 700;
const JPEG_QUALITY = 82;
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}K`;
  return `${bytes}B`;
}

async function optimizeFile(srcPath, destPath) {
  const before = fs.statSync(srcPath).size;
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  const meta = await sharp(srcPath).metadata();
  const needsResize = Boolean(meta.width && meta.width > MAX_WIDTH);
  const ext = path.extname(srcPath).toLowerCase();

  if (!needsResize && before <= 200 * 1024) {
    fs.copyFileSync(srcPath, destPath);
    return;
  }

  let pipeline = sharp(srcPath).rotate().resize({
    width: MAX_WIDTH,
    withoutEnlargement: true,
  });

  const tempPath = `${destPath}.tmp`;
  if (ext === ".jpg" || ext === ".jpeg") {
    await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(tempPath);
  } else if (ext === ".png") {
    await pipeline.png({ compressionLevel: 9, effort: 10 }).toFile(tempPath);
  } else if (ext === ".webp") {
    await pipeline.webp({ quality: 80 }).toFile(tempPath);
  } else {
    fs.copyFileSync(srcPath, destPath);
    return;
  }

  const after = fs.statSync(tempPath).size;
  const name = path.relative(SRC, srcPath);
  if (after <= before || needsResize) {
    fs.renameSync(tempPath, destPath);
    console.log(`${name}: ${formatSize(before)} -> ${formatSize(after)}`);
  } else {
    fs.unlinkSync(tempPath);
    fs.copyFileSync(srcPath, destPath);
    console.log(`${name}: kept ${formatSize(before)}`);
  }
}

async function copyTree(srcDir, destDir) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await copyTree(srcPath, destPath);
      continue;
    }

    if (IMAGE_EXT.test(entry.name)) {
      await optimizeFile(srcPath, destPath);
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  if (!fs.existsSync(SRC)) {
    console.log("No image source directory found, skipping.");
    return;
  }

  fs.mkdirSync(DEST, { recursive: true });
  await copyTree(SRC, DEST);

  const total = execTotalSize(DEST);
  console.log(`Optimized images in dist/img (${formatSize(total)} total)`);
}

function execTotalSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += execTotalSize(full);
    else total += fs.statSync(full).size;
  }
  return total;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
