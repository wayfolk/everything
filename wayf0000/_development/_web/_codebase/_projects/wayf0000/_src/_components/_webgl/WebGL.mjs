///////////////////
///// IMPORTS /////
///////////////////

/// NPM
import { log, parallel, series } from "async";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

import { Reflector } from './_helpers/Reflector.js';

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

import { gsap } from "gsap";
// gsap.ticker.remove(gsap.updateRoot);
// console.log(gsap.ticker)
// gsap.ticker.fps(144);
// gsap.ticker.lagSmoothing(1000, 16);

/// LOCAL
import { ENV } from "../../_utils/ENV.mjs";
import { DOM } from "../../_utils/DOM.mjs";

/// ASSETS
import sHTML from './WebGL.html';
import sCSS from './WebGL.css';

/// WEBGL ASSETS
import sample_draco from './_assets/the-man-in-the-wall_LOD0.glb';

/////////////////
///// CLASS /////
/////////////////

class WebGL extends HTMLElement
{
  scene = Object.create(null);
  camera = Object.create(null);
  entities = { lights: Object.create(null), helpers: Object.create(null) };
  renderer = Object.create(null);
  resources = Object.create(null);
  controls = Object.create(null);

  fAnimateToPositionInterval = null;
  nAnimationToPositionCounter = 0;
  aPositions = new Array(Object.create(null), Object.create(null), Object.create(null));

  constructor(fOptionalCB)
  {
    super();
    console.log("_webGL: constructor()");

    this.__init(fOptionalCB);
  };

  ///////////////////////////
  ///// CLASS LIFECYCLE /////
  ///////////////////////////

  __init(fOptionalCB)
  {
    series(
      [
        function(fCB) { this.createShadowDOM(fCB); }.bind(this),
        function(fCB) { this.setEventHandlers(fCB); }.bind(this),
      ],
      function (err, results)
      {
        console.log("WebGL: __init: done");

        this.__webGL(fOptionalCB);
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
        console.log("_webGL: setEventHandlers: done");

        fCB();
      }.bind(this)
    );
  };

  ///////////////////////////
  ///// WEBGL LIFECYCLE /////
  ///////////////////////////

  __webGL(fOptionalCB)
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
        console.log("_webGL: __webGL: done");

        fOptionalCB();
      }.bind(this)
    );
  };

  //////////////////////////////
  ///// WEBGL CONTROL FLOW /////
  //////////////////////////////

  createScene(fCB)
  {
    const domWebgl = this.domShadowRoot.querySelector("#webgl");
    const nDomWebglWidth = domWebgl.clientWidth;
    const nDomWebglHeight = domWebgl.clientHeight;
    const fPixelRatio = window.devicePixelRatio; // 720 x 3 = 2160 //  window.devicePixelRatio

    this.scene = new THREE.Scene();

    this.scene.onBeforeRender = function()
    {
      // this.stats.begin();
    }.bind(this);

    this.scene.onAfterRender = function()
    {
      // this.stats.end();
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
		const vFoV = calculateVerticalFoV(20, Math.max(aspect, 16/9));
    this.camera = new THREE.PerspectiveCamera(vFoV, aspect, 0.3, 2000);
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
    this.renderer.setClearColor(new THREE.Color(0xffffff), .0); // controls bg alpha too
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
    // this.stats = new Stats({
    //   logsPerSecond: 144/2,
    //   samplesLog: 100,
    //   samplesGraph: 10,
    //   precision: 2,
    //   horizontal: false,
    //   minimal: false,
    //   mode: 0
    // });

    // this.stats.init(this.renderer.domElement)
    // domWebgl.appendChild(this.stats.container);

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
            resource.material.roughness = .450;
            resource.material.metalness = .025;

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
    this.resources["sample_draco"].scene.rotateX(2 * Math.PI * (180 /360) ) // rotate 180 deg
    this.scene.add(this.resources["sample_draco"].scene);

    // const light = new THREE.AmbientLight( 0x404040 , 2.0)
    // this.scene.add( light );

    this.entities.lights['pointLight'] = new THREE.PointLight(0xffffff, 25000, 500, 2.0);
    this.entities.lights['pointLight'].position.set(0, -100, -25);

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






    // if (!this.env.bIsMobile && this.env.nGPUTier > 1) {
      const mirrorGeometry = new THREE.PlaneGeometry(22.1, 29.1, 1, 1);
      const mirror = new Reflector(mirrorGeometry, {
        clipBias: 0.000001,
        textureWidth: 4096,
        textureHeight: 4096,
        color: new THREE.Color(0xffffff),
      });
      mirror.position.y = -0.01;
      mirror.position.z = 0;
      mirror.rotation.x =  Math.PI / 2;
      // mirror.rotateX((2 * Math.PI * (100 /360)));
      this.scene.add(mirror);
    // };

    // this.scene.scene.children[1].removeFromParent();
    // console.log(this.scene.children[0].children)
    // this.scene.children[0].children[1].removeFromParent();
    // this.scene.children[0].children[2].removeFromParent();
    // console.log(this.scene.children[0].children)

    // 3d obj we need
    // const baseObject3D = this.scene.children[0].children[1];

    // this.scene.children[0].children[1].removeFromParent();

    // this.oDummy = new THREE.Object3D();

    // this.nInstancedMeshCount = 50;
    // this.InstancedMesh = new THREE.InstancedMesh(baseObject3D.geometry, baseObject3D.material, this.nInstancedMeshCount);
    // this.InstancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // this.scene.add(this.InstancedMesh);

    // function r(min, max) {
      // let cal = (Math.random() * (max - min) + min);
      // return parseFloat(cal);
    // };

    // for ( let i = 0; i < this.nInstancedMeshCount; i ++ )
    // {
      // this.oDummy.position.set(r(-10, 10),r(-10, 10),r(-10, 10));
      // this.oDummy.updateMatrix();
      // this.InstancedMesh.setMatrixAt( i ++, this.oDummy.matrix );
    // };

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


    this.controls.target.x = 4.332140571237076
    this.controls.target.y = -4.277790315650077;
    this.controls.target.z = -5.198334749258187;

    window.controls = this.controls; // for easy logging


    fCB();
  };

  createAnimationLoop(fCB)
  {

    // this.controls.enabled = false;

    gsap.fromTo
    (
      this.entities.lights['pointLight'].position,
      { x: 10 }, { x: -10, duration: 10.000, ease: "sine.inOut", repeat: -1, yoyo: true },
    );



    gsap.to
    (
      this.controls.target,
      { x: -1.4702856715492076, y: -3.8835876309720274, z: -5.06633388070523, duration: 50.000, ease: "sine.inOut", repeat: -1, yoyo: true },
    );

    gsap.to
    (
      this.camera.position,
      { x: -25.720904331048878, y: -24.389446311270923, z: 58.042843238499984, duration: 50.000, ease: "sine.inOut", repeat: -1, yoyo: true },
    );



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

    // this.InstancedMesh.instanceMatrix.needsUpdate = true;
    // this.InstancedMesh.computeBoundingSphere();




    // console.log("camera pos:")
    // console.log(this.camera.position)

    // console.log("controls target:")
    // console.log(this.controls.target)


    // gsap.updateRoot(time)
    // gsap.ticker.tick();
    // this.camera.updateProjectionMatrix();

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
  'theu0000-components-webgl',
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