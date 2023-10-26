///////////////////
///// IMPORTS /////
///////////////////

/// NPM
import { series } from "async";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

// import { Reflector } from './_helpers/Reflector.js';

import
{
  BrightnessContrastEffect,
  HueSaturationEffect,
  EffectComposer,
  EffectPass,
  RenderPass
} from "postprocessing";

import { gsap } from "gsap";

/// LOCAL
import { ENV } from "../../_utils/ENV.mjs";
import { DOM } from "../../_utils/DOM.mjs";

/// ASSETS
import sHTML from './WebGL.html';
import sCSS from './WebGL.css';

/// WEBGL ASSETS
import dracoTheManInTheWall_LOD0 from './_assets/the-man-in-the-wall_LOD0.glb';
import dracoTheManInTheWall_LOD1 from './_assets/the-man-in-the-wall_LOD1.glb';

/////////////////
///// CLASS /////
/////////////////

class WebGL extends HTMLElement
{
  componentIsConnected = false;

  scene = Object.create(null);
  camera = Object.create(null);
  nFov = 20;
  entities = { lights: Object.create(null), helpers: Object.create(null) };
  renderer = Object.create(null);
  resources = Object.create(null);
  controls = Object.create(null);

  fAnimateToPositionInterval = null;
  nAnimationToPositionCounter = 0;
  aPositions = new Array(Object.create(null), Object.create(null), Object.create(null));

  domElement = null;
  // domOverlayElement = null;

  constructor(fOptionalCB)
  {
    super();
    console.log("_webGL: constructor()");

    this.__init(fOptionalCB);
  };

  // TODO: refactor this. We use it to delay initialising webgl until the dom is ready
  connectedCallback()
  {
    this.componentIsConnected = true;

    this.__webGL();
  }

  ///////////////////////////
  ///// CLASS LIFECYCLE /////
  ///////////////////////////

  __init(fOptionalCB)
  {
    series
    (
      [
        function(fCB) { this.createShadowDOM(fCB); }.bind(this),
        function(fCB) { this.setEventHandlers(fCB); }.bind(this),
      ],
      function (err, results)
      {
        console.log("_webGL: __init: done");

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

      this.domShadowRoot.appendChild
      (
        domTemplateHTML.content.cloneNode(true)
      );
    }

    this.domElement = this.domShadowRoot.querySelector("#webgl");
    // this.domOverlayElement = this.domShadowRoot.querySelector("#overlay");

    fCB();
  };

  setEventHandlers(fCB)
  {
    let onWindowResize = function(e) {
      this.setElementSizes(this.domElement.clientWidth, this.domElement.clientHeight);
    };
    window.addEventListener("resize", onWindowResize.bind(this));

    console.log("_webGL: setEventHandlers: done");

    fCB();
  };

  ///////////////////////////
  ///// WEBGL LIFECYCLE /////
  ///////////////////////////

  __webGL()
  {
    series
    (
      [
        function(fCB) { this.createScene(fCB); }.bind(this),
        function(fCB) { this.loadResources(fCB); }.bind(this),
        function(fCB) { this.processResources(fCB); }.bind(this),
        function(fCB) { this.populateScene(fCB); }.bind(this),
        function(fCB) { this.createControls(fCB); }.bind(this),
        function(fCB) { this.setWebGLEventHandlers(fCB); }.bind(this),
        function(fCB) { this.createAnimationLoop(fCB); }.bind(this),
      ],
      function (err, results)
      {
        console.log("_webGL: __webGL: done");

        gsap.fromTo
        (
          this.domElement,
          { y: -10 },
          { y: 0, duration: 1.200, delay: 0.000, ease: "sine.out" },
        );

        gsap.to
        (
          this.domElement,
          { opacity: 1.0, duration: .900, delay: 0.100, ease: "none" },
        );

        // gsap.to
        // (
        //   this.domOverlayElement,
        //   { opacity: 1.0, duration: .000, delay: 0.100, ease: "none" },
        // );

        // fOptionalCB();
      }.bind(this)
    );
  };

  //////////////////////////////
  ///// WEBGL CONTROL FLOW /////
  //////////////////////////////

  /// TODO: move helper
  calcVfov(nIntendedFov, nAspect)
  {
    // TODO: refactor
    const DEG2RAD = Math.PI / 180.0;
    const RAD2DEG = 180.0 / Math.PI;

    function calculateVerticalFoV(horizontalFoV, nAspect) {
      return Math.atan(Math.tan(horizontalFoV * DEG2RAD * 0.5)/nAspect) * RAD2DEG * 2.0;
    };

    function calculateHorizontalFoV(verticalFoV, aspect) {
      return Math.atan(Math.tan(verticalFoV * DEG2RAD * 0.5)*aspect) * RAD2DEG * 2.0;
    };

    return calculateVerticalFoV(nIntendedFov, nAspect)
  };

  createScene(fCB)
  {  
    const nDomWebglWidth = this.domElement.clientWidth;
    const nDomWebglHeight = this.domElement.clientHeight;
    
    const fPixelRatio = window.devicePixelRatio;

    this.scene = new THREE.Scene();

    const nAspect = nDomWebglWidth / nDomWebglHeight;
     // careful, changes need to be reflected in the resize handler
    this.camera = new THREE.PerspectiveCamera(this.calcVfov(this.nFov, nAspect), nAspect, 0.3, 2000);
    this.camera.position.z = 100;

    this.camera.position.x = 35.74099847324152;
    this.camera.position.y = -5.998596666095118;
    this.camera.position.z = 22.404224186390525;

    window.camera = this.camera; // for quick logging

    this.renderer = new THREE.WebGLRenderer
    (
      {
        powerPreference: "high-performance",
        logarithmicDepthBuffer: false,
        preserveDrawingBuffer: false,
        antialias: false,
        stencil: false,
        depth: false,
      }
    );
    this.renderer.setSize(nDomWebglWidth, nDomWebglHeight);
    this.renderer.setPixelRatio(fPixelRatio);
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;
    this.renderer.setClearColor(new THREE.Color(0xffffff), 0.0); // controls bg alpha too
    this.renderer.info.autoReset = false;
    this.domElement.appendChild(this.renderer.domElement);

    // https://pmndrs.github.io/postprocessing/public/docs/
    // https://github.com/pmndrs/postprocessing#output-color-space
    // https://github.com/pmndrs/postprocessing/wiki/Antialiasing
    this.composer = new EffectComposer
    (
      this.renderer,
      {
        frameBufferType: THREE.HalfFloatType,
        multisampling: (!ENV.getGPU().isMobile ? 4.0 : 2.0), // MSAA. Requires a WebGL 2 context.
      }
    );

    const _RenderPass = new RenderPass(this.scene,this.camera);

    const _BrightnessContrastEffect = new BrightnessContrastEffect
    (
      {
        brightness: 0.065, // [-1.0, 1.0]
        contrast: -0.25, // [-1.0, 1.0]
      }
    );

    const _HueSaturationEffect = new HueSaturationEffect
    (
      {
        hue: 0.0, // in radians
        saturation: -0.5, // [-1.0, 1.0]
      }
    );

    const _EffectPass = new EffectPass
    (
      this.camera,
      _BrightnessContrastEffect,
      _HueSaturationEffect,
    );

    this.composer.addPass(_RenderPass);
    this.composer.addPass(_EffectPass);

    // intial resize (this gets called in a futere windows eventhandler too)
    this.setElementSizes(this.domElement.clientWidth, this.domElement.clientHeight);

    fCB();
  };

  loadResources(fCB)
  {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/_assets/_draco/');
    gltfLoader.setDRACOLoader(dracoLoader);

    const assetToLoad = (!ENV.getGPU().isMobile ? dracoTheManInTheWall_LOD0 : dracoTheManInTheWall_LOD1);
    
    gltfLoader.load(assetToLoad, function(gltf) {
      this.resources["sample_draco"] = gltf;
      fCB();
    }.bind(this));

  };

  processResources(fCB)
  {
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    for (const resource in this.resources)
    {
      this.resources[resource].scene.traverse
      (
        function (resource)
        {
          if (resource.type === "Mesh")
          {
            resource.castShadow = true;
            resource.receiveShadow = true;

            resource.material.roughness = 0.600;
            resource.material.metalness = 0.250;

            if (resource.material.map !== null)
            {
              resource.material.map.anisotropy = maxAnisotropy;
            };
          };

          if (resource.type === "PointLight")
          {
            // https://discourse.threejs.org/t/luminous-intensity-calculation/19242/6
            // https://github.com/KhronosGroup/glTF-Blender-IO/issues/564
            // https://github.com/KhronosGroup/glTF-Blender-IO/pull/1760
            resource.intensity = resource.intensity * 0.0954;
            resource.castShadow = true;
            resource.shadow.bias = -0.00001;
            resource.shadow.mapSize.width = 4096;
            resource.shadow.mapSize.height = 4096;
          };
        }.bind(this)
      )
    };

    fCB();
  };

  populateScene(fCB)
  {
    // this.resources["sample_draco"].scene.rotateX(2 * Math.PI * (180 /360) ) // rotate 180 deg
    this.resources["sample_draco"].scene.scale.set(.35,.35,.35);
    this.scene.add(this.resources["sample_draco"].scene);

    const mirrorGeometry = new THREE.PlaneGeometry(22.1, 29.1, 1, 1);
    // const mirror = new Reflector
    // (
    //   mirrorGeometry, {
    //     clipBias: 0.000001,
    //     textureWidth: (!ENV.getGPU().isMobile ? 2048 : 512),
    //     textureHeight: (!ENV.getGPU().isMobile ? 2048 : 512),
    //     color: new THREE.Color(0xffffff),
    //   }
    // );
    // mirror.position.y = -0.01;
    // mirror.position.z = 0;
    // mirror.rotation.x =  Math.PI / 2;
    // this.scene.add(mirror);

    this.entities.lights['pointLight'] = new THREE.PointLight(0xffffff, 1500, 0, 2.0);
    this.entities.lights['pointLight'].position.set(0, 25, 0);

    this.scene.add( this.entities.lights['pointLight'] );

    // this.entities.helpers['axesHelper'] = new THREE.AxesHelper(25);
    // this.entities.helpers['axesHelper'].visible = true;
    // this.scene.add(this.entities.helpers['axesHelper']);

    // this.entities.helpers['gridHelper'] = new THREE.GridHelper(100, 10, 0x808080, 0x808080);
    // this.entities.helpers['gridHelper'].position.y = 0;
    // this.entities.helpers['gridHelper'].position.x = 0;
    // this.entities.helpers['gridHelper'].visible = true;
    // this.scene.add(this.entities.helpers['gridHelper']);

    // this.entities.helpers['polarGridHelper'] = new THREE.PolarGridHelper(200, 16, 8, 64, 0x808080, 0x808080);
    // this.entities.helpers['polarGridHelper'].position.y = 0;
    // this.entities.helpers['polarGridHelper'].position.x = 0;
    // this.entities.helpers['polarGridHelper'].visible = true;
    // this.scene.add(this.entities.helpers['polarGridHelper']);

    // this.entities.helpers['pointLightHelper'] = new THREE.PointLightHelper(this.entities.lights['pointLight'], 1.0, 0x808080);
    // this.entities.helpers['pointLightHelper'].visible = true;
    // this.scene.add(this.entities.helpers['pointLightHelper']);

    fCB();
  };

  createControls(fCB)
  {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.04;
    this.controls.zoomSpeed = 0.75;

    this.controls.enabled = false;


    // this.controls.target.x = 4.332140571237076
    // this.controls.target.y = -4.277790315650077;
    // this.controls.target.z = -5.198334749258187;

    window.controls = this.controls; // for easy logging

    fCB();
  };

  setWebGLEventHandlers(fCB)
  {

    const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

    let onCursorMove = function(e) {

      let val;

      // map domelem width to a smaller range
      if (e.type === "mousemove")
      {
        val = map(e.clientX, 0, this.domElement.clientWidth, -25, 25);
      }
      else if (e.type === "touchmove")
      {
        val = map(e.touches[0].clientX, 0, this.domElement.clientWidth, -25, 25);
      };

      gsap.killTweensOf(this.entities.lights['pointLight'].position);
      gsap.to
      (
        this.entities.lights['pointLight'].position,
        { x: val, duration: 1.200, ease: "sine.Out" },
      );
    };
    window.addEventListener("mousemove", onCursorMove.bind(this));
    window.addEventListener("touchmove", onCursorMove.bind(this));

    console.log("_webGL: setWebGLEventHandlers: done");

    fCB();
  };

  createAnimationLoop(fCB)
  {
    // gsap.to
    // (
    //   this.controls.target,
    //   { x: -1.4702856715492076, y: -3.8835876309720274, z: -5.06633388070523, duration: 50.000, ease: "sine.inOut", repeat: -1, yoyo: true },
    // );

    // gsap.to
    // (
    //   this.camera.position,
    //   { x: -25.720904331048878, y: -24.389446311270923, z: 58.042843238499984, duration: 50.000, ease: "sine.inOut", repeat: -1, yoyo: true },
    // );


    this.renderer.setAnimationLoop(this.tick.bind(this));
    fCB();
  };

  ////////////////////////////////
  ///// WEBGL CLASS FUNCTION /////
  ////////////////////////////////

  setElementSizes(updatedWidth, updatedHeight)
  {
    this.renderer.setSize(updatedWidth, updatedHeight);
    this.composer.setSize(updatedWidth, updatedHeight);

    this.camera.fov = this.calcVfov(this.nFov, updatedWidth / updatedHeight);
    this.camera.aspect = updatedWidth / updatedHeight;
    this.camera.updateProjectionMatrix();
  };

  tick()
  {

    this.resources["sample_draco"].scene.rotation.y += 0.001;
    // this order is important!
    this.controls.update();
    this.composer.render();
  };
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define
(
  'wayf0000-components-webgl',
  WebGL,
);

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export default WebGL;

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
