///////////////////
///// IMPORTS /////
///////////////////

/// NPM
import { log, parallel, series } from "async";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import
{
  SSAOEffect,
  SelectiveBloomEffect,
  DepthOfFieldEffect,
  BrightnessContrastEffect,
  HueSaturationEffect,
  BlendFunction,
  EffectComposer,
  EffectPass,
  RenderPass
} from "postprocessing";
import Stats from "stats-gl";

/// LOCAL
import { ENV } from "../../_utils/ENV.mjs";
import { DOM } from "../../_utils/DOM.mjs";

/// ASSETS
import sHTML from './Engine.html';
import sCSS from './Engine.css';

/// WEBGL ASSETS
import sample_draco from './_assets/sample_draco.glb';

/////////////////
///// CLASS /////
/////////////////

class Engine extends HTMLElement
{
  scene = Object.create(null);
  camera = Object.create(null);
  renderer = Object.create(null);
  resources = Object.create(null);
  controls = Object.create(null);

  constructor()
  {
    super();
    console.log("Engine: constructor()");

    this.__init();
  };

  ///////////////////////////
  ///// CLASS LIFECYCLE /////
  ///////////////////////////

  __init()
  {
    series(
      [
        function(fCB) { this.createShadowDOM(fCB); }.bind(this),
        function(fCB) { this.setEventHandlers(fCB); }.bind(this),
      ],
      function (err, results)
      {
        console.log("Engine: __init: done");

        this.__webGL();
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
        console.log("Engine: setEventHandlers: done");

        fCB();
      }.bind(this)
    );
  };

  ///////////////////////////
  ///// WEBGL LIFECYCLE /////
  ///////////////////////////

  __webGL()
  {
    series(
      [
        function(fCB) { this.createScene(fCB); }.bind(this),
        function(fCB) { this.loadResources(fCB); }.bind(this),
        function(fCB) { this.processResources(fCB); }.bind(this),
        function(fCB) { this.populateScene(fCB); }.bind(this),
        function(fCB) { this.createControls(fCB); }.bind(this),
        function(fCB) { this.createAnimationLoop(fCB); }.bind(this),
      ],
      function (err, results)
      {
        console.log("WebGL: __init: done");
      }.bind(this)
    );
  };

  //////////////////////////////
  ///// WEBGL CONTROL FLOW /////
  //////////////////////////////

  createScene(fCB)
  {
    const domWebgl = this.domShadowRoot.querySelector("#engine");
    const nDomWebglWidth = domWebgl.clientWidth;
    const nDomWebglHeight = domWebgl.clientHeight;
    const fPixelRatio = window.devicePixelRatio; // 720 x 3 = 2160 //  window.devicePixelRatio

    this.scene = new THREE.Scene();

    this.scene.onBeforeRender = function()
    {
      this.stats.begin();
    }.bind(this);

    this.scene.onAfterRender = function()
    {
      this.stats.end();
    }.bind(this);

    // TODO: refactor
    const DEG2RAD = Math.PI / 180.0;
    const RAD2DEG = 180.0 / Math.PI;

    function calculateVerticalFoV(horizontalFoV, aspect) {
      return Math.atan(Math.tan(horizontalFoV * DEG2RAD * 0.5)/aspect) * RAD2DEG * 2.0;
    };

    function calculateHorizontalFoV(verticalFoV, aspect) {
      return Math.atan(Math.tan(verticalFoV * DEG2RAD * 0.5)*aspect) * RAD2DEG * 2.0;
    };

    const aspect = nDomWebglWidth / nDomWebglHeight;
		const vFoV = calculateVerticalFoV(90, Math.max(aspect, 16/9));
    this.camera = new THREE.PerspectiveCamera(vFoV, aspect, 0.3, 2000);
    this.camera.position.z = 5;

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
    this.renderer.setClearColor(new THREE.Color(0x000000), 1.0); // controls bg alpha too
    this.renderer.info.autoReset = false;
    domWebgl.appendChild(this.renderer.domElement);

    // https://pmndrs.github.io/postprocessing/public/docs/
    // https://github.com/pmndrs/postprocessing#output-color-space
    // https://github.com/pmndrs/postprocessing/wiki/Antialiasing
    this.composer = new EffectComposer
    (
      this.renderer,
      {
        frameBufferType: THREE.HalfFloatType,
        multisampling: 4, // MSAA. Requires a WebGL 2 context.
      }
    );

    const _RenderPass = new RenderPass(this.scene,this.camera);

    // const _SSAOEffect = new SSAOEffect(this.camera, null, {
    //   samples: 30,
    //   rings: 4,
    //   worldDistanceThreshold: 1.0,
    //   worldDistanceFalloff: 0.0,
    //   luminanceInfluence: 0.9,
    //   intensity: 2.0,
    //   radius: 20,
    //   bias:0.5,
    //   // intensity: 1.0,
    //   // resolutionScale: 1.0,
    //   resolutionX: nDomWebglWidth * fPixelRatio,
    //   resolutionY: nDomWebglHeight * fPixelRatio,
    // });

    // this._SelectiveBloomEffect = new SelectiveBloomEffect(
    //   this.scene,
    //   this.camera,
    //   {
    //     intensity: 100.0,
    //   }
    // );

    // const _DepthOfFieldEffect = new DepthOfFieldEffect
    // (
    //   this.camera,
    //   {
    //     resolutionX: nDomWebglWidth * fPixelRatio,
    //     resolutionY: nDomWebglHeight * fPixelRatio,
    //   }
    // );

    const _BrightnessContrastEffect = new BrightnessContrastEffect
    (
      {
        brightness: 0.065, // [-1.0, 1.0]
        contrast: 0.0, // [-1.0, 1.0]
      }
    );

    const _HueSaturationEffect = new HueSaturationEffect
    (
      {
        hue: 0.0, // in radians
        saturation: 0.035, // [-1.0, 1.0]
      }
    );

    const _EffectPass = new EffectPass
    (
      this.camera,
      // _SSAOEffect,
      // this._SelectiveBloomEffect,
      // _DepthOfFieldEffect,
      _BrightnessContrastEffect,
      _HueSaturationEffect,
    );

    this.composer.addPass(_RenderPass);
    this.composer.addPass(_EffectPass);

    // TODO: refactor
    this.stats = new Stats({
      logsPerSecond: 144/2,
      samplesLog: 100,
      samplesGraph: 10,
      precision: 2,
      horizontal: false,
      minimal: false,
      mode: 0
    });

    this.stats.init(this.renderer.domElement)
    domWebgl.appendChild(this.stats.container);

    fCB();
  };

  loadResources(fCB)
  {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/_assets/_draco/');
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(sample_draco, function(gltf) {
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

            // TODO: is this correct for the default(?) blender shader
            resource.material.roughness = 1.0;
            resource.material.metalness = .25;

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
            // resource.intensity = resource.intensity * 0.04;
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
    // console.log(this.resources["sample_draco"].scene);
    this.scene.add(this.resources["sample_draco"].scene);

    // this.scene.scene.children[1].removeFromParent();
    // console.log(this.scene.children[0].children)
    this.scene.children[0].children[1].removeFromParent();
    this.scene.children[0].children[2].removeFromParent();
    // console.log(this.scene.children[0].children)

    // 3d obj we need
    const baseObject3D = this.scene.children[0].children[1];

    this.scene.children[0].children[1].removeFromParent();

    this.oDummy = new THREE.Object3D();

    this.nInstancedMeshCount = 50;
    this.InstancedMesh = new THREE.InstancedMesh(baseObject3D.geometry, baseObject3D.material, this.nInstancedMeshCount);
    this.InstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.InstancedMesh);

    function r(min, max) {
      let cal = (Math.random() * (max - min) + min);
      return parseFloat(cal);
    };

    for ( let i = 0; i < this.nInstancedMeshCount; i ++ )
    {
      this.oDummy.position.set(r(-10, 10),r(-10, 10),r(-10, 10));
      this.oDummy.updateMatrix();
      this.InstancedMesh.setMatrixAt( i ++, this.oDummy.matrix );
    };

    // this.scene.add(this.resources["sample_draco"].scene.children[4]);
    // this.scene.add(this.resources["sample_draco"].scene.children[5]);
    // console.log(this.resources["sample_draco"].scene);

    // this.scene.add(this.resources["sample_draco"].scene.children[4]);
    // this.scene.add(this.resources["sample_draco"].scene.children[6]);
    // this.scene.add(this.resources["sample_draco"].scene.children[2]);

    // mesh = new THREE.InstancedMesh( geometry, material, count );
    // console.log(this._SelectiveBloomEffect.selection);

    fCB();
  };

  createControls(fCB)
  {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.04;
    this.controls.zoomSpeed = 0.75;

    fCB();
  };

  createAnimationLoop(fCB)
  {
    this.renderer.setAnimationLoop(this.tick.bind(this));
    fCB();
  };

  tick()
  {
    const time = Date.now() * 0.001;

    // this.InstancedMesh.rotation.x = Math.sin( time / 4 );
		// this.InstancedMesh.rotation.y = Math.sin( time / 2 );

    // let i = 0;
    // const offset = ( this.nInstancedMeshCount - 1 ) / 3;

    // for ( let x = 0; x < this.nInstancedMeshCount; x ++ )
    // {
    //   for ( let y = 0; y < this.nInstancedMeshCount; y ++ )
    //   {
    //     for ( let z = 0; z < this.nInstancedMeshCount; z ++ )
    //     {
    //       this.oDummy.position.set( offset - x, offset + y*2, offset - z*2 );
    //       this.oDummy.rotation.y = ( Math.sin( x / 4 + time ) + Math.sin( y / 4 + time ) + Math.sin( z / 4 + time ) );
    //       this.oDummy.rotation.z = this.oDummy.rotation.y * 2;

    //       this.oDummy.updateMatrix();

    //       this.InstancedMesh.setMatrixAt( i ++, this.oDummy.matrix );
    //     };
    //   };
    // };

    this.InstancedMesh.instanceMatrix.needsUpdate = true;
    this.InstancedMesh.computeBoundingSphere();

    this.composer.render();
    this.controls.update();
  };
};

////////////////////////////////////
///// WEB COMPONENT DEFINITION /////
////////////////////////////////////

customElements.define
(
  'theu0000-components-engine',
  Engine,
);

//////////////////////
///// ES6 EXPORT /////
//////////////////////

export default Engine;

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