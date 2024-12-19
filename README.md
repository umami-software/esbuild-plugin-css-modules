## @umami/esbuild-plugin-css-modules

## Imstall

```shell
npm install @umami/esbuild-plugin-css-modules
```

## Usage

```javascript
import esbuild from 'esbuild';
import cssModules from '@umami/esbuild-plugin-css-modules';

esbuild
  .build({
    entryPoints: ['src/index.js'],
    outfile: 'dist/index.js',
    plugins: [cssModules()],
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
```
