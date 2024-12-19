"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var umami_esbuild_plugin_css_modules_exports = {};
__export(umami_esbuild_plugin_css_modules_exports, {
  default: () => umami_esbuild_plugin_css_modules_default
});
module.exports = __toCommonJS(umami_esbuild_plugin_css_modules_exports);
var import_node_crypto = __toESM(require("node:crypto"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var import_promises = __toESM(require("node:fs/promises"), 1);
var import_postcss = __toESM(require("postcss"), 1);
var import_postcss_modules = __toESM(require("postcss-modules"), 1);
const md5 = (str) => import_node_crypto.default.createHash("md5").update(str).digest("hex");
function umami_esbuild_plugin_css_modules_default(options) {
  async function processCSSModules(css, filename) {
    let cssModulesJSON = {};
    const result = await (0, import_postcss.default)([
      (0, import_postcss_modules.default)({
        generateScopedName: function(name, filename2, css2) {
          const file = import_node_path.default.basename(filename2, ".module.css");
          const hash = btoa(md5(filename2 + name + css2)).substring(0, 5);
          return `${file}_${name}__${hash}`.replace("global_", "");
        },
        getJSON: (cssFileName, json) => {
          cssModulesJSON = json;
        },
        ...options
      })
    ]).process(css, { from: filename });
    return {
      css: result.css,
      cssModulesJSON
    };
  }
  return {
    name: "css-modules",
    setup(build) {
      const cssContents = /* @__PURE__ */ new Map();
      build.onResolve({ filter: /\.module\.css$/ }, (args) => {
        return {
          path: import_node_path.default.resolve(args.resolveDir, args.path),
          namespace: "css-modules"
        };
      });
      build.onLoad({ filter: /.*/, namespace: "css-modules" }, async (args) => {
        const css = await import_promises.default.readFile(args.path, "utf8");
        const { css: processedCSS, cssModulesJSON } = await processCSSModules(css, args.path);
        const key = `css:${md5(args.path)}`;
        cssContents.set(key, processedCSS);
        const virtualModule = `
        import "${key}";
        export default ${JSON.stringify(cssModulesJSON)};
      `;
        return {
          contents: virtualModule,
          loader: "js",
          watchFiles: [args.path]
        };
      });
      build.onResolve({ filter: /^css:/ }, (args) => {
        return { path: args.path, namespace: "virtual-css" };
      });
      build.onLoad({ filter: /.*/, namespace: "virtual-css" }, (args) => {
        const css = cssContents.get(args.path);
        return {
          contents: css || "",
          loader: "css"
        };
      });
    }
  };
}
