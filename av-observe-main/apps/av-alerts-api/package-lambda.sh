#!/bin/bash
rm -rf code.zip temp-package
mkdir temp-package
cp index.mjs package.json temp-package/
cp -r ../../shared temp-package/
cd temp-package
npm install --production
zip -r ../code.zip .
cd ..
rm -rf temp-package
