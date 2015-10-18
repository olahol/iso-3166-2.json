var fs = require("fs");
var csv = require("csv");
var filesize = require("file-size");

var OUTPUT_FILE = __dirname + "/iso-3166-2.json";

function eQuest(cb) {
  var sourceFile = __dirname + "/data/eQuest.csv";

  fs.readFile(sourceFile, "utf8", function (err, data) {
    if (err) { return cb(err); }

    csv.parse(data, function (err, rows) {
      if (err) { return cb(err); }

      var output = {};

      var currentCode, currentSub;

      function validate(sub) {
        if (sub.split("-")[0] !== currentCode) {
          throw new Error("country did not equal sub code");
        }
      }

      rows.forEach(function (row) {
        var code = row[0];
        var sub1 = row[1];
        var sub2 = row[2];
        var name = row[3];

        var sub = sub1 || sub2;

        if (code) {
          currentCode = code;
          output[currentCode] = {name: name, divisions: {}}
        }

        if (sub) {
          validate(sub);
          currentSub = sub;
          output[currentCode].divisions[currentSub] = name;
        }
      });

      cb(null, output);
    });
  });
}

eQuest(function (err, data) {
  if (err) { console.error(err); }

  var output = JSON.stringify(data);


  fs.stat(OUTPUT_FILE, function (err, stats) {
    if (err) { console.error(err); }

    var oldSize = stats.size;

    fs.writeFile(OUTPUT_FILE, output, "utf8", function (err) {
      if (err) { console.error(err); }

      fs.stat(OUTPUT_FILE, function (err, stats) {
        if (err) { console.error(err); }

        var newSize = stats.size;

        console.log("OLD FILE SIZE: %s", filesize(oldSize).human());
        console.log("NEW FILE SIZE: %s", filesize(newSize).human());
      });
    });
  });
});
