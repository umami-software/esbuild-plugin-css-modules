# @umami/esbuild-plugin-css-modules

A esbuild plugin for bundling CSS modules using [PostCSS](https://postcss.org/).

## Install

```shell
npm install @umami/esbuild-plugin-css-modules
```

## Usage

The plugin accepts the available options from [postcss-modules](https://github.com/madyankin/postcss-modules).

```javascript
import esbuild from 'esbuild';
import cssModules from '@umami/esbuild-plugin-css-modules';

// postcss-modules plugin options
const options = {};

esbuild
  .build({
    entryPoints: ['src/index.js'],
    outfile: 'dist/index.js',
    plugins: [cssModules(options)],
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
```

After the build process, you will have a CSS file `dist/index.css` with class names in the format
of `[name]_[local]__[hash]`. You can pass in your own `generateScopedName` function to modify the
default behavior.

## License

MIT
