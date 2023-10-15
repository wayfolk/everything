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
import sHTML_Gorillaz from "./Casestudy_Gorillaz.html";
import sHTML_GoogleEarthStudio from "./Casestudy_GoogleEarthStudio.html";
import sCSS from "./Casestudy.css";

///// CSS ASSETS
import imgClientGoogle from "./_assets/_images/client_google_500x250_q80.webp";
import imgClientGorillaz from "./_assets/_images/client_gorillaz_500x250_q80.webp";
import imgGorillaz0001 from "./_assets/_images/gorillaz0001_2949x2540_q80.webp";
import imgGorillaz0002 from "./_assets/_images/gorillaz0002_1426x3002_q80.webp";
// import imgGorillazAwards0001 from "./_assets/_images/awards_clio_500x500_q80.webp";
// import imgGorillazAwards0002 from "./_assets/_images/awards_cannes_500x500_q80.webp";
// import videoGES0001 from "./_assets/_videos/ges0001_1920x1080p-60hz-rec709-h264-main42-vbr2pass-12to15mbit-sw_noauditotrack.mp4";
// import videoGES0002 from "./_assets/_videos/ges0002_1280x720p-60hz-rec709-h264-main41-vbr2pass-8to12mbit-sw_noauditotrack.mp4";

/////////////////
///// CLASS /////
/////////////////

class Casestudy extends HTMLElement
{
  sCasestudy = Object.create(null);

  bIntroAlreadyCalled = false;
  bIntroFinished = false;

  domReferences = Object.create(null);

  constructor(fOptionalCB, sCasestudy)
  {
    super();
    console.log("_casestudy: constructor()");

    this.sCasestudy = sCasestudy;

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
        console.log("_casestudy: __init: done");

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

    if (this.sCasestudy === "Gorillaz")
    {
      if (sHTML_Gorillaz !== "")
      {
        const domTemplateHTML = document.createElement("template");
        domTemplateHTML.innerHTML = sHTML_Gorillaz;

        const domClient = domTemplateHTML.content.querySelectorAll("section .container .client")[0];
        domClient.style.backgroundImage = "url(" + imgClientGorillaz + ")";

        // const domGorillazAwardsImage0001 = domTemplateHTML.content.querySelectorAll("section .container .awards .image.Clio")[0];
        // domGorillazAwardsImage0001.style.backgroundImage = "url(" + imgGorillazAwards0001 + ")";

        // const domGorillazAwardsImage0002 = domTemplateHTML.content.querySelectorAll("section .container .awards .image.Cannes")[0];
        // domGorillazAwardsImage0002.style.backgroundImage = "url(" + imgGorillazAwards0002 + ")";

        const domGorillazImage0001 = domTemplateHTML.content.querySelectorAll("section .image.Murdoc")[0];
        domGorillazImage0001.style.backgroundImage = "url(" + imgGorillaz0001 + ")";

        const domGorillazImage0002 = domTemplateHTML.content.querySelectorAll("section .container .image.Russel")[0];
        domGorillazImage0002.style.backgroundImage = "url(" + imgGorillaz0002 + ")";

        this.domShadowRoot.appendChild
        (
          domTemplateHTML.content.cloneNode(true)
        );
      }
    }
    else if (this.sCasestudy === "GoogleEarthStudio")
    {
      if (sHTML_GoogleEarthStudio !== "")
      {
        const domTemplateHTML = document.createElement("template");
        domTemplateHTML.innerHTML = sHTML_GoogleEarthStudio;

        const domClient = domTemplateHTML.content.querySelectorAll("section .container .client")[0];
        domClient.style.backgroundImage = "url(" + imgClientGoogle + ")";

        // const domVideoGES0001Src = domTemplateHTML.content.querySelectorAll("section video.ges0001")[0];
        // const videoSource = '<source src="'+ videoGES0001 + '" type="video/mp4">';
        // domVideoGES0001Src.innerHTML = videoSource;

        // const domVideoGES0002Src= domTemplateHTML.content.querySelectorAll("section video.ges0002")[0];
        // const videoSource2 = '<source src="'+ videoGES0002 + '" type="video/mp4" >';
        // domVideoGES0002Src.innerHTML = videoSource2;

        this.domShadowRoot.appendChild
        (
          domTemplateHTML.content.cloneNode(true)
        );
      }
    }


    fCB();
  };

  createDOMReferences(fCB)
  {
    // this.domReferences.domParagraphDescription = this.domShadowRoot.querySelectorAll("section p.description")[0];
    // this.domReferences.domADownloadCV = this.domShadowRoot.querySelectorAll("section a.download")[0];
    // this.domReferences.domClients = this.domShadowRoot.querySelectorAll("section .clients")[0];
    // this.domReferences.domRights = this.domShadowRoot.querySelectorAll("section .rights")[0];

    fCB();
  };

  setEventHandlers(fCB)
  {
    // let onDomLoaded = function(fCB2) {
    //   window.addEventListener("DOMContentLoaded", function(e) { fCB2(); }.bind(this));
    // };

    // parallel(
    //   [
    //     function (fCB2) { onDomLoaded(fCB2) }.bind(this),
    //   ],
    //   function (err, results)
    //   {
    //     console.log("_casestudy: setEventHandlers: done");

        fCB();
      // }.bind(this)
    // );
  };

  //////////////////////////
  ///// PUBLIC METHODS /////
  //////////////////////////

  intro(nDelay = 0)
  {
    if (this.bIntroAlreadyCalled) { return; } else { this.bIntroAlreadyCalled = true; };

    // const aParagraphDescriptionSentences = this.domReferences.domParagraphDescription.innerHTML.split("<br>");
    // this.domReferences.domParagraphDescription.replaceChildren();
    // for (const i in aParagraphDescriptionSentences)
    // {
    //   const domElem = document.createElement("div");
    //   domElem.innerHTML = aParagraphDescriptionSentences[i];

    //   this.domReferences.domParagraphDescription.appendChild(domElem);
    // };

    // // We also need to unhide its container.
    // this.domReferences.domParagraphDescription.style.opacity = 1.0;

    // // Animate Description.
    // gsap.fromTo
    // (
    //   this.domReferences.domParagraphDescription.children,
    //   { x: -25, }, { x: 0, stagger: { each: .200 }, duration: .900, delay: .300 + nDelay, ease: "sine.out" },
    // );
    // gsap.fromTo
    // (
    //   this.domReferences.domParagraphDescription.children,
    //   { opacity: .0 }, { opacity: 1, stagger: { each: .200 }, duration: .900, delay: .300 + nDelay, ease: "none" },
    // );

    // // Animate CV Download.
    // gsap.fromTo
    // (
    //   this.domReferences.domADownloadCV,
    //   { opacity: .0 }, { opacity: 1, duration: .900, delay: .600 + nDelay, ease: "none" },
    // );

    // // Animate clients container.
    // gsap.fromTo
    // (
    //   this.domReferences.domClients,
    //   { y: 25, }, { y: 0, duration: .900, delay: .900 + nDelay, ease: "sine.out" },
    // );
    // gsap.fromTo
    // (
    //   this.domReferences.domClients,
    //   { opacity: .0 }, { opacity: 1, duration: .900, delay: .900 + nDelay, ease: "none" },
    // );

    // // Animate indiv. clients.
    // gsap.fromTo
    // (
    //   this.domReferences.domClients.children,
    //   { y: 25, }, { y: 0, stagger: { each: .100 }, duration: .900, delay: .900 + nDelay, ease: "sine.out" },
    // );
    // gsap.fromTo
    // (
    //   this.domReferences.domClients.children,
    //   { opacity: .0 }, { opacity: 1, stagger: { each: .100 }, duration: .900, delay: .900 + nDelay, ease: "none" },
    // );

    // TODO?: Bind this to the lengthiest animation method.
    setTimeout(function() {
      console.log("_casestudy: intro(): done");
      this.bIntroFinished = true;

    }.bind(this), 900 + 900 + nDelay);
  };
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define
(
  'theu0000-components-casestudy',
  Casestudy,
);

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export default Casestudy;

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