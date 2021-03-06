/*
 * grunt-imageworsener
 * https://github.com/jeremy-green/grunt-imageworsener
 *
 * Copyright (c) 2014 Jeremy Green
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function (grunt) {
  var path = require('path');
  var os = require('os');
  var numCPUs = os.cpus().length;

  grunt.registerMultiTask('imageworsener', 'ImageWorsener task runner for grunt.', function () {

    if (!this.files[0]) {
      grunt.fail.fatal('No src or invalid src provided.');
      return;
    }

    var val;
    var done = this.async();
    var options = this.options({
      //default options
    });
    var args = [];

    for (var key in options.args) {
      val = options.args[key];
      if (typeof val === 'object') {
        val = val.join(',');
      }
      if (options.args.hasOwnProperty(key)) {
        args.push('-' + key, val.toString());
      }
    }

    grunt.util.async.forEachLimit(this.files, numCPUs, function (file, next) {

        if (!grunt.file.exists(file.dest)) {
          grunt.file.mkdir(file.dest);
        }

      grunt.util.async.forEachSeries(file.src, function (fileToBeAnalyzed, innerNext) {

        var src = fileToBeAnalyzed;
        var dest = path.join(file.dest, path.basename(src));

        args.push(src, dest);

        grunt.util.spawn({
          cmd: 'imagew',
          args: args
        }, function (error, result, code) {
          var srcIndex = args.indexOf(src);
          if (srcIndex > -1) {
            args.splice(srcIndex, 1);
          }
          var destIndex = args.indexOf(dest);
          if (destIndex > -1) {
            args.splice(destIndex, 1);
          }
          grunt.log.writeln('Saving image to ' + dest);
          innerNext(error);
        });
      });
    });
  });
};
