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
import font_0001_m from "./_assets/_fonts/Pitch-Medium.woff2";
import font_0001_mi from "./_assets/_fonts/Pitch-Medium.woff2";
// import font_0002_l from "./_assets/_fonts/font_0002_l.woff2";
// import font_0003_li from "./_assets/_fonts/font_0003_li.woff2";
// import font_0003_m from "./_assets/_fonts/font_0003_m.woff2";
// import font_0003_i from "./_assets/_fonts/font_0003_i.woff2";
// import font_0003_el from "./_assets/_fonts/font_0003_el.woff2";
// import font_0003_eli from "./_assets/_fonts/font_0003_eli.woff2";

///// COMPONENTS
import WebGL from "./_components/_webgl/WebGL.mjs";
import Introduction from "./_components/_introduction/Introduction.mjs";

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
    parallel
    (
      [
        function(fCB) { ENV.detectGPU(fCB); }.bind(this),
        function(fCB) { this.loadFonts(fCB); }.bind(this),
        function(fCB) { this.createComponentInstances(fCB); }.bind(this),
        function(fCB) { this.createShadowDOM(fCB); }.bind(this),
        function(fCB) { this.populateShadowDOM(fCB); }.bind(this),
        function(fCB) { this.setEventHandlers(fCB); }.bind(this),
      ],
      function (err, results)
      {
        console.log("_main: __init: done");

        console.log("donezo's. all components initialized.")

        // TODO?: refac this?
        // Handle the color of the body here instead of CSS, so we don't get a flash on first paint.
        // The delay prevents an ugly blend with the component .intro() animations.
        gsap.fromTo
        (
          document.body,
          { backgroundColor: "rgb(255, 255, 255)"},
          { backgroundColor: "rgb(241, 240, 224)", duration: .900, delay: 1.0, ease: "none" },
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

    parallel
    (
      [
        // TODO: check if we use all these
        function(fCB2) { load("font_0001_m", font_0001_m, fCB2); }.bind(this),
        function(fCB2) { load("font_0001_mi", font_0001_mi, fCB2); }.bind(this),
        // function(fCB2) { load("font_0002_l", font_0002_l, fCB2); }.bind(this),
        // function(fCB2) { load("font_0003_li", font_0003_li, fCB2); }.bind(this),
        // function(fCB2) { load("font_0003_m", font_0003_m, fCB2); }.bind(this),
        // function(fCB2) { load("font_0003_i", font_0003_i, fCB2); }.bind(this),
        // function(fCB2) { load("font_0003_el", font_0003_el, fCB2); }.bind(this),
        // function(fCB2) { load("font_0003_eli", font_0003_eli, fCB2); }.bind(this),
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
    parallel
    (
      [
        // function(fCB) { this.components._header = new Header(fCB); }.bind(this),
        // function(fCB) { this.components._acknowledgement = new Acknowledgement(fCB); }.bind(this),
        // function(fCB) { this.components._curriculumvitae = new Curriculumvitae(fCB); }.bind(this),
        // function(fCB) { this.components._casestudyGorillaz = new Casestudy(fCB, "Gorillaz"); }.bind(this),
        // function(fCB) { this.components._casestudyGoogleEarthStudio = new Casestudy(fCB, "GoogleEarthStudio"); }.bind(this),
        // function(fCB) { this.components._footer = new Footer(fCB); }.bind(this),
        function(fCB) { this.components._webGL = new WebGL(fCB); }.bind(this),
        function(fCB) { this.components._introduction = new Introduction(fCB); }.bind(this),

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
    // DOM.append(this.components._header, this.domShadowRoot);
    // DOM.append(this.components._acknowledgement, this.domShadowRoot);
    // DOM.append(this.components._curriculumvitae, this.domShadowRoot);
    // DOM.append(this.components._casestudyGorillaz, this.domShadowRoot);
    // DOM.append(this.components._casestudyGoogleEarthStudio, this.domShadowRoot);
    // DOM.append(this.components._footer, this.domShadowRoot);

    DOM.append(this.components._webGL, this.domShadowRoot);
    DOM.append(this.components._introduction, this.domShadowRoot);

    fCB();
  };

  setEventHandlers(fCB)
  {
    const onDomScrollListener = window.addEventListener
    (
      "scroll", this.onDomScrollCallback.bind(this)
    );

    // We call it once, as the browser initially doesn't fire this event
    this.onDomScrollCallback()

    const onDomLoaded = function(fCB)
    {
      window.addEventListener("DOMContentLoaded", function(e) { fCB(); }.bind(this));
    };

    onDomLoaded(fCB);
  };

  onDomScrollCallback = function(e)
  {
    this.onScrollCallComponentIntro();
  };

  onScrollCallComponentIntro()
  {
    // NOTE: Components are responsible for checking if their intro has already been called.
    // if (this.testComponentInView("_header")) this.components._header.intro();
    // if (this.testComponentInView("_acknowledgement")) this.components._acknowledgement.intro();
    // if (this.testComponentInView("_curriculumvitae")) this.components._curriculumvitae.intro();
    // if (this.testComponentInView("_casestudyGoogleEarthStudio")) this.components._curriculumvitae.intro();
    // if (this.testComponentInView("_footer")) this.components._footer.intro();
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