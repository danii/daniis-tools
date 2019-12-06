const [{src, dest}, fs, ts, rename, compress, merge] =
  ["!gulp", "!fs", "typescript", "rename", "minify", "!merge-stream"]
    .map(i => i.startsWith("!") ? i.substr(1) : `gulp-${i}`).map(require);

const requiredFolders = ["out"];

function ensureFolders() {
  requiredFolders.forEach(dir => fs.existsSync(dir) ? null : fs.mkdirSync(dir));
}

module.exports = {
  compile() {
    ensureFolders();

    const modSys = {"esmodule": "ESNext", "commonjs": "CommonJS"};
    const get = (mod) => ts.createProject("tsconfig.json", {"module": modSys[mod]});
    const applyTs = (pipe, mod) => pipe.pipe(get(mod)()).pipe(rename(p => p.basename = mod + "-" + p.basename));
    const applyCompress = (pipe, opts) => pipe.pipe(compress(opts));

    let out = [src("./src/*.ts")];
    out = out.map(i => [applyTs(i, "esmodule"), applyTs(i, "commonjs")]).flat();
    out = out.map(i => [i, applyCompress(i, {"ext": {"min": "-min.js"}, "preserveComments": "some"})]).flat();
    return merge(...out).pipe(dest("./out/"));
    //return src("./src/*.ts").pipe(project()).pipe(dest("./out/"));
  }
}
