/*

  ★ Hello stranger, move your mouse over ★
  
  Audio-Reactive 3D Visuals 
  
  Inspired by the Ultrafragola Mirror.
  No 3D models have been downloaded here, everything is created with three.js.
  
  Thanks to:
  
  @EllenProbst for modifying audio data -
  https://codepen.io/EllenProbst/pen/RQQmJK
  
  @prisoner849 for round-edged box and closed tube geoms -
  https://discourse.threejs.org/t/round-edged-box
  https://discourse.threejs.org/t/end-caps-of-tubegeometry/9655/6
  
  @marco_fugaro for calc vertex normals in physical material
  
  Music: 'You're So Vain' by Carly Simon
  
  art & code by 
  Anna Scavenger, October 2020
  https://twitter.com/ouchpixels
  
*/

'use strict';

let scene, camera, renderer, container;

let cloth, mirror, wavyFrame;
let sculptureLeft, sculptureRight;
let isSculptureDancing = false;

let materials;

// AUDIO REACTIVE MESHES

let audioSpheres = [];
let audioPastilles = [];

// AUDIO

const audioURL = "https://assets.codepen.io/911157/Carly_Simon_Youre_So_Vain.mp3";

let isAudioPlaying = false;

let analyser;
let audioData = [];
let freqData = [];

// MOUSE

let mouseX = 0;
let time = 0;

// LANDSCAPE / PORTRAIT

let isMobile = /(Android|iPhone|iOS|iPod|iPad)/i.test(navigator.userAgent);
let windowRatio = window.innerWidth / window.innerHeight;
let isLandscape = (windowRatio > 1) ? true : false;

let paramsLandscape = {
  
  mirrorY: 40,
  centerLeftX: -220,
  centerLeftY: -100
  
};

let paramsPortrait = {
  
  mirrorY: 40,
  centerLeftX: -160,
  centerLeftY: -70
  
};

let params = isLandscape ? paramsLandscape : paramsPortrait;

// BACKGROUND RADIAL GRADIENT

let bgColors = [
  
  // center
  [230, 146, 181],
  [230, 146, 181],
  
  // outside
  [230, 230, 230],
  [125, 150, 150]
  
];

window.onload = function() {
  
  introAnimation();
  init();
  render();
  
};

function introAnimation() {
  
  const overlayContainer = document.querySelector("#overlay-container");
  const sceneContainer = document.querySelector("#scene-container");
  
  overlayContainer.style.animation = "fadeOut 1.1s ease-out forwards";
  sceneContainer.style.animation = "fadeIn 1.1s ease-in forwards";
  
  const credits = document.querySelector('#credits');
  credits.style.animation = "fadeIn3 8s ease-out forwards";
  
  const btnPlay = document.querySelector("#btn-play");
  btnPlay.addEventListener("click", onClick);
  btnPlay.style.animation = "fadeIn2 2.5s ease-in forwards";
  
}

function init() {
  
  // CAMERA, LIGHTS, RENDERER
  
  initSceneBasics();
  
  // ALL MATERIALS AND MESHES
  
  materials = initMaterials();
      
  let count = 140;
  initSprinkles(count);
  
  initMirror();
  initWalls();
  initCloth();
  initSculptureLeft();
  initSculptureRight();
  initPastilles();
    
  window.addEventListener("resize", onWindowResize);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("touchmove", onTouchMove);

}

function initSceneBasics() {
  
  container = document.querySelector("#scene-container");
  
  scene = new THREE.Scene();
  
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1800);
  const cameraZ = isLandscape ? 550 : 700;
  camera.position.set(0, 20, cameraZ);
  camera.lookAt(0, 0, 0);
  scene.add(camera);
  
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.7, 1.7);
  dirLight.position.set(0, 50, -50);
  scene.add(dirLight);
  
  const dirLight3 = new THREE.DirectionalLight(0xffffff, 1.2, 1.2);
  dirLight3.position.set(0, 10, -100);
  dirLight3.target.position.set(50, 0, -100);
  scene.add(dirLight3.target);
  scene.add(dirLight3);
  
  const dirLight2 = new THREE.DirectionalLight(0xff00ff, 1.4, 1.4);
  dirLight2.position.set(-40, 0, 50);
  scene.add(dirLight2);

  const hemLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1.5);
  hemLight.position.set(20, 50, 50);
  scene.add(hemLight);
  
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.GammaEncoding;
  renderer.gammaFactor = 2.2;
  renderer.setPixelRatio(window.devicePixelRatio > 1.5 ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 1.25));
  container.appendChild(renderer.domElement);
  
}

function SprinkleGeometry(arc = 0.5, radius = 35, thickness = 2.5) {
  
  this.arc = arc * Math.PI;
  this.torusRadius = radius;
  this.thickness = thickness;
  
  // SPRINKLE MIDDLE
  
  this.ArcGeom = new THREE.TorusBufferGeometry(this.torusRadius, this.thickness, 10, 15, this.arc);
  
  let sphereRadius = this.thickness;
  
  // SPRINKLE END 1 - HALF CIRCLE
  
  this.End1Geom = new THREE.SphereBufferGeometry(sphereRadius, 10, 10, 0, Math.PI);
  this.End1Geom.translate(0, this.torusRadius, 0);
  this.End1Geom.rotateY(- Math.PI / 2);
  this.End1Geom.rotateZ(- (0.5 * Math.PI - this.arc));
  
  // SPRINKLE END 1 - FULL CIRCLE
  
  this.End1SphereGeom = new THREE.SphereBufferGeometry(sphereRadius, 10, 10, 0, Math.PI * 2);
  this.End1SphereGeom.translate(0, this.torusRadius, 0);
  
  // SPRINKLE END 2 - HALF CIRCLE
  
  this.End2Geom = new THREE.SphereBufferGeometry(sphereRadius, 10, 10, 0, Math.PI);
  this.End2Geom.rotateX(Math.PI / 2);
  this.End2Geom.translate(this.torusRadius, 0, 0);

}

function initSprinkles(n) {
  
  let count = n;
  
  const iPinkMat = new THREE.MeshPhongMaterial({
    
    color: 0xffffff,
    shininess: 100,
    specular: 0x383636
    
  });
  
  const iGreenMat = new THREE.MeshPhongMaterial({
    
    color: 0xffffff,
    shininess: 100,
    specular: 0x383636
    
  });
  
  const iBlackMat = new THREE.MeshPhongMaterial({
    
    color: 0xffffff,
    shininess: 100,
    specular: 0x383636
    
  });
  
  // Assign random colors to the sprinkles
  
  let color = new THREE.Color();
  let color1 = new THREE.Color();
  let color2 = new THREE.Color();
  let aColorFloat32 = new Float32Array(count * 3);
  let aColorEnd1Float32 = new Float32Array(count * 3);
  let aColorEnd2Float32 = new Float32Array(count * 3);
  
  let sprinklePalette = [
    
    0xffffff, // white
    0xffe9c9, 
    0xffe9c9, 
    0x6e9377, // green
    0x6e9377,
    0xff84bd, // pink
    0xff84bd,
    0xff9977, // peach
    0x000000, // black
    
  ];
  
  for (let i = 0; i < count; i ++) {

    color.setHex(sprinklePalette[Math.floor(Math.random() * sprinklePalette.length)]);
    color1.setHex(sprinklePalette[Math.floor(Math.random() * sprinklePalette.length)]);
    color2.setHex(sprinklePalette[Math.floor(Math.random() * sprinklePalette.length)]);
    
	  color.toArray(aColorFloat32, i * 3);
    color1.toArray(aColorEnd1Float32, i * 3);
    color2.toArray(aColorEnd2Float32, i * 3);

	}
    
  const sprinkleArcGeom = new SprinkleGeometry().ArcGeom;
  const sprinkleEnd1Geom = new SprinkleGeometry().End1Geom;
  const sprinkleEnd2Geom = new SprinkleGeometry().End2Geom;
  
  sprinkleArcGeom.setAttribute('color', new THREE.InstancedBufferAttribute(aColorFloat32, 3));
	iPinkMat.vertexColors = true;
  
  sprinkleEnd1Geom.setAttribute('color', new THREE.InstancedBufferAttribute(aColorEnd1Float32, 3));
	iGreenMat.vertexColors = true;
  
  sprinkleEnd2Geom.setAttribute('color', new THREE.InstancedBufferAttribute(aColorEnd2Float32, 3));
	iBlackMat.vertexColors = true;

  let instancedSprinkleArc = new THREE.InstancedMesh(sprinkleArcGeom, iPinkMat, count);
  let instancedSprinkleEnd1 = new THREE.InstancedMesh(sprinkleEnd1Geom, iGreenMat, count);
  let instancedSprinkleEnd2 = new THREE.InstancedMesh(sprinkleEnd2Geom, iBlackMat, count);
  
  let dummy = new THREE.Object3D();
  
  for (let i = 0; i < count; i ++) {
    
    let theta = THREE.Math.randFloatSpread(90);
    let phi = THREE.Math.randFloatSpread(90);
    
    dummy.position.set(
      Math.floor(Math.random() * (375 - (-375)) - 375),
      Math.floor(Math.random() * (100 - (-50)) - 50),
      Math.floor(Math.random() * (-70 - (-270)) - 270)
    );

    dummy.rotation.set(
      Math.random() * 2 * Math.PI,
      Math.random() * 2 * Math.PI,
      0
    );

    dummy.updateMatrix();

    instancedSprinkleArc.setMatrixAt( i, dummy.matrix );
    instancedSprinkleEnd1.setMatrixAt( i, dummy.matrix );
    instancedSprinkleEnd2.setMatrixAt( i, dummy.matrix );

  }
  
  const sprinklesGroup = new THREE.Group();
  sprinklesGroup.add(instancedSprinkleArc);
  sprinklesGroup.add(instancedSprinkleEnd1);
  sprinklesGroup.add(instancedSprinkleEnd2);
  
  scene.add(sprinklesGroup);
  
}

function closedCapsTube(pts, thickness, segments) {  
  
  const closedTubeGroup = new THREE.Group();
  
  // CURVE SHAPING THE SCULPTURE
  
  let points = pts;
  let pScale = 1.5;

  for (let i = 0; i < points.length; i++) {
    
    let x = points[i][0] * pScale;
    let y = points[i][1] * pScale;
    let z = points[i][2] * pScale;
    points[i] = new THREE.Vector3(x, z, -y);
    
  }
  
  
  let curve = new THREE.CatmullRomCurve3(points);
  // console.log(points);
  let p = curve.getPoints(20);
  let curveSmooth = new THREE.CatmullRomCurve3(p);
  let geom = new THREE.TubeBufferGeometry(curveSmooth, 180, thickness, 10, false);
  let tube = new THREE.Mesh(geom, materials.peachStandard);
  closedTubeGroup.add(tube);
  
  // TUBE START POINTS
  
  let pos = geom.attributes.position;
  let startPoints = [];
  startPoints.push(curve.getPoint(0));
  
  for (let i = 0; i <= geom.parameters.radialSegments; i++) {

	  startPoints.push(new THREE.Vector3().fromBufferAttribute(pos, i));
  
  }

  let pointsStartGeom = new THREE.BufferGeometry().setFromPoints(startPoints);
  let psgPos = pointsStartGeom.attributes.position;
  let indexStart = [];
  
  for (let i = 1; i < psgPos.count - 1; i++) {
    
    indexStart.push(0, i, i + 1);
    
  }
  pointsStartGeom.setIndex(indexStart);
  pointsStartGeom.computeVertexNormals();
  
  // CAP MESH START
  
  let capStart = new THREE.Mesh(pointsStartGeom, materials.peachStandard);
  closedTubeGroup.add(capStart);
  
  // TUBE END POINTS
  
  let endPoints = [];
  endPoints.push(curve.getPoint(1));
  
  for (let i = (geom.parameters.radialSegments + 1) * geom.parameters.tubularSegments; i < pos.count; i++) {
	
	  endPoints.push(new THREE.Vector3().fromBufferAttribute(pos, i));

  }

  let pointsEndGeom = new THREE.BufferGeometry().setFromPoints(endPoints);
  let pegPos = pointsEndGeom.attributes.position;
  let indexEnd = [];
  
  for (let i = 1; i < pegPos.count - 1; i++) {
	
    indexEnd.push(0, i + 1, i);
    
  }
  pointsEndGeom.setIndex(indexEnd);
  pointsEndGeom.computeVertexNormals();
  
  // CAP MESH END
  
  let capEnd = new THREE.Mesh(pointsEndGeom, materials.peachStandard);
  closedTubeGroup.add(capEnd);
  
  return closedTubeGroup;
  
}

function initSculptureRight() {
  
  sculptureRight = new THREE.Group();
  
  let points = getExportedPoints().sculpturePoints;

  const tubeBig = closedCapsTube(points, 0.75, 240);  
  const scale = 11;
  tubeBig.scale.set(scale, scale, scale);
  tubeBig.position.set(0, 70, 0);
  sculptureRight.add(tubeBig);
  
  const sphereGeom = new THREE.SphereBufferGeometry(25, 20, 15);
  
  const sphereCheck2 = new THREE.Mesh(sphereGeom, materials.checkerboardPhong);
  sphereCheck2.position.set(55, 30, 15);
  sphereCheck2.rotation.x = Math.PI / 2.5;
  sphereCheck2.rotation.z = -Math.PI / 1.25;
  sculptureRight.add(sphereCheck2);
  
  const sphereCheck3 = sphereCheck2.clone();
  sphereCheck3.position.set(-10, 60, -30);
  sphereCheck3.rotation.x = Math.PI / 3.5;
  sphereCheck3.rotation.z = -Math.PI / 1.5;
  sculptureRight.add(sphereCheck3);
  
  const sphere = new THREE.Mesh(sphereGeom, materials.chestnut);
  sphere.position.set(17, -45, 0);
  sphere.scale.set(0.55, 0.55, 0.55);
  sculptureRight.add(sphere);
  
  sculptureRight.position.x = 210;
  sculptureRight.position.y = -70;
  
  scene.add(sculptureRight);
  audioSpheres.push(sphereCheck2, sphereCheck3);
  
}

function initSculptureLeft() {
  
  sculptureLeft = new THREE.Group();
 
  const doodle = new THREE.Group();
  
  let thickness = 2.5;
  let t = thickness;
  
  const torusGeom = new THREE.TorusBufferGeometry(22, t, 16, 20, Math.PI);
  const torusGeom2 = new THREE.TorusBufferGeometry(22, t, 16, 20, Math.PI / 2);
  const torusGeom3 = new THREE.TorusBufferGeometry(5, t, 16, 20, Math.PI / 2);
  const torusGeom4 = new THREE.TorusBufferGeometry(15, t, 16, 20, Math.PI / 2);
  const torusGeom5 = new THREE.TorusBufferGeometry(40, t, 16, 20, 0.35 * Math.PI);
  const cylinderGeom = new THREE.CylinderBufferGeometry(t, t, 40, 11, 1);
  
  const torus = new THREE.Mesh(torusGeom, materials.peachStandard);
  torus.position.set(0, 55, 0);
  torus.rotation.x = Math.PI;
  doodle.add(torus);
  const torus2 = torus.clone();
  torus2.rotation.x = 0;
  torus2.position.copy(torus.position);
  torus2.position.x = torus.position.x + 2 * torusGeom.parameters.radius;
  doodle.add(torus2);
  const torus3 = new THREE.Mesh(torusGeom2, materials.peachStandard);
  torus3.rotation.x = Math.PI;
  torus3.position.copy(torus2.position);
  doodle.add(torus3);
  const torus4 = new THREE.Mesh(torusGeom3, materials.peachStandard);
  torus4.position.copy(torus3.position);
  torus4.position.y = torus3.position.y - torusGeom2.parameters.radius - 2 * torusGeom3.parameters.tube;
  torus4.rotation.z = Math.PI / 2;
  doodle.add(torus4);
  const cylinder = new THREE.Mesh(cylinderGeom, materials.peachStandard);
  cylinder.position.copy(torus4.position);
  cylinder.position.x = torus4.position.x - torusGeom3.parameters.radius;
  cylinder.position.y = torus4.position.y - 19;
  doodle.add(cylinder);
  const torus5 = new THREE.Mesh(torusGeom4, materials.peachStandard);
  torus5.position.copy(cylinder.position);
  torus5.position.x = cylinder.position.x - torusGeom4.parameters.radius;
  torus5.position.y = cylinder.position.y - 20;
  torus5.rotation.x = Math.PI;
  doodle.add(torus5);
  const torus6 = new THREE.Mesh(torusGeom3, materials.peachStandard);
  torus6.position.copy(torus5.position);
  torus6.position.x = torus5.position.x;
  torus6.rotation.y = -Math.PI;
  torus6.rotation.x = Math.PI;
  torus6.position.y = torus5.position.y - torusGeom4.parameters.radius + 2 * thickness;
  doodle.add(torus6);
  const torus7 = new THREE.Mesh(torusGeom5, materials.black);
  torus7.position.copy(torus6.position);
  torus7.position.x = torus6.position.x - 110;
  torus7.position.y = torus6.position.y - 4;
  doodle.add(torus7);

  const curve = new THREE.Curve();
  
  sculptureLeft.add(doodle);
  
  const roundedBoxGeom = roundEdgedBoxGeom(50, 40, 40, 4, 5);
  roundedBoxGeom.computeVertexNormals();
  roundedBoxGeom.translate(0, .5, 0);
  
  const roundedBox = new THREE.Mesh(roundedBoxGeom, materials.chestnut);
  roundedBox.rotation.x = - 0.4 * Math.PI;
  sculptureLeft.add(roundedBox);
  
  const sphereGeom = new THREE.SphereBufferGeometry(25, 20, 15);
  
  const sphereCheck = new THREE.Mesh(sphereGeom, materials.checkerboardPhong);
  sphereCheck.position.set(-30, 70, 0);
  sphereCheck.rotation.x = Math.PI / 1.2;
  sculptureLeft.add(sphereCheck);
  audioSpheres.push(sphereCheck);
  
  let sphere = new THREE.Mesh(sphereGeom, materials.peachStandard);
  sphere.position.set(-45, 20, 0);
  sphere.scale.set(0.65, 0.65, 0.65);
  sculptureLeft.add(sphere);
  
  let sphere2 = new THREE.Mesh(sphereGeom, materials.green);
  sphere2.position.set(30, 86.5, 0);
  sphere2.scale.set(0.4, 0.4, 0.4);
  sculptureLeft.add(sphere2);
  
  let sphere3 = new THREE.Mesh(sphereGeom, materials.black);
  sphere3.position.set(8, -30, 0);
  sphere3.scale.set(0.4, 0.4, 0.4);
  sculptureLeft.add(sphere3);
  
  let sphere4 = new THREE.Mesh(sphereGeom, materials.black);
  sphere4.position.set(40, 45, 0);
  sphere4.scale.set(0.4, 0.4, 0.4);
  sculptureLeft.add(sphere4);
  
  sculptureLeft.position.x = -210;
  sculptureLeft.position.y = -70;
  
  scene.add(sculptureLeft);
  
}

function initWalls() {
  
  // WALLS
  
  let cameraZ = camera.position.z;
  let planeZ = -500;
  let distance = cameraZ - planeZ;
  let viewWidth = window.innerWidth;
  let viewHeight = window.innerHeight;
  let aspect = camera.aspect;
  let vFov = camera.fov * Math.PI / 180;
  let planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance;
  let planeWidthAtDistance = planeHeightAtDistance * aspect;
  
  let planeWidth = planeWidthAtDistance;
  let planeHeight = planeHeightAtDistance;
  
  let scale = 7;
  let planeGeom = new THREE.PlaneBufferGeometry(scale * planeWidth, scale * planeHeight);
  planeGeom.translate(0, 0.3 * planeHeight, 0);

  let beigeBasic = new THREE.MeshBasicMaterial({color: 0x91827f})
  let wallFront = new THREE.Mesh(planeGeom, beigeBasic);
	wallFront.position.z = 300;
	wallFront.position.y = 0;
	wallFront.rotateY(Math.PI);
	scene.add(wallFront);
    
  let wallWidth = planeGeom.parameters.width;
  let wallHeight = planeGeom.parameters.width;
  
  let wallLeft = new THREE.Mesh(planeGeom, beigeBasic);
  wallLeft.position.copy(wallFront.position);
  wallLeft.position.x = wallFront.position.x - wallWidth / 2;
  wallLeft.position.z = wallFront.position.z - wallWidth / 2;
  wallLeft.rotation.y = Math.PI / 2;
  
  let wallRight = new THREE.Mesh(planeGeom, beigeBasic);
  wallRight.position.copy(wallFront.position);
  wallRight.position.x = wallFront.position.x + wallWidth / 2;
  wallRight.position.z = wallFront.position.z - wallWidth / 2;
  wallRight.rotation.y = -Math.PI / 2;
  
  scene.add(wallLeft, wallRight);
  
}

function initCloth() {
  
  const SIZE = 4;
  const RESOLUTION = 64;

  const geometry = new THREE.PlaneBufferGeometry(SIZE, SIZE, RESOLUTION, RESOLUTION).rotateX(- Math.PI / 2);
  
  const material = new THREE.ShaderMaterial({
    
    lights: true,
    side: THREE.DoubleSide,
    extensions: {
      derivatives: true,
    },
    defines: {
      STANDARD: '',
      PHYSICAL: '',
    },
    uniforms: {
      ...THREE.ShaderLib.physical.uniforms,
      roughness: {value: 0.0},
      diffuse: {value: new THREE.Color(0xffffff)},
    
      amplitude: {value: 0.4},
      frequency: {value: 0.55},
      speed: {value: 0.3},
      time: {value: 0.0},
    },

    vertexShader: monkeyPatch(THREE.ShaderChunk.meshphysical_vert, {
      
    header: `
      uniform float time;
      uniform float amplitude;
      uniform float speed;
      uniform float frequency;
      varying vec2 vUv;

      ${noise()}
      
      // the function which defines the displacement
      float f(vec3 point) {
        return noise(vec3(point.x * frequency, point.z * frequency, time * speed)) * amplitude;
      }
    `,
    // adapted from http://tonfilm.blogspot.com/2007/01/calculate-normals-in-shader.html
    main: `
      vUv = uv;
      float displacement = f(position);
      vec3 displaced = position + normal * f(position);

      float offset = ${SIZE / RESOLUTION};
      vec3 neighbour1 = position + vec3(offset, 0, 0);
      vec3 neighbour2 = position + vec3(0, 0, -offset);
      vec3 displacedNeighbour1 = neighbour1 + normal * f(neighbour1);
      vec3 displacedNeighbour2 = neighbour2 + normal * f(neighbour2);

      // https://i.ya-webdesign.com/images/vector-normals-tangent-16.png
      vec3 tangent = displacedNeighbour1 - displaced;
      vec3 bitangent = displacedNeighbour2 - displaced;

      // https://upload.wikimedia.org/wikipedia/commons/d/d2/Right_hand_rule_cross_product.svg
      vec3 displacedNormal = normalize(cross(tangent, bitangent));
    `,

     '#include <defaultnormal_vertex>': THREE.ShaderChunk.defaultnormal_vertex.replace(
      // transformedNormal will be used in the lighting calculations
      'vec3 transformedNormal = objectNormal;',
      `vec3 transformedNormal = displacedNormal;`
      ),

      // transformed is the output position
      '#include <displacementmap_vertex>': `
      transformed += normal * displacement;
      `,
    }),
  
    fragmentShader: THREE.ShaderChunk.meshphysical_frag,
    
  });
  
  let scale = 40;
  cloth = new THREE.Mesh(geometry, material);
  cloth.position.set(0, params.mirrorY - 100, 160);
  cloth.rotation.y = Math.PI / 4;
  cloth.scale.set(scale, scale, scale);
  scene.add(cloth);
  
}

function initPastilles() {
  
  const cylinderGeom = new THREE.CylinderBufferGeometry(14, 14, 5, 20);
  const checkMat = materials.checkerboardPhong;
  
  let pastillesNum = 7;
  
  for (let i = 0; i < pastillesNum; i++) {
    
    let p = new THREE.Mesh(cylinderGeom, checkMat);
    p.position.x = -110 + 35 * i;
    p.position.y = Math.floor(Math.random() * (-120 - (-160)) - 180);
    p.position.z = Math.floor(Math.random() * (50 - (20)) - 20);
    p.rotation.x = Math.PI * Math.random();
    p.rotation.y = Math.PI * Math.random();
    audioPastilles.push(p);
    scene.add(p);
  }
  
}

function generateCurve() {
  
  let points = getExportedPoints().wavyFramePoints;
  
  let scale = 7.75;

  for (let i = 0; i < points.length; i++) {
    
    let x = points[i][0] * scale;
    let y = points[i][1] * scale;
    let z = points[i][2] * scale;
    points[i] = new THREE.Vector3(x, z, -y);
    
  }
 
  let curve =  new THREE.CatmullRomCurve3(points);
  return curve;
   
}

function initMirror() {
  
  // MIRROR WAVY FRAME
  
  let curve = generateCurve();
  let segments = 240;
  let tubeRadius = 2.0;
  
  let tubeGeom = new THREE.TubeBufferGeometry(curve, segments, tubeRadius, 4, true);
  tubeGeom.rotateX(Math.PI / 2);
      
  let baseScale = 2;
  let zFactor = -4;
  let scaleXFactor = 0.3;
  let scaleYFactor = 0.15;
  let scaleZFactor = 0.15;
  
  let numFrames = 5;
  
  wavyFrame = new THREE.Group();
  
  for (let i = 0; i < numFrames; i++) {
    
    let frame = new THREE.Mesh(tubeGeom, materials.peachStandard);
    frame.position.set(0, 0, 0 + i * zFactor);
    frame.scale.x = baseScale + scaleXFactor * i;
    frame.scale.y = baseScale + scaleYFactor * i;
    frame.scale.z = baseScale + scaleZFactor * (i + 0.1 * i);
    wavyFrame.add(frame);

  }
  
  wavyFrame.position.set(0, params.mirrorY, 45);
  scene.add(wavyFrame);
  
  // measurements of last (biggest) frame - for mirror dimensions
  let frameChild = wavyFrame.children[numFrames - 1].geometry;
  frameChild.computeBoundingBox();
  let bBox = frameChild.boundingBox;
  let frameWidth = (bBox.max.x - bBox.min.x) * (baseScale + scaleXFactor * (numFrames - 1));
  let frameHeight = (bBox.max.y - bBox.min.y) * (baseScale + scaleXFactor * (numFrames - 1));
  
  // MIRROR REFLECTOR
  
  let WIDTH = window.innerWidth;
  let HEIGHT = window.innerHeight;
  
  let mirrorWidth = 0.85 * frameWidth;
  let mirrorHeight = 0.95 * frameHeight;
  let mirrorGeom = new THREE.PlaneBufferGeometry(mirrorWidth, mirrorHeight);
  
  mirror = new THREE.Reflector(mirrorGeom, {
    
	  clipBias: 0.003,
		textureWidth: WIDTH * window.devicePixelRatio,
	  textureHeight: HEIGHT * window.devicePixelRatio,
		color: 0xc97c7c
    
	});
    
  mirror.position.copy(wavyFrame.position);
  mirror.position.y = wavyFrame.position.y + 0;
  mirror.position.z = wavyFrame.position.z - 200;
	scene.add(mirror);
  
}

// AUDIO 

function initAudio() {
  
  const audio = new Audio();
  audio.src = audioURL;
  audio.controls = true;
  audio.autoplay = true;
  audio.crossOrigin = "anonymous";
  audio.loop = true;
  document.body.appendChild(audio);
  
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  const source = audioCtx.createMediaElementSource(audio);
  const volumeControl = audioCtx.createGain();
  source.connect(audioCtx.destination);
  source.connect(volumeControl);

  analyser = audioCtx.createAnalyser();
  volumeControl.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 128;
  
  freqData = new Uint8Array(analyser.frequencyBinCount);
  getAudioData(freqData);
  
  volumeControl.gain.value = audio.volume;
   
}

function getAudioData(data) {
  
	let frequencyArray = splitFrenquencyArray(data, 3);

	// Make average of frequency array
	for (let i = 0; i < frequencyArray.length; i++) {
    
		let average = 0;

		for (let j = 0; j < frequencyArray[i].length; j++) {
      
			average += frequencyArray[i][j];
      
		}
    
		audioData[i] = average / frequencyArray[i].length;
    
	}
  
	return audioData;
  
}

function splitFrenquencyArray(arr, n) {
  
	let tab = Object.keys(arr).map(function(key) {
    
		return arr[key];
    
	});
  
	let len = tab.length;
  let result = [];
  let i = 0;

	while (i < len) {
    
		let size = Math.ceil((len - i) / n--);
		result.push(tab.slice(i, i + size));
		i += size;
    
	}

	return result;
  
}

function abs(a) {
  
  return Math.abs(a);
  
}

function render() {
  
  update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
	
}

function update() {
      
  cloth.material.uniforms.time.value = 0.1 + 3.0 * mouseX;
  cloth.material.uniforms.diffuse.value.g = 0.0 + 1.0 * abs(mouseX * mouseX * mouseX);
  cloth.material.uniforms.diffuse.value.r = 0.0 + 1.0 * abs(mouseX * mouseX * mouseX);
  cloth.material.uniforms.diffuse.value.b = 0.0 + 1.0 * abs(mouseX * mouseX * mouseX);
    
  mirror.rotation.y = 0.2 * Math.PI * mouseX;
  wavyFrame.rotation.y = 0.2 * Math.PI * mouseX;
  
  if (isAudioPlaying) {
    
    updateAudio();
    sculptureLeft.position.x = -210 * Math.cos(1.5 * Math.PI * mouseX);
    sculptureLeft.position.z = -280 * Math.sin(1.5 *Math.PI * mouseX);
  
    sculptureRight.position.x = 210 * Math.cos(1.5 * Math.PI * mouseX);
    sculptureRight.position.z = 290 * Math.sin(1.5 *Math.PI * mouseX);
    
  }
  
}

function updateAudio() {
  
  getAudioData(freqData);
  analyser.getByteFrequencyData(freqData);
  
  audioSpheres.forEach(sphere => {
    
    sphere.scale.x = 0.9 + audioData[0] / 500;
    sphere.scale.y = 0.9 + audioData[0] / 500;
    sphere.scale.z = 0.9 + audioData[0] / 500;
  
  });
  
  // audioPastilles.forEach((pastille, i) => (pastille.position.y = audioData[0] / 10 - 0.9 * 170));
  
  audioPastilles.forEach(pastille => {
    
    pastille.scale.x = 0.9 + audioData[0] / 500;
    pastille.scale.y = 0.9 + audioData[0] / 500;
    pastille.scale.z = 0.9 + audioData[0] / 500;
  
  });
  
}

// *** EVENTS ***

function onMouseMove(event) {
  
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  
  radialGradientChange(bgColors, container);
  
}

function onTouchMove(event) {
    
	let x = event.changedTouches[0].clientX;
  mouseX = (x / window.innerWidth) * 2 - 1;
  
  radialGradientChange(bgColors, container);
      
}

function onWindowResize() {
  
  const renderTarget = mirror.getRenderTarget();
  renderTarget.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
}

function onClick(e) {
  
  e.preventDefault();

  initAudio();
  isAudioPlaying = !isAudioPlaying;
  
  e.target.remove();
  
}

// BACKGROUND GRADIENT

function radialGradientChange(colorsArr, element) {
  
  let colors = colorsArr;

  element.style.background = `radial-gradient(circle, 
rgba(
${colors[0][0] - (colors[0][0]-colors[1][0]) * Math.abs(mouseX)},
${colors[0][1] - (colors[0][1]-colors[1][1]) * Math.abs(mouseX)},
${colors[0][2] - (colors[0][2]-colors[1][2]) * Math.abs(mouseX)},
1) 0%, 
rgba(
${colors[2][0] - (colors[2][0]-colors[3][0]) * Math.abs(mouseX)},
${colors[2][1] - (colors[2][1]-colors[3][1]) * Math.abs(mouseX)},
${colors[2][2] - (colors[2][2]-colors[3][2]) * Math.abs(mouseX)},
1) 100%)`;

}