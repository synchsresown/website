require("dotenv").config();
const slugify = require("@sindresorhus/slugify");
const settings = require("../../helpers/constants");

const allSettings = settings.ALL_NOTE_SETTINGS;

function cleanPermalinkFromPath(inputPath) {
  const notesDir = "src/site/notes";
  const idx = inputPath.indexOf(notesDir);
  if (idx === -1) return null;
  let relative = inputPath.slice(idx + notesDir.length).replace(/^[/\\]+/, "").replace(/\.(md|canvas)$/i, "");
  const segments = relative.split(/[/\\]/).map((s) => slugify(s)).filter(Boolean);
  return segments.length ? "/" + segments.join("/") + "/" : null;
}

module.exports = {
  eleventyComputed: {
    layout: (data) => {
      if (data.tags.indexOf("gardenEntry") != -1) {
        return "layouts/index.njk";
      }
      return "layouts/note.njk";
    },
    permalink: (data) => {
      if (data.tags.indexOf("gardenEntry") != -1) {
        return "/";
      }
      const fromPath = cleanPermalinkFromPath(data.page?.inputPath || "");
      return fromPath || data.permalink || undefined;
    },
    settings: (data) => {
      const noteSettings = {};
      allSettings.forEach((setting) => {
        let noteSetting = data[setting];
        let globalSetting = process.env[setting];

        let settingValue =
          noteSetting || (globalSetting === "true" && noteSetting !== false);
        noteSettings[setting] = settingValue;
      });
      return noteSettings;
    },
  },
};
