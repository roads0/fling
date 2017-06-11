#!/bin/bash
cp -rf static chrome-ext
echo "const fs=require('fs'),pug=require('pug');fs.writeFileSync('chrome-ext/index.html', pug.renderFile('views/index.pug'))" > temp-build.js
node temp-build.js
rm temp-build.js
