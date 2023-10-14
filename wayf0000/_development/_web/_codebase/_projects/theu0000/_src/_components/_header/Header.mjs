///////////////////
///// IMPORTS /////
///////////////////

///// NPM
import { log, parallel, series } from "async";
import { gsap } from "gsap";

gsap.ticker.fps(120);
gsap.ticker.lagSmoothing(0);

///// LOCAL
import { ENV } from "../../_utils/ENV.mjs";
import { DOM } from "../../_utils/DOM.mjs";

///// JS ASSETS
import sHTML from "./Header.html";
import sCSS from "./Header.css";

///// CSS ASSETS
import imgHeaderImage from "./_assets/_images/header_background_3840x1491_q80.webp";

/////////////////
///// CLASS /////
/////////////////

class Header extends HTMLElement
{
  bIntroAlreadyCalled = false;
  bIntroFinished = false;

  domReferences = Object.create(null);

  constructor(fOptionalCB)
  {
    super();
    console.log("_header: constructor()");

    this.__init(fOptionalCB);
  };

  ///////////////////////////
  ///// CLASS LIFECYCLE /////
  ///////////////////////////

  __init(fOptionalCB)
  {
    series
    (
      [
        function(fCB) { this.createShadowDOM(fCB); }.bind(this),
        function(fCB) { this.createDOMReferences(fCB); }.bind(this),
        function(fCB) { this.setEventHandlers(fCB); }.bind(this),
      ],
      function (err, results)
      {
        console.log("_header: __init: done");

        // const domEl = this.domShadowRoot.querySelectorAll("header .blend")[0];
        // console.log(domEl);

        // let xTo = gsap.quickTo(domEl, "x", { duration: 1.2, ease: "none" });
        // let yTo = gsap.quickTo(domEl, "y", { duration: 1.2, ease: "none" });

        // const onMouseMove = function(e)
        // {
        //   xTo(e.clientX);
        //   yTo(e.clientY);
        //   ;

        // };
        // //this.domShadowRoot.addEventListener("mousemove", onMouseMove);
        // // we grab the window to not have events stop when leaving the dom elem
        // window.addEventListener("mousemove", onMouseMove);

        fOptionalCB();

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

      // TODO: do this by overwriting the CSS instead? hmm
      // this does give us some control over asset loading
      // const domHeaderImage = domTemplateHTML.content.querySelectorAll("header .image")[0];
      // domHeaderImage.style.backgroundImage = "url(" + imgHeaderImage + ")";

      this.domShadowRoot.appendChild
      (
        domTemplateHTML.content.cloneNode(true)
      );
    }

    fCB();
  };

  createDOMReferences(fCB)
  {
    this.domReferences.domHeaderH1 = this.domShadowRoot.querySelectorAll("header h1")[0];
    this.domReferences.domHeaderLocation = this.domShadowRoot.querySelectorAll("header .location")[0];
    this.domReferences.domHeaderYear = this.domShadowRoot.querySelectorAll("header .year")[0];
    // this.domReferences.domHeaderImage = this.domShadowRoot.querySelectorAll("header .image")[0];

    fCB();
  };

  setEventHandlers(fCB)
  {
    // const onDomLoaded = function(fCB2)
    // {
    //   window.addEventListener("DOMContentLoaded", function(e) { fCB2(); }.bind(this));
    // };

    // parallel(
    //   [
    //     function (fCB2) { onDomLoaded(fCB2) }.bind(this),
    //   ],
    //   function (err, results)
    //   {
    //     console.log("_header: setEventHandlers: done");

        fCB();
    //   }.bind(this)
    // );
  };

  //////////////////////////
  ///// HELPER METHODS /////
  //////////////////////////

  testIfWeCanRender(e)
  {
    console.log(this.domShadowRoot)
  };

  //////////////////////////
  ///// PUBLIC METHODS /////
  //////////////////////////

  intro(nDelay = 0)
  {
    if (this.bIntroAlreadyCalled) { return; } else { this.bIntroAlreadyCalled = true; };

    // Animate header image.
    // gsap.fromTo
    // (
    //   this.domReferences.domHeaderImage,
    //   { y: -25 }, { y: 0, duration: 1.200, delay: 0 + nDelay, ease: "sine.out" }
    // );
    // gsap.fromTo
    // (
    //   this.domReferences.domHeaderImage,
    //   { opacity: .0 }, { opacity: 1, duration: 1.200, delay: 0 + nDelay, ease: "none" }
    // );

    // Animate H1
    const aHeaderH1Words = this.domReferences.domHeaderH1.textContent.split(" ");
    this.domReferences.domHeaderH1.replaceChildren();
    for (const i in aHeaderH1Words)
    {
      const domElem = document.createElement("div");
      domElem.textContent = aHeaderH1Words[i];

      this.domReferences.domHeaderH1.appendChild(domElem);
    };

    // We also need to unhide its container.
    this.domReferences.domHeaderH1.style.opacity = 1.0;

    gsap.fromTo
    (
      this.domReferences.domHeaderH1.children,
      { y: 25 }, { y: 0, stagger: { each: .200 }, duration: .900, delay: .300 + nDelay, ease: "sine.out" },
    );
    gsap.fromTo
    (
      this.domReferences.domHeaderH1.children,
      { opacity: .0 }, { opacity: 1, stagger: { each: .200 }, duration: .900, delay: .300 + nDelay, ease: "none" },
    );

    gsap.fromTo
    (
      this.domReferences.domHeaderLocation,
      { y: 25 }, { y: 0, duration: .900, delay: .900 + nDelay, ease: "sine.out" },
    );
    gsap.fromTo
    (
      this.domReferences.domHeaderLocation,
      { opacity: .0 }, { opacity: 1, duration: .900, delay: .900 + nDelay, ease: "none" },
    );

    gsap.fromTo
    (
      this.domReferences.domHeaderYear,
      { y: 25 }, { y: 0, duration: .900, delay: 1.100 + nDelay, ease: "sine.out" },
    );
    gsap.fromTo
    (
      this.domReferences.domHeaderYear,
      { opacity: .0 }, { opacity: 1, duration: .900, delay: 1.100 + nDelay, ease: "none" },
    );

    // TODO?: Bind this to the lengthiest animation method.
    setTimeout(function() {
      console.log("_header: intro(): done");
      this.bIntroFinished = true;

    }.bind(this), 900 + 1100 + nDelay);
  };
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define
(
  'theu0000-components-header',
  Header,
);

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export default Header;

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