const WWWROOT = "../httpdocs/";
const JS_DEST = WWWROOT + "scripts/";
const CSS_DEST = WWWROOT + "styles/";
const IMG_DEST = WWWROOT + "images/";
const FONTS_DEST = WWWROOT + "styles/fonts/";

const year = new Date().getFullYear();
const VERSION = "2.0.0"
const LICENSE = `
/**
 * DataEntry ${VERSION}
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright ${year}, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
`.replace(/^\s+/m, "")

module.exports = {

  // root folder to less source code
  lessRoot: "./code/styles/**/*.less",

  distFolder: "../dist/",
  cssDistFolder: "../dist/styles/",

  license: LICENSE,
  version: VERSION,

  lessToCss: [
    {
      src: "./code/styles/dataentry/dataentry.less",
      dest: CSS_DEST
    },
    {
      src: "./code/styles/examples.less",
      dest: CSS_DEST,
      nodist: true
    }
  ],
  
  // less code built only for distribution package
  lessToCssExtras: [],

  esToJs: [
    {
      entry: "./code/scripts/forms/dataentry.js",
      destfolder: JS_DEST,
      filename: "dataentry"
    }/*,
    {
      entry: "./code/tests/dataentry.spec.js",
      destfolder: JS_DEST,
      filename: "tests"
    },
    {
      entry: "./code/scripts/main_tests.js",
      destfolder: JS_DEST,
      filename: "tests"
    },*/
  ],

  toBeCopied: [
    {
      src: "code/favicon.ico",
      dest: WWWROOT
    },
    {
      src: "code/*.png",
      dest: WWWROOT
    },
    {
      src: "code/images/*",
      dest: IMG_DEST
    },
    {
      src: "libs/**/*.*",
      dest: WWWROOT
    }
  ],

  test: {
    karma: "karma.conf.js"
  }
};
