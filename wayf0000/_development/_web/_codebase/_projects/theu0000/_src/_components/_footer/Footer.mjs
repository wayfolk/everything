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
import sHTML from "./Footer.html";
import sCSS from "./Footer.css";

/////////////////
///// CLASS /////
/////////////////

class Footer extends HTMLElement
{
  bIntroAlreadyCalled = false;
  bIntroFinished = false;

  domReferences = Object.create(null);

  constructor(fOptionalCB)
  {
    super();
    console.log("_footer: constructor()");

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
        console.log("_footer: __init(): done");

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
    this.domReferences.domFooter = this.domShadowRoot.querySelectorAll("footer")[0];
    this.domReferences.domParagraphSupported = this.domShadowRoot.querySelectorAll(".supported")[0];
    this.domReferences.domParagraphButton = this.domShadowRoot.querySelectorAll("a.button")[0];
    this.domReferences.domParagraphCopyright = this.domShadowRoot.querySelectorAll(".copyright")[0];

    fCB();
  };

  setEventHandlers(fCB)
  {
    const onDomLoaded = function(fCB2)
    {
      window.addEventListener("DOMContentLoaded", function(e) { fCB2(); }.bind(this));
    };

    parallel(
      [
        function (fCB2) { onDomLoaded(fCB2) }.bind(this),
      ],
      function (err, results)
      {
        console.log("_footer: setEventHandlers(): done");

        fCB();
      }.bind(this)
    );

    ///// BUTTON
    const domParagraphButton_onMouseEnterHandler = function(e)
    {
      if (!this.bIntroFinished) return;

      gsap.killTweensOf(this.domReferences.domParagraphButton);

      gsap.to
      (
        this.domReferences.domParagraphButton,
        { y: -5, color: "rgb(255, 255, 255)", backgroundColor: "rgb(0, 0, 0)", boxShadow: "0 0 60px 30px rgba(228, 254, 207, 1.0), 0 0 140px 80px rgba(135, 135, 135, 1.0)", duration: 0.300, delay: .0, ease: "sine.In" },
      );
    };

    const domParagraphButton_onMouseLeaveHandler = function(e)
    {
      if (!this.bIntroFinished) return;

      gsap.killTweensOf(this.domReferences.domParagraphButton);

      gsap.to
      (
        this.domReferences.domParagraphButton,
        {  y: 0, color: "rgb(0, 0, 0)", backgroundColor: "rgb(228, 254, 207)", boxShadow: "0 0 60px 30px rgba(228, 254, 207, 0.0), 0 0 140px 80px rgba(135, 135, 135, 0.0)", duration: 0.600, delay: .0, ease: "sine.Out" },
      );
    };

    // Store references so we can remove them later if needed.
    const domParagraphButton_onMouseEnterListener = this.domReferences.domParagraphButton.addEventListener("mouseenter", domParagraphButton_onMouseEnterHandler.bind(this));
    const domParagraphButton_onMouseLeaveListener = this.domReferences.domParagraphButton.addEventListener("mouseleave", domParagraphButton_onMouseLeaveHandler.bind(this));
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

    gsap.fromTo
    (
      this.domReferences.domFooter,
      { y: -25 }, { y: 0, duration: 1.200, delay: 0 + nDelay, ease: "sine.out" },
    );
    gsap.fromTo
    (
      this.domReferences.domFooter,
      { opacity: .0 }, { opacity: 1, duration: 1.200, delay: 0 + nDelay, ease: "none" },
    );

    const aParagraphSupportedSentences = this.domReferences.domParagraphSupported.innerHTML.split("<br>");
    this.domReferences.domParagraphSupported.replaceChildren();
    for (const i in aParagraphSupportedSentences)
    {
      const domElem = document.createElement("div");
      domElem.innerHTML = aParagraphSupportedSentences[i];

      this.domReferences.domParagraphSupported.appendChild(domElem);
    };

    // We also need to unhide its container.
    this.domReferences.domParagraphSupported.style.opacity = 1.0;

    gsap.fromTo
    (
      this.domReferences.domParagraphSupported.children,
      { x: -25, }, { x: 0, stagger: { each: .200 }, duration: .900, delay: .300 + nDelay, ease: "sine.out" },
    );
    gsap.fromTo
    (
      this.domReferences.domParagraphSupported.children,
      { opacity: .0 }, { opacity: 1, stagger: { each: .200 }, duration: .900, delay: .300 + nDelay, ease: "none" },
    );

    // gsap.fromTo
    // (
    //   this.domReferences.domParagraphButton,
    //   { y: 25 }, { y: 0, duration: 0.300, delay: .6 + nDelay, ease: "sine.out" },
    // );
    gsap.fromTo
    (
      this.domReferences.domParagraphButton,
      { opacity: .0 }, { opacity: 1, duration: 0.300, delay: 0.0 + nDelay, ease: "none" },
    );

    gsap.fromTo
    (
      this.domReferences.domParagraphCopyright,
      { y: 25 }, { y: 0, duration: 1.200, delay: .9 + nDelay, ease: "sine.out" },
    );
    gsap.fromTo
    (
      this.domReferences.domParagraphCopyright,
      { opacity: .0 }, { opacity: 1, duration: 1.200, delay: .9 + nDelay, ease: "none" },
    );

    // TODO?: Bind this to the lengthiest animation method.
    setTimeout(function() {
      console.log("_footer: intro(): done");
      this.bIntroFinished = true;

    }.bind(this), 300 + nDelay); // HACK: In this case its based on the domParagraphButton.
  };
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define
(
  'theu0000-components-footer',
  Footer,
);

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export default Footer;

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