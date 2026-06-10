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
      const tags = data.tags || [];
      if (tags.includes("gardenEntry")) {
        return "layouts/minimal-home.njk";
      }
      if (tags.includes("projectsEntry")) {
        return "layouts/minimal-projects.njk";
      }
      if (data.page?.inputPath && data.page.inputPath.includes("/Objects/")) {
        return "layouts/minimal-note.njk";
      }
      return "layouts/note.njk";
    },
    permalink: (data) => {
      const tags = data.tags || [];
      if (tags.includes("gardenEntry")) {
        return "/";
      }
      if (tags.includes("projectsEntry")) {
        return "/projects/";
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
