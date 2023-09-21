console.log("_main: build id: " + sBuildUUID);

///////////////////
///// IMPORTS /////
///////////////////

/// NPM
import { parallel, series } from "async";

/// LOCAL
import { ENV } from "./_utils/ENV.mjs";
import { DOM } from "./_utils/DOM.mjs";

/// ASSETS
import sHTML from "./Main.html";
import sCSS from "./Main.css";
// TODO: refactor
// import font0 from "./_assets/_fonts/0000.woff2";
// import font1 from "./_assets/_fonts/0001.woff2";
// import font2 from "./_assets/_fonts/0002.woff2";

// TODO: refactor
// import Header from "./_components/_header/Header.mjs";
// import Acknowledgement from "./_components/_acknowledgement/Acknowledgement.mjs";

// import WebGL from "./_components/_webgl/WebGL.mjs";
// const _webGL = new WebGL();

/////////////////
///// CLASS /////
/////////////////

class Main extends HTMLElement
{

  components = Object.create(null);

  constructor()
  {
    super();
    console.log("_main: constructor()");

    this.__init();
  };

  ///////////////////////////
  ///// CLASS LIFECYCLE /////
  ///////////////////////////

  __init()
  {
    parallel(
      [
        function(fCB) { ENV.detectGPU(fCB); }.bind(this),
        // function(fCB) { this.loadFonts(fCB); }.bind(this),
        function(fCB) { this.createComponentInstances(fCB); }.bind(this),
        function(fCB) { this.createShadowDOM(fCB); }.bind(this),
        function(fCB) { this.populateShadowDOM(fCB); }.bind(this),
      ],
      function (err, results)
      {
        console.log("_main: __init: done");

        // console.log(ENV.getGPU());

        // TODO?: bind in scroll event handlers
        // this.components._header.intro();
        // this.components._acknowledgement.intro();
      }.bind(this)
    );
  };

  ///////////////////////////////
  ///// __INIT CONTROL FLOW /////
  ///////////////////////////////

  createShadowDOM(fCB)
  {
    this.domShadowRoot = this.attachShadow
    (
      {
        mode: "open"
      }
    );

    if (sCSS !== "")
    {
      const domTemplateCSS = document.createElement("template");
      domTemplateCSS.innerHTML = "<style>" + sCSS + "</style>";

      this.domShadowRoot.appendChild
      (
        domTemplateCSS.content.cloneNode(true)
      );
    };

    if (sHTML !== "")
    {
      const domTemplateHTML = document.createElement("template");
      domTemplateHTML.innerHTML = sHTML;

      this.domShadowRoot.appendChild
      (
        domTemplateHTML.content.cloneNode(true)
      );
    }

    DOM.append(this, document.body);

    // TODO: refactor this
    // DOM.append(_header, this.domShadowRoot);
    // DOM.append(_webGL, this.domShadowRoot);

    fCB();
  };

  loadFonts(fCB)
  {
    const load = function(sFontFace, sFontFacePath, fCB2) {
      const fontFace = new FontFace(sFontFace, "url(" + sFontFacePath + ")");
      fontFace.load()
      .then
      (function(loadedFont)
        {
        document.fonts.add(loadedFont);

        fCB2()
        }
      );
    };

    parallel(
      [
        function(fCB2) { load("0000", font0, fCB2); }.bind(this),
        function(fCB2) { load("0001", font1, fCB2); }.bind(this),
        function(fCB2) { load("0002", font2, fCB2); }.bind(this),
      ],
      function (err, results)
      {
        console.log("_main: loadFonts: done");
        fCB();
      }.bind(this)
    );

  };

  createComponentInstances(fCB)
  {
    // this.components._header = new Header();
    // this.components._acknowledgement = new Acknowledgement();

    fCB();
  };

  populateShadowDOM(fCB)
  {
    // DOM.append(this.components._header, this.domShadowRoot);
    // DOM.append(this.components._acknowledgement, this.domShadowRoot);

    fCB();
  };


  // setEventHandlers(fCB)
  // {
  //   console.log("EHRHERHEHEHR")
  //   let onDomLoaded = function(fCB2) {
  //     window.addEventListener("DOMContentLoaded", function(e) { fCB2(); }.bind(this));
  //   };

  //   series(
  //     [
  //       function (fCB2) { onDomLoaded(fCB2) }.bind(this),
  //     ],
  //     function (err, results)
  //     {
  //       console.log("_main: setEventHandlers: done");

  //       fCB();
  //     }.bind(this)
  //   );
  // };
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define
(
  'wayf0000-main',
  Main,
);

/////////////////////////
///// INSTANTIATION /////
/////////////////////////

const _main = new Main();

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