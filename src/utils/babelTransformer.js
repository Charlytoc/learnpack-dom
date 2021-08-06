'use strict';

const babelJest = require('babel-jest').default
const path = require('path')

let nodeModulesPath = path.dirname(require.resolve('jest'))
nodeModulesPath = nodeModulesPath.substr(0,nodeModulesPath.indexOf("node_modules")) + "node_modules/"

const presetEnv = nodeModulesPath+'/@babel/preset-env'



module.exports = babelJest.createTransformer({
    presets: [ presetEnv ],
    babelrc: false,
    configFile: false,
})