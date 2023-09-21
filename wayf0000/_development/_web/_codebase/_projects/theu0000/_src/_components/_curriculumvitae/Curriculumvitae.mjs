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
import sHTML from "./Curriculumvitae.html";
import sCSS from "./Curriculumvitae.css";

///// CSS ASSETS
import imgClientNike from "./_assets/_images/client_nike_500x250_q80.webp";
import imgClientGoogle from "./_assets/_images/client_google_500x250_q80.webp";
import imgClientGorillaz from "./_assets/_images/client_gorillaz_500x250_q80.webp";
import imgClientXbox from "./_assets/_images/client_xbox_500x250_q80.webp";
import imgClientSpotify from "./_assets/_images/client_spotify_500x250_q80.webp";
import imgClientHM from "./_assets/_images/client_h&m_500x250_q80.webp";
import imgClientBOplay from "./_assets/_images/client_b&oplay_500x250_q80.webp";
import imgClientNickelodeon from "./_assets/_images/client_nickelodeon_500x250_q80.webp";

/////////////////
///// CLASS /////
/////////////////

class Curriculumvitae extends HTMLElement
{
  bIntroAlreadyCalled = false;
  bIntroFinished = false;

  domReferences = Object.create(null);

  constructor(fOptionalCB)
  {
    super();
    console.log("_curriculumvitae: constructor()");

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
        console.log("_curriculumvitae: __init: done");

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
      const domClientNike = domTemplateHTML.content.querySelectorAll("section .clients .client.nike")[0];
      domClientNike.style.backgroundImage = "url(" + imgClientNike + ")";
      const domClientGoogle = domTemplateHTML.content.querySelectorAll("section .clients .client.google")[0];
      domClientGoogle.style.backgroundImage = "url(" + imgClientGoogle + ")";
      const domClientGorillaz = domTemplateHTML.content.querySelectorAll("section .clients .client.gorillaz")[0];
      domClientGorillaz.style.backgroundImage = "url(" + imgClientGorillaz + ")";
      const domClientXbox = domTemplateHTML.content.querySelectorAll("section .clients .client.xbox")[0];
      domClientXbox.style.backgroundImage = "url(" + imgClientXbox + ")";
      const domClientSpotify = domTemplateHTML.content.querySelectorAll("section .clients .client.spotify")[0];
      domClientSpotify.style.backgroundImage = "url(" + imgClientSpotify + ")";
      const domClientHM = domTemplateHTML.content.querySelectorAll("section .clients .client.hm")[0];
      domClientHM.style.backgroundImage = "url(" + imgClientHM + ")";
      const domClientBOplay = domTemplateHTML.content.querySelectorAll("section .clients .client.boplay")[0];
      domClientBOplay.style.backgroundImage = "url(" + imgClientBOplay + ")";
      const domClientNickelodeon = domTemplateHTML.content.querySelectorAll("section .clients .client.nickelodeon")[0];
      domClientNickelodeon.style.backgroundImage = "url(" + imgClientNickelodeon + ")";

      this.domShadowRoot.appendChild
      (
        domTemplateHTML.content.cloneNode(true)
      );
    }

    fCB();
  };

  createDOMReferences(fCB)
  {
    this.domReferences.domParagraphDescription = this.domShadowRoot.querySelectorAll("section p.description")[0];
    this.domReferences.domADownloadCV = this.domShadowRoot.querySelectorAll("section a.download")[0];
    this.domReferences.domClients = this.domShadowRoot.querySelectorAll("section .clients")[0];
    this.domReferences.domRights = this.domShadowRoot.querySelectorAll("section .rights")[0];

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
        console.log("_curriculumvitae: setEventHandlers: done");

        fCB();
      }.bind(this)
    );
  };

  //////////////////////////
  ///// PUBLIC METHODS /////
  //////////////////////////

  intro(nDelay = 0)
  {
    if (this.bIntroAlreadyCalled) { return; } else { this.bIntroAlreadyCalled = true; };

    const aParagraphDescriptionSentences = this.domReferences.domParagraphDescription.innerHTML.split("<br>");
    this.domReferences.domParagraphDescription.replaceChildren();
    for (const i in aParagraphDescriptionSentences)
    {
      const domElem = document.createElement("div");
      domElem.innerHTML = aParagraphDescriptionSentences[i];

      this.domReferences.domParagraphDescription.appendChild(domElem);
    };

    // We also need to unhide its container.
    this.domReferences.domParagraphDescription.style.opacity = 1.0;

    // Animate Description.
    gsap.fromTo
    (
      this.domReferences.domParagraphDescription.children,
      { x: -25, }, { x: 0, stagger: { each: .200 }, duration: .900, delay: .300 + nDelay, ease: "sine.out" },
    );
    gsap.fromTo
    (
      this.domReferences.domParagraphDescription.children,
      { opacity: .0 }, { opacity: 1, stagger: { each: .200 }, duration: .900, delay: .300 + nDelay, ease: "none" },
    );

    // Animate CV Download.
    gsap.fromTo
    (
      this.domReferences.domADownloadCV,
      { opacity: .0 }, { opacity: 1, duration: .900, delay: .600 + nDelay, ease: "none" },
    );

    // Animate clients container.
    gsap.fromTo
    (
      this.domReferences.domClients,
      { y: 25, }, { y: 0, duration: .900, delay: .900 + nDelay, ease: "sine.out" },
    );
    gsap.fromTo
    (
      this.domReferences.domClients,
      { opacity: .0 }, { opacity: 1, duration: .900, delay: .900 + nDelay, ease: "none" },
    );

    // Animate indiv. clients.
    gsap.fromTo
    (
      this.domReferences.domClients.children,
      { y: 25, }, { y: 0, stagger: { each: .100 }, duration: .900, delay: .900 + nDelay, ease: "sine.out" },
    );
    gsap.fromTo
    (
      this.domReferences.domClients.children,
      { opacity: .0 }, { opacity: 1, stagger: { each: .100 }, duration: .900, delay: .900 + nDelay, ease: "none" },
    );

    // TODO?: Bind this to the lengthiest animation method.
    setTimeout(function() {
      console.log("_curriculumvitae: intro(): done");
      this.bIntroFinished = true;

    }.bind(this), 900 + 900 + nDelay);
  };
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define
(
  'theu0000-components-curriculumvitae',
  Curriculumvitae,
);

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export default Curriculumvitae;

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