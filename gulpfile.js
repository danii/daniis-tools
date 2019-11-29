const [{src, dest}, ts] = ["!gulp", "typescript"]
  .map(i => i.startsWith("!") ? i.substr(1) : `gulp-${i}`).map(require);

module.exports = {
  compile() {
    const project =
      ts.createProject("tsconfig.json", {"experimentalDecorators": true});
    return src("./src/*.ts").pipe(project()).pipe(dest("./out/"));
  }
}
