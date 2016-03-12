var path = require("path");

module.exports = function (grunt) {

  var rel = "../../source";
  var lessFiles = {};
  lessFiles[rel + "/styles/public.css"] = rel + "/styles/public.less";
  lessFiles[rel + "../../dist/dataentry.css"] = rel + "/styles/areas/controls/dataentry.less";

  var js = [
    "../../source/scripts/libs/dataentry.js"
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    less: {
      public: {
        options: {
          paths: [rel + "/styles/shared/public"],
          cleancss: true
        },
        files: lessFiles
      }
    },

    concat: {
      dist: {
        src: js,
        dest: "../../dist/dataentry.js"
      }
    },

    uglify: {
      options: {
        screwIE8: true,
        preserveComments: /(?:^!|@(?:license|preserve|cc_on))/
      },
      dist: {
        files: {
          "../../dist/dataentry.min.js": ["../../dist/dataentry.js"]
        }
      }
    }
  });
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.registerTask("default", ["less", "concat", "uglify"]);
};
