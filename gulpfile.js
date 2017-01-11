var gulp = require("gulp");
var path = require("path");
var del = require("del");
var tslint = require("gulp-tslint");
var jasmine = require("gulp-jasmine");
var istanbul = require("gulp-istanbul");
var shell = require("gulp-shell");
var reporters = require("jasmine-reporters");
var Reporter = require("jasmine-terminal-reporter");

gulp.task("install:typings", shell.task(["gulp install:typings:src", "gulp install:typings:spec"]));
gulp.task("install:typings:src", shell.task("typings install"));
gulp.task("install:typings:spec", shell.task("typings install", { cwd: "spec/" }));

gulp.task("clean", function(cb) { del(["lib", "spec/build"], cb); });
gulp.task("clean:typings", function (cb) { del(["typings", "spec/typings"], cb); });

gulp.task("compile", shell.task("tsc"));
gulp.task("compile:spec", ["compile"], shell.task("tsc", {cwd: path.join(__dirname, "spec")}));

gulp.task("lint", function(){
	return gulp.src("src/**/*.ts")
		.pipe(tslint())
		.pipe(tslint.report());
});

gulp.task("lint-md", function(){
	return gulp.src(["**/*.md", "!node_modules/**/*.md"])
		.pipe(shell(["remark <%= file.path %> --frail --no-stdout --quiet --rc-path ./.remarkrc"]));
});

gulp.task("test", ["compile:spec"], function(cb) {
	var jasmineReporters = [ new Reporter({
			isVerbose: false,
			showColors: true,
			includeStackTrace: true
		}),
		new reporters.JUnitXmlReporter()
	];
	gulp.src(["lib/**/*.js"])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on("finish", function() {
			gulp.src("spec/build/**/*[sS]pec.js")
				.pipe(jasmine({ reporter: jasmineReporters}))
				.pipe(istanbul.writeReports({ reporters: ["text", "cobertura", "lcov"] }))
				.on("end", cb);
		});
});

gulp.task("default", ["compile"]);
