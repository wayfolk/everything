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
import sHTML from "./Acknowledgement.html";
import sCSS from "./Acknowledgement.css";

/////////////////
///// CLASS /////
/////////////////

class Acknowledgement extends HTMLElement
{
  bIntroAlreadyCalled = false;
  bIntroFinished = false;

  domReferences = Object.create(null);

  constructor(fOptionalCB)
  {
    super();
    console.log("_acknowledgement: constructor()");

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
        console.log("_acknowledgement: __init: done");

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
      // domHeaderImage.style.backgroundImage = "url("+binHeaderImage+")";

      this.domShadowRoot.appendChild
      (
        domTemplateHTML.content.cloneNode(true)
      );
    }

    fCB();
  };

  createDOMReferences(fCB)
  {
    this.domReferences.domSection = this.domShadowRoot.querySelectorAll("section")[0];
    this.domReferences.domParagraphAcknowledgement = this.domShadowRoot.querySelectorAll(".acknowledgement")[0];

    fCB();
  };

  setEventHandlers(fCB)
  {
    let onDomLoaded = function(fCB2) {
      window.addEventListener("DOMContentLoaded", function(e) { fCB2(); }.bind(this));
    };

    parallel(
      [
        function (fCB2) { onDomLoaded(fCB2) }.bind(this),
      ],
      function (err, results)
      {
        console.log("_acknowledgement: setEventHandlers: done");

        fCB();
      }.bind(this)
    );
  };

  //////////////////////////
  ///// PUBLIC METHODS /////
  //////////////////////////

  intro(nDelay = .9)
  {
    if (this.bIntroAlreadyCalled) { return; } else { this.bIntroAlreadyCalled = true; };

    gsap.fromTo
    (
      this.domReferences.domSection,
      { y: -25 }, { y: 0, duration: 1.200, delay: 0 + nDelay, ease: "sine.out" },
    );
    gsap.fromTo
    (
      this.domReferences.domSection,
      { opacity: .0 }, { opacity: 1, duration: 1.200, delay: 0 + nDelay, ease: "none" },
    );

    const aParagraphAcknowledgementSentences = this.domReferences.domParagraphAcknowledgement.innerHTML.split("<br>");
    this.domReferences.domParagraphAcknowledgement.replaceChildren();
    for (const i in aParagraphAcknowledgementSentences)
    {
      const domElem = document.createElement("div");
      domElem.textContent = aParagraphAcknowledgementSentences[i];

      this.domReferences.domParagraphAcknowledgement.appendChild(domElem);
    };

    // We also need to unhide its container.
    this.domReferences.domParagraphAcknowledgement.style.opacity = 1.0;

    gsap.fromTo
    (
      this.domReferences.domParagraphAcknowledgement.children,
      { x: -25, }, { x: 0, stagger: { each: .200 }, duration: .900, delay: .300 + nDelay, ease: "sine.out" },
    );
    gsap.fromTo
    (
      this.domReferences.domParagraphAcknowledgement.children,
      { opacity: .0 }, { opacity: 1, stagger: { each: .200 }, duration: .900, delay: .300 + nDelay, ease: "none" },
    );

    // TODO?: Bind this to the lengthiest animation method.
    setTimeout(function() {
      console.log("_acknowledgement: intro(): done");
      this.bIntroFinished = true;

    }.bind(this), 900 + 300 + nDelay);
  };
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define
(
  'theu0000-components-acknowledgement',
  Acknowledgement,
);

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export default Acknowledgement;

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