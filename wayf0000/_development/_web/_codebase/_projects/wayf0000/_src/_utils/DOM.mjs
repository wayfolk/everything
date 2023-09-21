///////////////
///// OBJ /////
///////////////

const DOM = Object.create(null);

///////////////////////
///// OBJ METHODS /////
///////////////////////

DOM.create = function(sTag, oProps, anyContent) {
  const el = document.createElement(sTag);

  for (const i in oProps) {
    el[i] = oProps[i];
  }

  if (anyContent === undefined) { return el; }

  if (typeof anyContent === "string") {
    el.appendChild(document.createTextNode(anyContent));
  } else {
    for (const i of anyContent) {
      el.appendChild(i);
    }
  }
  return el;
};

DOM.append = function(domEl, domParent) {
  domParent.appendChild(domEl);
};

DOM.remove = function(domEl) {
  domEl.remove();
};

DOM.empty = function(domEl) {
  // more performant than setting innerHTML
  domEl.textContent = "";
};

DOM.addClass = function(sClassName, domEl) {
  domEl.classList.add(sClassName);
};

DOM.removeClass = function(sClassName, domEl) {
  domEl.classList.remove(sClassName);
};

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export { DOM };

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