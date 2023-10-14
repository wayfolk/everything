///////////////////
///// IMPORTS /////
///////////////////

///// NODE
import * as fs from "fs";
import * as path from "path";

///// NPM
import { series } from "async";
import * as uWS from "uWebSockets.js";

//////////////////////
///// BASE CLASS /////
//////////////////////

/**
 * Base class for the HttpsServer and HttpServer subclasses.
 * It _is_ to be used as store for shared class properties.
 * It _is not_ a functional server by itself.
 */
class Server
{
  _args = Object.create(null);

  /**
   * Determines constructor args. Subclasses are required to pass these on.
   * If using an override they can do so by calling super() from inside the constructor.
   * @param {number} nPort
   */
  constructor(nPort)
  {
    this._args.nPort = nPort;
  };

  /////////////////////////
  ///// CLASS METHODS /////
  /////////////////////////

  /**
   * Parse the host header for known hosts.
   * Makes it easier to handle multi-entrypoint logic.
   * @param {string} sRequestHost
   * @returns {string | null}
   */
  parseRequestHost = function(sRequestHost)
  {
    if(sRequestHost === "_local.wayfolk.com" || sRequestHost === "www.wayfolk.com" || sRequestHost === "wayfolk.com")
    {
      return "www.wayfolk.com";
    }
    else if (sRequestHost === "_local.theundebruijn.com" || sRequestHost === "www.theundebruijn.com" || sRequestHost === "theundebruijn.com")
    {
      return "www.theundebruijn.com";
    }
    else if (sRequestHost === "_local_engine.wayfolk.com")
    {
      return "_local_engine.wayfolk.com"
    }
    else
    {
      return null;
    };
  };

  ///////////////////////////////
  ///// __INIT CONTROL FLOW /////
  ///////////////////////////////

  /**
   * Start listening on the stored port.
   * This functionally starts the server.
   * @param {function} fCB control flow callback.
   */
  startServer(fCB)
  {
    this._uWSServer.listen
    (
      this._args.nPort,
      function(listenSocket) {
        if (listenSocket) {}
      },
    );

    fCB();
  };
};

/////////////////
///// CLASS /////
/////////////////

/**
 * Our main Server. It's based on uWebSockets.js.
 * - handles both HTTPS and WSS traffic.
 * - utilizes SNI for multi-domain SSL support.
 * - utilizes file streaming for memory preservation and performance.
 *
 * @todo Implement WSS handling.
 */
class HttpsServer extends Server
{
  /**
   * Passes on constructor args to the base class constructor.
   * Then calls __init to start our control flow.
   * @param {...any} args
   */
  constructor(...args)
  {
    super(...args);

    console.log("_httpsServer: constructor()");

    this.__init();
  };

  ///////////////////////////
  ///// CLASS LIFECYCLE /////
  ///////////////////////////

  /**
   * Handles control flow for the class.
   * - uses the async library that relies on callbacks.
   *   we still prefer these for performance reasons.
   */
  __init()
  {
    series
    (
      [
        function(fCB) { this.createUWSServer(fCB); }.bind(this),
        function(fCB) { this.createSNIHandlers(fCB); }.bind(this),
        function(fCB) { this.createRequestHandlers(fCB); }.bind(this),
        function(fCB) { this.startServer(fCB); }.bind(this),
      ],
      function (err, results)
      {
        console.log("_httpsServer: __init: done");
      }.bind(this)
    );
  };

  ///////////////////////////////
  ///// __INIT CONTROL FLOW /////
  ///////////////////////////////

  /**
   * Creates HTTPS server based on uWebSockets.js.
   * We use *.wayfolk.com as our 'base' domain. Any other domains will be handled using SNI.
   * See {@link createUWSServer} for that logic.
   * @param {function} fCB control flow callback.
   */
  createUWSServer(fCB)
  {
    this._uWSServer = uWS.SSLApp
    (
      {
        key_file_name: "./_certs/wildcard_wayfolk_com.key",
        cert_file_name: "./_certs/wildcard_wayfolk_com_certificate_chain.crt",
      },
    );

    fCB();
  };

  /**
   * Handler to add SNI support for additional domains.
   * See {@link createUWSServer} for the 'base' domain we use.
   * @param {function} fCB control flow callback.
   */
  createSNIHandlers(fCB)
  {
    this._uWSServer.addServerName
    (
      "www.theundebruijn.com",
      {
        key_file_name: "./_certs/wildcard_theundebruijn_com.key",
        cert_file_name: "./_certs/wildcard_theundebruijn_com_certificate_chain.crt",
      },
    );

    this._uWSServer.addServerName
    (
      "theundebruijn.com",
      {
        key_file_name: "./_certs/wildcard_theundebruijn_com.key",
        cert_file_name: "./_certs/wildcard_theundebruijn_com_certificate_chain.crt",
      },
    );

    this._uWSServer.addServerName
    (
      "_local.theundebruijn.com",
      {
        key_file_name: "./_certs/wildcard_theundebruijn_com.key",
        cert_file_name: "./_certs/wildcard_theundebruijn_com_certificate_chain.crt",
      },
    );

    fCB();
  };

  /**
   * Creates handlers for incoming requests.
   * - support GET only for now.
   * - supports both the 'base' and SNI domains.
   * @param {function} fCB control flow callback.
   */
  createRequestHandlers(fCB)
  {
    this._uWSServer.get("/*", function(res, req)
      {
        // redirect non-www.
        if (req.getHeader("host") === "wayfolk.com")
        {
          const sRedirectURL = "https://www.wayfolk.com" + path.normalize(req.getUrl());

          res.writeStatus("301 Moved Permanently");
          res.writeHeader("Location", sRedirectURL);
          res.end();

          return;
        };
        
        this.requestHandlerGET(req, res);
      }.bind(this)
    );

    this._uWSServer.domain("www.theundebruijn.com").get("/*", function(res, req)
      {
        this.requestHandlerGET(req, res);
      }.bind(this)
    );

    this._uWSServer.domain("_local.theundebruijn.com").get("/*", function(res, req)
      {
        this.requestHandlerGET(req, res);
      }.bind(this)
    );

    this._uWSServer.domain("theundebruijn.com").get("/*", function(res, req)
      {
        const sRedirectURL = "https://www.theundebruijn.com" + path.normalize(req.getUrl());

        res.writeStatus("301 Moved Permanently");
        res.writeHeader("Location", sRedirectURL);
        res.end();

      }.bind(this)
    );

    fCB();
  };

  /////////////////////////
  ///// CLASS METHODS /////
  /////////////////////////

  /**
   * GET request handler. Responsible for parsing and responsing.
   * - performs path lookups based on HttpRequest properties.
   * - sets response headers (incl. those based on project build compression).
   * - utilizes file streaming for memory preservation and performance.
   * @param {object} req uWebSockets.js HttpRequest
   * @param {object} res uWebSockets.js HttpResponse
   */
  requestHandlerGET = function(req, res)
  {    
    /**
     * We need to cork for efficiency.
     * See {@link https://github.com/uNetworking/uWebSockets/blob/master/misc/READMORE.md#corking}
     */
    res.cork(function()
    {
      const sParsedRequestHost = this.parseRequestHost(req.getHeader("host"));
      if(sParsedRequestHost === null)
      {
        res.writeStatus("400 Bad Request");
        res.end();
        return;
      };

      const sProjectBuildPath = this.determineProjectBuildPath(sParsedRequestHost);
      if (sProjectBuildPath === null)
      {
        res.writeStatus("400 Bad Request");
        res.end(); 
        return;
      }

      const sNormalizedRequestURL = path.normalize(req.getUrl());

      let sFileExt = Object.create(null);
      let sConstructedFilePath = Object.create(null);
      let nTotalSize = Object.create(null);

      // handle root path exception
      if (sNormalizedRequestURL === "/")
      {
        sConstructedFilePath = path.join(sProjectBuildPath, "index.html");
        sFileExt = ".html";
      }
      else
      {
        sConstructedFilePath = path.join(sProjectBuildPath, sNormalizedRequestURL);
        sFileExt = path.extname(sNormalizedRequestURL);
      };

      if (fs.existsSync(sConstructedFilePath))
      {
        nTotalSize = fs.statSync(sConstructedFilePath).size;
        res.writeStatus("200 OK");

        if (sFileExt === ".html")
        {
           res.writeHeader("Cache-Control", "no-store, must-revalidate");
           res.writeHeader("Content-Encoding", "br");
           res.writeHeader("Content-Type", "text/html; charset=utf-8");
        }
        else if (sFileExt === ".mjs" || sFileExt === ".js" || sFileExt === ".map")
        {
          res.writeHeader("Content-Encoding", "br");
          res.writeHeader("Content-Type", "application/javascript; charset=utf-8");
        }
        else if (sFileExt === ".json")
        {
          res.writeHeader("Content-Encoding", "br");
          res.writeHeader("Content-Type", "application/json; charset=utf-8");
        }
        else if (sFileExt === ".wasm")
        {
          res.writeHeader("Content-Encoding", "br");
          res.writeHeader("Content-Type", "application/wasm");
        }
        else if (sFileExt === ".glb")
        {
          res.writeHeader("Content-Encoding", "br");
          res.writeHeader("Content-Type", "model/gltf-binary");
        }
        else if (sFileExt === ".webp")
        {
          res.writeHeader("Content-Type", "image/webp");
        }
        else if (sFileExt === ".png")
        {
          res.writeHeader("Content-Type", "image/png");
        }
        else if (sFileExt === ".woff2")
        {
          res.writeHeader("Content-Type", "font/woff2");
        }
        else if (sFileExt === ".mp4")
        {
          res.writeHeader("Content-Type", "video/mp4");
        };

        // Ask Node to stream the file.
        const readStream = fs.createReadStream(sConstructedFilePath);

        // Ask uWS to pipe this stream out to the response object.
        this.pipeFileStreamAsArrayBufferRes(readStream, nTotalSize, res);
      }
      else
      {
        res.writeStatus("404 Not Found");
        res.end();
      };
    }.bind(this))
  };

  /**
   * Parse the parsed request host and return a matching project path.
   * @param {string} sParsedRequestHost
   * @returns {string | null}
   */
  determineProjectBuildPath = function(sParsedRequestHost)
  {
    if (sParsedRequestHost === "www.wayfolk.com")
    {
      return "../../../../wayf0000/_development/_web/_codebase/_projects/wayf0000/_build";
    }
    else if (sParsedRequestHost === "www.theundebruijn.com")
    {
      return "../../../../wayf0000/_development/_web/_codebase/_projects/theu0000/_build";
    }
    else if (sParsedRequestHost ==="_local_engine.wayfolk.com")
    {
      return "../_engine/_build";
    }
    else
    {
      return null;
    };
  };

  /**
   * _Recursive_ method that takes a Node stream, converts it to an ArrayBuffer
   * and pipes it out over a uWS:HttpResponse.
   * @param { node:stream } readStream
   * @param { number } totalSize
   * @param { uWS:HttpResponse } res
   *
   * @todo Test if we're leaking memory.
   */
  pipeFileStreamAsArrayBufferRes = function(readStream, nTotalSize, res)
  {
    readStream.on("data", function(chunk)
    {
      // Convert to data V8 expects.
      const abChunk = this.convBuffertoArrayBuffer(chunk);

      // Store offset in case we come back here.
      let abPrevioustOffset = res.getWriteOffset();

      /**
       * We need to cork for efficiency.
       * See {@link https://github.com/uNetworking/uWebSockets/blob/master/misc/READMORE.md#corking}
       */
      res.cork(function()
      {
        // Let's try if we can end after this chunk.
        let [bChunkSentSuccessfully, bResCompleted] = res.tryEnd(abChunk, nTotalSize);

        // All done. Let's close the stream.
        if (bResCompleted)
        {
          readStream.destroy();
        }
        else if (!bChunkSentSuccessfully)
        {
          // Pause as we couldn't send this chunk.
          readStream.pause();

          // Store unsent chunk.
          res.abChunk = abChunk;
          res.abCurrOffset = abPrevioustOffset;

          // Register async handlers for drainage.
          res.onWritable(function(offset)
          {
            // Let's try if we can end after this chunk.
            let [bChunkSentSuccessfully, bResCompleted] = res.tryEnd(res.abChunk.slice(offset - res.abCurrOffset), nTotalSize);

            // All done. Let's close the stream.
            if (bResCompleted)
            {
              readStream.destroy();
            }
            else if (bChunkSentSuccessfully)
            {
              readStream.resume();
            };

            // Respond with true or false to recursively try.
            return bChunkSentSuccessfully;
          });
        };
      });
    }.bind(this));

    // Handle errors thrown from the node.js stream.
    readStream.on('error', function() {
      // TODO?: log this.
      res.end();
    }.bind(this));

    // Make sure we catch the response aborting.
    res.onAborted(function() {
      readStream.destroy();
    }.bind(this));
  };

  //////////////////////////
  ///// HELPER METHODS /////
  //////////////////////////

  /**
   *  Converts Buffer (Uint8Arrays) to ArrayBuffer by slicing its region of the underlying ArrayBuffer.
   *  This way seems the most performant. More info at {@link https://stackoverflow.com/a/31394257}.
   * @param {Buffer} buffer
   * @returns {ArrayBuffer}
   */
  convBuffertoArrayBuffer = function(buffer)
  {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  };
};

/////////////////
///// CLASS /////
/////////////////

/**
 * Our secondary Server. It's based on uWebSockets.js.
 * It's purpose is redirect HTTP requests to their HTTPS counterpart.
 * - handles strictly HTTP traffic.
 * - incoming requests are parsed for hostname matching. We're not an open redirect service.
 * - redirect are performed using the 301 Moved Permanently response header.
 */
class HttpServer extends Server
{
  /**
   * Passes on constructor args to the base class constructor.
   * Then calls __init to start our control flow.
   * @param {...any} args
   */
  constructor(...args)
  {
    super(...args);
    console.log("_httpServer: constructor()");

    this.__init();
  };

  /**
   * Handles control flow for the class.
   * - uses the async library that relies on callbacks.
   *   we still prefer these for performance reasons.
   */
  __init()
  {
    series
    (
      [
        function(fCB) { this.createUWSServer(fCB); }.bind(this),
        function(fCB) { this.createSNIHandlers(fCB); }.bind(this),
        function(fCB) { this.createRequestHandlers(fCB); }.bind(this),
        function(fCB) { this.startServer(fCB); }.bind(this),
      ],
      function (err, results)
      {
        console.log("_httpServer: __init: done");
      }.bind(this)
    );
  };

  ///////////////////////////////
  ///// __INIT CONTROL FLOW ////
  ///////////////////////////////

  /**
   * Creates HTTP server based on uWebSockets.js.
   * We use *.wayfolk.com as our 'base' domain. Any other domains will be handled using SNI.
   * See {@link createUWSServer} for that logic.
   * @param {function} fCB control flow callback.
   */
  createUWSServer(fCB)
  {
    this._uWSServer = uWS.App();

    fCB();
  };

  /**
   * Handler to add SNI support for additional domains.
   * See {@link createUWSServer} for the 'base' domain we use.
   * @param {function} fCB control flow callback.
   */
  createSNIHandlers(fCB)
  {
    this._uWSServer.addServerName("*.theundebruijn.com");

    fCB();
  };

  /**
   * Creates handlers for incoming requests.
   * - support GET only for now.
   * - supports both the 'base' and SNI domains.
   * @param {function} fCB control flow callback.
   */
  createRequestHandlers(fCB)
  {
    this._uWSServer.get("/*", function(res, req)
      {
        // Test for domains we support. We're not an open redirect service.
        const sParsedRequestHost = this.parseRequestHost(req.getHeader("host"));
        if(sParsedRequestHost === null)
        {
          res.writeStatus("400 Bad Request");
          res.end();
        }
        else
        {
          // Construct an https url and send onwards.
          const sRedirectURL = "https://" + req.getHeader("host") + path.normalize(req.getUrl());

          res.writeStatus("301 Moved Permanently");
          res.writeHeader("Location", sRedirectURL);
          res.end();
        };
      }.bind(this)
    );

    fCB();
  };
};

/////////////////////////
///// INSTANTIATION /////
/////////////////////////

const _httpsServer = new HttpsServer(443);
const _httpServer = new HttpServer(80);

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