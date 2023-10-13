///////////////////
///// IMPORTS /////
///////////////////

///// NPM
import { parallel, series } from "async";
import { gsap } from "gsap";

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
        console.log("_footer: __init: done");

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
    this.domReferences.domMap = this.domShadowRoot.querySelectorAll("#map")[0];

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
    //     console.log("_footer: setEventHandlers: done");

        fCB();
      // }.bind(this)
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

  
    gsap.fromTo
    (
      this.domReferences.domMap,
      { y: 25 }, { y: 0, duration: 1.200, delay: 0 + nDelay, ease: "sine.out" }
    );
    gsap.fromTo
    (
      this.domReferences.domMap,
      { opacity: .0 }, { opacity: 1, duration: 1.200, delay: 0 + nDelay, ease: "none" }
    );
  };
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define
(
  'wayf0000-components-footer',
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