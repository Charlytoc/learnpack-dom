const { plugin } = require("learnpack/plugin")

module.exports = plugin({
    language: "vanillajs",
    compile: require('./compile'),
    test: require('./test'),
}) 