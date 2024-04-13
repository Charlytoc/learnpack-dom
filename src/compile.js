const fs = require('fs')
const path = require('path');
const webpack = require('webpack');
const prettier = require("prettier");
const { Utils, CompilationError } = require('learnpack/plugin')

const run = (compiler) => new Promise((res, rej) => compiler.run((err, stats) => {
  res({ err, stats });
}));

const clean = (_path) => _path.indexOf("./") === 0 ? _path : "./" + _path;

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

    let entryPaths = exercise.files.map(f => './' + f.path).filter(f => f.includes(exercise.entry) || f.includes('styles.css'));
    if (entryPaths.length === 0) throw new Error("No entry files, maybe you need to create an index.js file on the exercise folder?");

    /**
     * LOAD WEBPACK
     */
    const webpackConfigPath = path.resolve(__dirname, `./webpack.config.js`);
    if (!fs.existsSync(webpackConfigPath)) throw CompilationError(`Uknown config for webpack`)

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
      ...entryPaths
    ];

    const compiler = webpack(webpackConfig);

    const result = {
      starting_at: Date.now(),
      source_code: "",
      exitCode: 0
    }

    const { err, stats } = await run(compiler);

    result.ended_at = Date.now()
    if (err) {
      result.stderr = err
      result.exitCode = 1
    }

    const output = stats.toString({
      chunks: false,  // Makes the build much quieter
      colors: true    // Shows colors in the console
    });
    result.stdout = Utils.cleanStdout(output)
    if (stats.hasErrors()) {
      result.stderr = output
      result.exitCode = 1
    }


    const errors = exercise.files.filter(f => !f.hidden && f.name.includes(".html"))
      .map(file => {
        try {
          if (file.name.includes(".html")) prettify(file)
        }
        catch (error) {
          return error
        }

        const _path = webpackConfig.output.path + "/" + file.name;


        fs.copyFileSync(file.path, _path);

        return null
      });

    if (errors.filter(e => e != null).length > 0) throw CompilationError([].concat(errors.filter(e => e !== null)).map(e => e.message).join("\n"));

    // if you need to open the compiler website on a new window
    socket.openWindow(`${configuration.publicUrl}/preview`)

    // return string with the console output (stdout)
    return result
  },
}


const prettify = (file) => {
  const prettyConfig = {
    printWidth: 150,             // Specify the length of line that the printer will wrap on.
    tabWidth: 4,                // Specify the number of spaces per indentation-level.
    useTabs: true,              // Indent lines with tabs instead of spaces.
    bracketSpacing: true,
    semi: true,                 // Print semicolons at the ends of statements.
    encoding: 'utf-8'           // Which encoding scheme to use on files
  };

  const content = fs.readFileSync(file.path, "utf8");

  const formatted = prettier.format(content, { parser: "html", ...prettyConfig });
  fs.writeFileSync(file.path, formatted);

  return null;
}