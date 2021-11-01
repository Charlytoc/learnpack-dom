'use strict';

const babelJest = require('babel-jest').default
const path = require('path')

let nodeModulesPath = path.dirname(require.resolve('jest'))
nodeModulesPath = nodeModulesPath.substr(0,nodeModulesPath.indexOf("node_modules")) + "node_modules/"

module.exports = babelJest.createTransformer({
    presets: [ 
        nodeModulesPath+'/@babel/preset-env'
    ],
    plugins: [
        [
            nodeModulesPath+'/@babel/plugin-transform-runtime', {
            "regenerator": true
            } 
        ]
    ],
    babelrc: false,
    configFile: false,
})