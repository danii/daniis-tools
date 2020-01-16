import Gulp from "gulp";
import ts from "gulp-typescript";
import minify from "gulp-minify";
import rename from "gulp-rename";
import filter from "gulp-filter";
import merge from "merge-stream";

const {src, dest} = Gulp;
const moduleGoals = new Map([["esmodule", "ESNext"], ["commonjs", "CommonJS"]]);
const optsCompress = {"ext": {"min": "-min.js"}, "preserveComments": "some"};

function mapMap(map, mapper) {
  return new Map(Array.from(map).map(function(pair, index) {
    const res = mapper(pair, index, map);
    return res instanceof Array && res.length == 2 ? res : [pair[0], res];
  }));
}

function mapMapToArray(map, mapper) {
  return Array.from(map).map((pair, ind) => mapper(pair, ind, map));
}

export function actuallyCompile(moduleSystem) {
  const tsProjects = mapMap(moduleGoals, ([key, value]) =>
    ts.createProject("tsconfig.json", {"module": value})());
  const dtsFilter = filter(["**", "!**/*.d.ts"], {"restore": true});
  const compile = (pipe, mod) => pipe.pipe(tsProjects.get(mod)).pipe(dtsFilter)
    .pipe(rename(path => path.basename = mod + "-" + path.basename));
  const compress = pipe => pipe.pipe(minify(optsCompress));

  const stage1 = [compile(src("./src/**/*.ts"), moduleSystem)];
  const stage2 = stage1.map(pipe => compress(pipe)).flat();
  const stage3 = [stage2[0].pipe(dtsFilter.restore), stage2.slice(1)];
  return merge(...stage3).pipe(dest("./dist/"));
}

export function compile() {
  const promisifyStream = stream => new Promise((rs, rj) => {
    stream.on("error", rj);
    stream.on("end", () => rs(stream));
  });
  
  return Array.from(moduleGoals).reduce((prom, [val]) =>
    prom.then(() => promisifyStream(actuallyCompile(val))), Promise.resolve());
}
