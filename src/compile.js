const fs = require('fs')
const path = require('path');s
const webpack = require('webpack');
const { Utils, CompilationError } = require('learnpack/plugin')

module.exports = {
  validate: () => {

    // return true or false if the compilation should take place
    // you can leave this empty if you don't know what to validate.

    return true
  },

  /**
  The run function receives one object with the following properties: exercise, socket and configuration.
  exercise: contains all the data about the exercise being compiled right now
    - entry: (string) Path to the file that should be considered as entry
    - files: (array) List of files inside the exercise
  
  socket: Represents a bidirectional connection with learnpack and the user, you can use the socket to ask questions, ask for confirmation, open windows, etc.
    - openWindow: (function) A function that receives a URL to open
  
  configuration: The configuration object contains all information you need to know about all the exercies
    - outputPath: (string) 
    - publicUrl: (string) 
 */
  run: async function ({ exercise, socket, configuration }) {

    let entryPath = exercise.entry || exercise.files.map(f => './'+f.path).find(f => f.indexOf('index.html') > -1);
    if(!entryPath) throw new Error("No entry file, maybe you need to create an app.js file on the exercise folder?");

    // here you should include your compulation code, the files to compile will be inside exercise.files

    /**
     * LOAD WEBPACK
     */
    const webpackConfigPath = path.resolve(__dirname,`./webpack.config.js`);
    if (!fs.existsSync(webpackConfigPath)) throw CompilationError(`Uknown react.js config for webpack`)

    /**
    * COMPILATION WITH WEBPACK
    */
    let webpackConfig = require(webpackConfigPath)(exercise.files);
    webpackConfig.stats = {
      cached: false,
      cachedAssets: false,
      chunks: false,
      modules: false
    };
    // the url were webpack will publish the preview
    webpackConfig.output.path = process.cwd() + '/' + configuration.outputPath;
    //the base directory for the preview, the bundle will be dropped here
    webpackConfig.output.publicPath = configuration.publicPath;

    // webpackConfig.entry = entryPath
    webpackConfig.entry = [
      clean(entryPath)
    ];

    const compiler = webpack(webpackConfig);
    const { err, stats } = await run(compiler);

    if (err) throw CompilationError(err);

    const output = stats.toString({
        chunks: false,  // Makes the build much quieter
        colors: true    // Shows colors in the console
    });
    if(stats.hasErrors()) throw CompilationError(output);

    const errors = []
    if(foundErrors.length > 0) throw CompilationError(foundErrors.map(e => e.message).join(""))
    
    // if you need to open the compiler website on a new window
    socket.openWindow(`${configuration.publicUrl}/preview`)

    // return string with the console output (stdout)
    return Utils.cleanStdout("Successfully built your HTML")
  },
}