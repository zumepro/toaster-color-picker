import { $ } from "bun";


// Scripts
console.log("Building scripts...");
await Bun.build({
    entrypoints: ["src/index.ts"],
    minify: true,
    outdir: "server",
});


// HTML
console.log("\nBuilding pages...");
const html_filepaths_source = (await $`ls src/*.html`.text()).split("\n");
const html_minifier = require("html-minifier").minify;
for (const filepath_source of html_filepaths_source) {
    if (filepath_source == "") { continue; }
    console.log(filepath_source);
    const filepath_target = "server/" + filepath_source.substring(4);
    const content_source = await Bun.file(filepath_source).text();
    const content_target = html_minifier(content_source, {
        removeComments: true,
        removeCommentsFromCDATA: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
    });
    await Bun.write(filepath_target, content_target);
}


// Styles
console.log("\nBuilding styles...");
const style_filepaths_source = (await $`ls src/*.scss`.text()).split("\n");
const scss_minifier = require("sass");
for (const filepath_source of style_filepaths_source) {
    if (filepath_source == "") { continue; }
    const filepath_target = filepath_source.replace(/^[^/]+\/(.+).scss$/, "server/$1.css");
    if (filepath_target == filepath_source) { continue; }
    console.log(filepath_source);
    const content_target = scss_minifier.compile(filepath_source, { style: "compressed" }).css;
    await Bun.write(filepath_target, content_target);
}
