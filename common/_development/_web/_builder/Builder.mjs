///////////////////
///// IMPORTS /////
///////////////////

///// NODE
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as zlib from "zlib";

///// NPM
import { series } from "async";
import * as chokidar from "chokidar";
import * as esbuild from "esbuild";
import * as htmlminifier from "html-minifier";
import { throws } from "assert";

class Builder
{
  // generate a pseudorandom v4 UUID
  // we use this to rename assets to prevent browser cache issues
  // NOTE: the index.html needs to be served with headers to not cache itself
  sUniqueBuildUUID = crypto.randomUUID();

  bEnableWatchMode = false;
  bIsWatching = false;

  sProjectPath = Object.create(null);
  sProjectSrcPath = Object.create(null);
  sProjectBuildPath = Object.create(null);

  constructor()
  {
    this.__init();
  };

  ///////////////////////////
  ///// CLASS LIFECYCLE /////
  ///////////////////////////

  __init()
  {
    // Rather than setting up the control flow here,
    // we split it off so we can easily recall it in watch mode.
    this.build();
  };

  build()
  {
    series
    (
      [
        function(fCB) { this.parseCLIArgs(fCB); }.bind(this),
        function(fCB) { this.determineProjectPaths(fCB); }.bind(this),
        function(fCB) { this.cleanup(fCB); }.bind(this),
        function(fCB) { this.copyAssets(fCB); }.bind(this),
        function(fCB) { this.buildTemplates(fCB); }.bind(this),
        function(fCB) { this.esbuildProject(fCB); }.bind(this),
        function(fCB) { this.postBuild(fCB); }.bind(this),
      ],
      function (err, results)
      {
        console.log("_builder: build: done");

        if (this.bEnableWatchMode) this.watch();
      }.bind(this)
    );
  };

  /**
   * Parses the passed in CLI arguments
   * @param {function} fCB control flow callback.
   *
   * @todo Implement error handling
   */
  parseCLIArgs(fCB)
  {
    {
      this.sProjectPath = process.argv[3];

      if (process.argv[4] === "--watch")
      {
        this.bEnableWatchMode = true;
      };
    };

    fCB();
  };

  determineProjectPaths = function(fCB)
  {
    this.sProjectSrcPath = path.join(this.sProjectPath, "/_src/");
    this.sProjectBuildPath = path.join(this.sProjectPath, "/_build/");

    fCB();
  };

  cleanup(fCB)
  {
    fs.rmSync
    (
      this.sProjectBuildPath,
      {
        recursive: true,
        force: true,
      }
    );

    fs.mkdirSync
    (
      this.sProjectBuildPath,
    );

    fCB();
  };

  copyAssets(fCB)
  {
    fs.cpSync
    (
      path.join(this.sProjectSrcPath, "/_assets/_benchmarks/"),
      path.join(this.sProjectBuildPath, "/_assets/_benchmarks/"),
      {
        recursive: true
      }
    );
    this.applyBuildUUIDtoFilesInFolder(path.join(this.sProjectBuildPath, "/_assets/_benchmarks/"));

    fs.cpSync
    (
      path.join(this.sProjectSrcPath, "/_assets/_draco/"),
      path.join(this.sProjectBuildPath, "/_assets/_draco/"),
      {
        recursive: true
      }
    );
    this.applyBuildUUIDtoFilesInFolder(path.join(this.sProjectBuildPath, "/_assets/_draco/"));

    fs.cpSync
    (
      path.join(this.sProjectSrcPath, "/_assets/_images/"),
      path.join(this.sProjectBuildPath, "/_assets/_images/"),
      {
        recursive: true
      }
    );
    this.applyBuildUUIDtoFilesInFolder(path.join(this.sProjectBuildPath, "/_assets/_images/"));

    fCB();
  };

  buildTemplates(fCB)
  {
    const sIndexTemplate = fs.readFileSync
    (
      path.join(this.sProjectSrcPath, "/_assets/_templates/index.html"),
      {
        encoding: "utf8",
        flag: "r",
      }
    );

    const sMinifiedIndexTemplate = htmlminifier.minify
    (
      sIndexTemplate,
      {
        removeComments: true,
        collapseWhitespace: true,
        useShortDoctype: false,
        minifyCSS: true,
      }
    );

    fs.writeFileSync
    (
      path.join(this.sProjectBuildPath, "/index.html"),
      sMinifiedIndexTemplate,
      {
        encoding: "utf8",
        flag: "w"
      }
    );

    fCB();
  };

  esbuildProject(fCB)
  {
    esbuild.buildSync
    (
      {
        entryPoints: [ path.join(this.sProjectSrcPath, "/Main.mjs") ],
        bundle: true,
        treeShaking: true,
        splitting: false,
        minify: true,
        // drop: [ "console", "debugger" ],
        outdir: this.sProjectBuildPath,
        outExtension: { ".js": ".mjs" },
        loader: { ".html" : "text", ".css": "text", ".glb": "file", ".webp": "file", ".png": "file", ".woff2": "file", ".mp4": "file" },
        assetNames: "[dir]/[name]_" + this.sUniqueBuildUUID,
        platform: "browser",
        // https://esbuild.github.io/api/#target
        // https://esbuild.github.io/content-types/
        target: [ "es2020", "safari16" ],
        // https://esbuild.github.io/api/#format
        format: "esm",
        charset: "utf8",
        sourcemap: "linked",
        sourcesContent: true,
        // https://esbuild.github.io/api/#define
        define: { sBuildUUID: "\"" + this.sUniqueBuildUUID + "\"" }
      }
    );

    fCB();
  };

  postBuild(fCB)
  {
    this.overrideBuildOutput
    (
      path.join(this.sProjectBuildPath, "/Main.mjs"),
      [
        // TODO: write some code to parse the relevant folders and build this array

        // https://github.com/mrdoob/three.js/blob/eeeffc87b472e43e99a95d5f7a5afec60803518c/examples/jsm/loaders/DRACOLoader.js#L267
        { "draco_decoder.js": "draco_decoder_" + this.sUniqueBuildUUID + ".js" },
        { "draco_decoder.wasm": "draco_decoder_" + this.sUniqueBuildUUID + ".wasm" },
        { "draco_encoder.js": "draco_encoder_" + this.sUniqueBuildUUID + ".js" },
        { "draco_wasm_wrapper.js": "draco_wasm_wrapper_" + this.sUniqueBuildUUID + ".js" },

        // https://github.com/pmndrs/detect-gpu/blob/fc3dd67e84e5a8b2d6442983d97a929189069b4b/src/index.ts#L163C18-L163C18
        { "-ipad\":\"\"}.json": "-ipad\":\"\"}_" + this.sUniqueBuildUUID + ".json" }, // nasty match because of the esbuild minification

        { "sourceMappingURL=Main.mjs.map": "sourceMappingURL=Main_" + this.sUniqueBuildUUID + ".mjs.map" },
      ]
    );

    this.overrideBuildOutput
    (
      path.join(this.sProjectBuildPath, "./index.html"),
      [
        { "Main.mjs": "Main_" + this.sUniqueBuildUUID +".mjs" },
        { "theundebruijn_icon_192x192.png": "theundebruijn_icon_192x192_" + this.sUniqueBuildUUID +".png" },
        { "wayfolk_icon_192x192_16bit_sRGB.png": "wayfolk_icon_192x192_16bit_sRGB_" + this.sUniqueBuildUUID +".png" },
        { "theundebruijn_shareimage_3840x1700.png": "theundebruijn_shareimage_3840x1700_" + this.sUniqueBuildUUID +".png" },
        { "theundebruijn_shareimage_3840x1700.png": "theundebruijn_shareimage_3840x1700_" + this.sUniqueBuildUUID +".png" },
      ]
    );

    fs.renameSync(path.join(this.sProjectBuildPath, "/Main.mjs"), path.join(this.sProjectBuildPath,"/Main_" + this.sUniqueBuildUUID + ".mjs"));
    fs.renameSync(path.join(this.sProjectBuildPath, "./Main.mjs.map"), path.join(this.sProjectBuildPath, "/Main_" + this.sUniqueBuildUUID + ".mjs.map"));

    function fRecursive_GetMatchingFilesFromDir(sBasePath, aFileExtensions)
    {
      var files = fs.readdirSync(sBasePath);

      for (var i = 0; i < files.length; i++)
      {
        var filename = path.join(sBasePath, files[i]);
        var stat = fs.lstatSync(filename);

        if (stat.isDirectory())
        {
          fRecursive_GetMatchingFilesFromDir(filename, aFileExtensions); //recurse
        }
        else
        {
          const sFileExt = path.extname(filename);
          if (aFileExtensions.includes(sFileExt))
          {
            aMatchingFiles.push(filename);
          }
        };
      };
    };

    const aMatchingFileTypes =
    [
      // skipping binary image formats (png, webp for now), also woff2 seems to not be improved
      ".html", ".mjs", ".map", ".js", ".json", ".glb", ".wasm"
    ];
    let aMatchingFiles = [];

    fRecursive_GetMatchingFilesFromDir(this.sProjectBuildPath, aMatchingFileTypes);

    aMatchingFiles.forEach
    (function(sFilePath)
      {
        this.brotliEncodeFile(sFilePath);
      }.bind(this)
    );

   fCB();
  };

  /////////////////////////
  ///// CLASS METHODS /////
  /////////////////////////

  watch()
  {
    // Make sure we do not start multiple watchers.
    if (this.bIsWatching) return;
    this.bIsWatching = true;

    const watcher = chokidar.watch
    (
      this.sProjectSrcPath,
      {
        ignoreInitial: true,
        usePolling: false,
      }
    );

    console.log("_builder: watcher: watching");

    watcher.on
    (
      'all',
      function(sEvent, sPath)
      {
        console.log("_builder: watcher: detected: " + sEvent + ": " + sPath);
        this.build();

      }.bind(this)
    );
  };

  //////////////////////////
  ///// HELPER METHODS /////
  //////////////////////////

  // TODO?: make recursive
  applyBuildUUIDtoFilesInFolder = function(sFolderPath)
  {
    const aFiles = fs.readdirSync(sFolderPath);
    aFiles.forEach(
      function(sItem)
      {
        const sFileExt = path.extname(sItem);

        const sFileNameWithoutExt = path.basename(sItem, sFileExt);
        const sNewFileNameWithExt = sFileNameWithoutExt + "_" + this.sUniqueBuildUUID + sFileExt;

        const sFullPathCurr = path.join(sFolderPath, sItem);
        const sFullPathNew = path.join(sFolderPath, sNewFileNameWithExt);

        fs.renameSync(sFullPathCurr, sFullPathNew);
      }.bind(this)
    );
  };

  brotliEncodeFile(sFilePath)
  {
    var buffUncompressedfile = fs.readFileSync(sFilePath);
    var buffCompressedfile = zlib.brotliCompressSync(buffUncompressedfile, {
      chunkSize: 32 * 1024,
      params: {
        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: fs.statSync(sFilePath).size,
      }
    });

    fs.writeFileSync
    (
      sFilePath,
      buffCompressedfile,
      {
        encoding: null,
        flag: "w"
      }
    );
  };

  overrideBuildOutput(sPathToBuildOutputFile, aOverrides)
  {
    const sFileContents = fs.readFileSync(sPathToBuildOutputFile, "utf8");
    let sOverridenFileContents = sFileContents;

    for (let i = 0; i < aOverrides.length; i++)
    {
      for (let prop in aOverrides[i])
      {
        const oRegExp = new RegExp(prop, "g");
        sOverridenFileContents = sOverridenFileContents.replace(oRegExp, aOverrides[i][prop]);
      };
    };

    fs.writeFileSync(sPathToBuildOutputFile, sOverridenFileContents, 'utf8');
  };
};

/////////////////////////
///// INSTANTIATION /////
/////////////////////////

const _builder = new Builder();

////////////////////////////////////////////////////////////
//////////////////////////.        /////////////////////////
/////////////////////     .      ..  ...////////////////////
///////////////////    ..  .   ....    .  ./////////////////
//////////////////        . .  . ...  . ... ////////////////
/////////////////     ...................   ////////////////
/////////////////  .(,(/.%,.*%#&&&.//....   ////////////////
/////////////////  .***/..*,*/%,%%#%*/(/(. ,* //////////////
////////////////( ******  #%#((&%%*&///%%*..(.//////////////
/////////////////(/,((//**&.*,%%(*//.**##, .#(//////////////
///////////////( .(,**....* ...,*,,,%&,((*.* .//////////////
///////////////( . **..(*#/ %%%%#,*##,..*%,,.///////////////
////////////////(.,#/%#%%,#(%#(/&&(%,(.//#,..///////////////
//////////////////(,,/*#(.#/ /(&..%/&/(*(.//////////////////
///////////////////( ***#     .,.,/&%%%*.///////////////////
////////////////////(./,/*,,.,&*(((%%(/ ////////////////////
///////////////////////**.*.*//##.*,,,//////////////////////
///////////////////////  ,*%%/@//(*   ./////////////////////
//////////////////////                 /////////////////////
////////////////////                     ///////////////////