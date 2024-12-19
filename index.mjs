import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import postcss from 'postcss';
import postcssModules from 'postcss-modules';

const md5 = str => crypto.createHash('md5').update(str).digest('hex');

export default function(options) {
  async function processCSSModules(css, filename) {
    let cssModulesJSON = {};

    const result = await postcss([
      postcssModules({
        generateScopedName: function (name, filename, css) {
          const file = path.basename(filename, '.module.css');
          const hash = btoa(md5(filename + name + css)).substring(0, 5);

          return `${file}_${name}__${hash}`.replace('global_', '');
        },
        getJSON: (cssFileName, json) => {
          cssModulesJSON = json;
        },
        ...options
      }),
    ]).process(css, { from: filename });

    return {
      css: result.css,
      cssModulesJSON,
    };
  }

  return {
    name: 'css-modules',
    setup(build) {
      const cssContents = new Map();

      build.onResolve({ filter: /\.module\.css$/ }, args => {
        return {
          path: path.resolve(args.resolveDir, args.path),
          namespace: 'css-modules',
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'css-modules' }, async args => {
        const css = await fs.readFile(args.path, 'utf8');
        const { css: processedCSS, cssModulesJSON } = await processCSSModules(css, args.path);
        const key = `css:${md5(args.path)}`;

        // Store the processed CSS in memory
        cssContents.set(key, processedCSS);

        // Create a virtual module that exports the class names
        const virtualModule = `
        import "${key}";
        export default ${JSON.stringify(cssModulesJSON)};
      `;

        return {
          contents: virtualModule,
          loader: 'js',
          watchFiles: [args.path],
        };
      });

      // Handle the virtual CSS files
      build.onResolve({ filter: /^css:/ }, args => {
        return { path: args.path, namespace: 'virtual-css' };
      });

      build.onLoad({ filter: /.*/, namespace: 'virtual-css' }, args => {
        const css = cssContents.get(args.path);
        return {
          contents: css || '',
          loader: 'css',
        };
      });
    },
  };
}
