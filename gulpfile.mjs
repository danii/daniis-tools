import Gulp from "gulp";
import ts from "gulp-typescript";
import minify from "gulp-minify";
import rename from "gulp-rename";
import filter from "gulp-filter";
import merge from "merge-stream";

const {src, dest} = Gulp;
const moduleGoals = {"esmodule": "ESNext", "commonjs": "CommonJS"};
const optsCompress = {"ext": {"min": "-min.js"}, "preserveComments": "some"};

function mapObject(object, func) {
  return Object.fromEntries(Object.entries(object).map((item, index) => [item[0], func(item, index, object)]));
}

function mapObjectToArray(object, func) {
  return Object.entries(object).map((item, index) => func(item, index, object));
}

export function compile() {
  const tsProjects = mapObject(moduleGoals, ([key, value]) =>
    ts.createProject("tsconfig.json", {"module": value})());
  const dtsFilter = filter(["**", "!**/*.d.ts"], {"restore": true});
  const compile = (pipe, mod) => pipe.pipe(tsProjects[mod]).pipe(dtsFilter)
    .pipe(rename(path => path.basename = mod + "-" + path.basename));
  const compress = pipe => pipe.pipe(minify(optsCompress));
    
  const source = src("./src/**/*.ts");
  const stage1 = mapObjectToArray(tsProjects, ([key]) => compile(source, key)).flat();
  const stage2 = stage1.map(pipe => compress(pipe)).flat();
  const stage3 = [stage2[0].pipe(dtsFilter.restore), stage2.slice(1)];
  return merge(...stage3).pipe(dest("./dist/"));
}
