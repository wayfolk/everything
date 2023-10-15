///////////////////
///// IMPORTS /////
///////////////////

///// NPM
import { log, parallel, series } from "async";
import { gsap } from "gsap";

///// LOCAL
import { ENV } from "./_utils/ENV.mjs";
import { DOM } from "./_utils/DOM.mjs";

///// JS ASSETS
import sHTML from "./Main.html";
import sCSS from "./Main.css";

///// CSS ASSETS
import font_0001_300 from "./_assets/_fonts/font_0001_300.woff2";
import font_0001_300i from "./_assets/_fonts/font_0001_300i.woff2";
import font_0001_500 from "./_assets/_fonts/font_0001_500.woff2";
import font_0001_500i from "./_assets/_fonts/font_0001_500i.woff2";

///// COMPONENTS
import WebGL from "./_components/_webgl/WebGL.mjs";
import Introduction from "./_components/_introduction/Introduction.mjs";
import Words from "./_components/_words/Words.mjs";
import Footer from "./_components/_footer/Footer.mjs";

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
    series
    (
      [
        function(fCB) { ENV.detectGPU(fCB); }.bind(this),
        function(fCB) { this.loadFonts(fCB); }.bind(this),
        // function(fCB) { this.waitforDomLoaded(fCB); }.bind(this),
        function(fCB) { this.createComponentInstances(fCB); }.bind(this),
        function(fCB) { this.createShadowDOM(fCB); }.bind(this),
        function(fCB) { this.populateShadowDOM(fCB); }.bind(this),
        function(fCB) { this.setEventHandlers(fCB); }.bind(this),
      ],
      function (err, results)
      {
        console.log("_main: __init: done");

        // TODO?: refac this?
        // Handle the color of the body here instead of CSS, so we don't get a flash on first paint.
        // The delay prevents an ugly blend with the component .intro() animations.
        gsap.fromTo
        (
          document.body,
          { backgroundColor: "rgb(255, 255, 255)"}, // start from here to avoid an ungly transition using just gsap.to
          // { backgroundColor: "rgb(53, 99, 124)", duration: .900, delay: 0.0, ease: "none" },
          { backgroundColor: "rgb(252, 255, 236)", duration: .900, delay: 0.0, ease: "none" },
        );
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

    fCB();
  };

  loadFonts(fCB)
  {
    const load = function(sFontFace, sFontFacePath, fCB2)
    {
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

    series
    (
      [
        // TODO: check if we use all these
        function(fCB2) { load("font_0001_300", font_0001_300, fCB2); }.bind(this),
        function(fCB2) { load("font_0001_300i", font_0001_300i, fCB2); }.bind(this),
        function(fCB2) { load("font_0001_500", font_0001_500, fCB2); }.bind(this),
        function(fCB2) { load("font_0001_500i", font_0001_500i, fCB2); }.bind(this),
        // function(fCB2) { load("font_0001_bi", font_0001_bi, fCB2); }.bind(this),
      ],
      function (err, results)
      {
        console.log("_main: loadFonts: done");
        fCB();
      }.bind(this)
    );
  };

  // waitforDomLoaded(fCB) {
  //   if (document.readyState !== 'loading') {
  //     console.log('document is already ready, just execute code here');
  //     // myI?nitCode();
  //     fCB();
  //   } else {
  //     document.addEventListener('DOMContentLoaded', function () {
  //         console.log('document was not ready, place code here');
  //         // myInitCode();
  //     });
  // }
  // };

  createComponentInstances(fCB)
  {
    series
    (
      [
        function(fCB) { this.components._webGL = new WebGL(fCB); }.bind(this),
        function(fCB) { this.components._introduction = new Introduction(fCB); }.bind(this),
        function(fCB) { this.components._words = new Words(fCB); }.bind(this),
        function(fCB) { this.components._footer = new Footer(fCB); }.bind(this),

      ],
      function (err, results)
      {
        fCB();

      }.bind(this)
    );
    // this.components._webGL = new WebGL();
  };

  populateShadowDOM(fCB)
  {
    DOM.append(this.components._webGL, this.domShadowRoot);
    DOM.append(this.components._introduction, this.domShadowRoot);
    DOM.append(this.components._words, this.domShadowRoot);
    DOM.append(this.components._footer, this.domShadowRoot);
    fCB();
  };

  setEventHandlers(fCB)
  {
    // const onDomScrollListener = window.addEventListener
    // (
    //   "scroll", this.onDomScrollCallback.bind(this)
    // );

    // // We call it once, as the browser initially doesn't fire this event
    this.onDomScrollCallback()

    // const onDomLoaded = function(fCB)
    // {
    //   window.addEventListener("DOMContentLoaded", function(e) { fCB(); }.bind(this));
    // };
    fCB();
    // onDomLoaded(fCB);
  };

  onDomScrollCallback = function(e)
  {
    this.onScrollCallComponentIntro();
  };

  onScrollCallComponentIntro()
  {
    // NOTE: Components are responsible for checking if their intro has already been called.
    if (this.testComponentInView("_introduction")) this.components._introduction.intro();
    if (this.testComponentInView("_words")) this.components._words.intro();
    if (this.testComponentInView("_footer")) this.components._footer.intro();
  };

  /////////////////////////
  ///// CLASS METHODS /////
  /////////////////////////

  /**
   * High performance way of determining if a component is in view.
   * By that we mean enough of it is visible to treat is as being active.
   * There's an optional arg for how much of the element should be visible before returning true.
   * - we rely on the offsetTop of the component, relative to the position of the Main component.
   * - this way we do not need to request a getBoundingClientRect.
   * - NOTE: this only works when the Main component is the direct parent of the component.
   * @param {object} sComponentInstance String referring to the name of the component instance (eg, "_header");
   */
  testComponentInView(sComponentInstance, nPercentageInView = 100)
  {
    const domComponent = this.components[sComponentInstance];

    let nDomComponentHeight = domComponent.offsetHeight;
    let nDomComponentTopOffsetY = domComponent.offsetTop;
    let nDomComponentBottomOffsetY = domComponent.offsetTop + nDomComponentHeight;

    let nViewportHeight = window.innerHeight;
    let nViewportTopOffsetY = window.scrollY;
    let nViewportBottomOffsetY = window.scrollY + nViewportHeight;

    // Ok. some part of our component is visible.
    if (nDomComponentTopOffsetY <= nViewportBottomOffsetY && nDomComponentBottomOffsetY >= nViewportTopOffsetY)
    {
      // TODO calc percentage of component visible

      return true;
    }
    else
    {
      return false;
    }
  }
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

// Log out just for Main.mjs
console.log
(
`
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

_main: build id: ` + sBuildUUID + `\n\n`
);


const _main = new Main();