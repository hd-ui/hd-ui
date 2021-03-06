const fs = require('fs')
const path = require('path')
// eslint-disable-next-line import/no-extraneous-dependencies
const packageInfo = require('./package.json')
const darkVars = require('./scripts/dark-vars')

// We need compile additional content for hd-ui-react user
function finalizeCompile() {
  if (fs.existsSync(path.join(__dirname, './lib'))) {
    // Build package.json version to lib/version/index.js
    // prevent json-loader needing in user-side
    const versionFilePath = path.join(process.cwd(), 'lib', 'version', 'index.js')
    const versionFileContent = fs.readFileSync(versionFilePath).toString()
    fs.writeFileSync(
      versionFilePath,
      versionFileContent.replace(
        /require\(('|")\.\.\/\.\.\/package\.json('|")\)/,
        `{ version: '${packageInfo.version}' }`,
      ),
    )
    // eslint-disable-next-line
    console.log('Wrote version into lib/version/index.js')

    // Build package.json version to lib/version/index.d.ts
    // prevent https://github.com/ant-design/ant-design/issues/4935
    const versionDefPath = path.join(process.cwd(), 'lib', 'version', 'index.d.ts')
    fs.writeFileSync(
      versionDefPath,
      `declare var _default: "${packageInfo.version}";\nexport default _default;\n`,
    )
    // eslint-disable-next-line
    console.log('Wrote version into lib/version/index.d.ts')

    // Build a entry less file to dist/hd-ui-react.less
    const componentsPath = path.join(process.cwd(), 'components')
    let componentsLessContent = ''
    // Build components in one file: lib/style/components.less
    fs.readdir(componentsPath, (err, files) => {
      files.forEach(file => {
        if (fs.existsSync(path.join(componentsPath, file, 'style', 'index.less'))) {
          componentsLessContent += `@import "../${path.join(file, 'style', 'index.less')}";\n`
        }
      })
      fs.writeFileSync(
        path.join(process.cwd(), 'lib', 'style', 'components.less'),
        componentsLessContent,
      )
    })
  }
}

function finalizeDist() {
  if (fs.existsSync(path.join(__dirname, './dist'))) {
    // Build less entry file: dist/hd-ui-react.less
    fs.writeFileSync(
      path.join(process.cwd(), 'dist', 'hd-ui-react.less'),
      '@import "../lib/style/index.less";\n@import "../lib/style/components.less";',
    )

    // eslint-disable-next-line
    console.log('Built a entry less file to dist/hd-ui-react.less')

    // Build less entry file: dist/hd-ui-react.dark.less
    fs.writeFileSync(
      path.join(process.cwd(), 'dist', 'hd-ui-react.dark.less'),
      '@import "../lib/style/dark.less";\n@import "../lib/style/components.less";',
    )

    // eslint-disable-next-line
    console.log('Built a entry less file to dist/hd-ui-react.dark.less')

    // Build dark.js: dist/dark-theme.js, for less-loader

    fs.writeFileSync(
      path.join(process.cwd(), 'dist', 'dark-theme.js'),
      `module.exports = ${JSON.stringify(darkVars, null, 2)};`,
    )

    // eslint-disable-next-line
    console.log('Built a dark theme js file to dist/dark-theme.js')
  }
}

module.exports = {
  compile: {
    finalize: finalizeCompile,
  },
  dist: {
    finalize: finalizeDist,
  },
}
