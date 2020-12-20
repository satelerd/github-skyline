import * as THREE from "./three.module.js";
import { GLTFLoader } from './GLTFLoader.js';
import { OrbitControls } from './OrbitControls.js';
import { GUI } from './dat.gui.module.js';
import { STLExporter } from './STLExporter.js';

const BASE_LENGTH = 0.834
const BASE_WIDTH = 0.167
const BASE_HEIGHT = 0.05
const CUBE_SIZE = 0.0143
const MAX_HEIGHT = 0.14
const FACE_ANGLE = 104.79

let username = "nat"
let year = "" + (new Date()).getFullYear()
let json = {}
let font = undefined
let fontSize = 0.025
let fontHeight = 0.00658 // Extrusion thickness

let camera, scene, renderer
let bronzeMaterial
let controls

var exporter = new STLExporter();

var urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('username')) {
  username = urlParams.get('username')
}

if (urlParams.has('year')) {
  year = urlParams.get('year')
}

// Import JSON data
async function loadJSON(username, year) {
  let url = `https://json-contributions-five.vercel.app/api/user?username=${username}&year=${year}`
  let response = await fetch(url)
  if (response.ok) {
    json = await response.json()
    init()
    animate()
  } else {
    alert("HTTP-Error: " + response.status)
  }
}

loadJSON(username, year)

const fixSideNormals = (geometry) => {
  let triangle = new THREE.Triangle()

  // "fix" side normals by removing z-component of normals for side faces
  var triangleAreaHeuristics = 0.1 * ( fontHeight * fontSize );
  for (var i = 0; i < geometry.faces.length; i++) {
    let face = geometry.faces[i]

    if ( face.materialIndex == 1 ) {
      for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
        face.vertexNormals[ j ].z = 0
        face.vertexNormals[ j ].normalize()
      }

      let va = geometry.vertices[ face.a ]
      let vb = geometry.vertices[ face.b ]
      let vc = geometry.vertices[ face.c ]

      let s = triangle.set( va, vb, vc ).getArea()

      if ( s > triangleAreaHeuristics ) {
        for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
          face.vertexNormals[ j ].copy(face.normal)
        }
      }
    }
  }
}

const createText = () => {
  let nameGeo = new THREE.TextGeometry(username, {
    font: font,
    size: fontSize,
    height: fontHeight
  })

  let textGroup = new THREE.Group()

  nameGeo.computeBoundingBox()
  nameGeo.computeVertexNormals()

  let yearGeo = new THREE.TextGeometry(year, {
    font: font,
    size: fontSize,
    height: fontHeight
  })

  yearGeo.computeBoundingBox()
  yearGeo.computeVertexNormals()

  fixSideNormals(nameGeo)
  fixSideNormals(yearGeo)

  nameGeo = new THREE.BufferGeometry().fromGeometry(nameGeo)
  let nameMesh = new THREE.Mesh(nameGeo, bronzeMaterial)

  nameMesh.position.x = -0.295
  nameMesh.position.y = -0.075
  nameMesh.position.z = -0.010

  nameMesh.geometry.rotateX(FACE_ANGLE * Math.PI / 2)
  nameMesh.geometry.rotateY(Math.PI * 2)
  textGroup.add(nameMesh)

  yearGeo = new THREE.BufferGeometry().fromGeometry(yearGeo)
  let yearMesh = new THREE.Mesh(yearGeo, bronzeMaterial)

  yearMesh.position.x = 0.280
  yearMesh.position.y = -0.075
  yearMesh.position.z = -0.010

  yearMesh.geometry.rotateX(FACE_ANGLE * Math.PI / 2)
  yearMesh.geometry.rotateY(Math.PI * 2)
  textGroup.add(yearMesh);
  return textGroup;
}

const init = () => {
  // SCENE
  scene = new THREE.Scene()

  // CAMERA
  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 10 )

  // RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize( window.innerWidth, window.innerHeight )
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.setClearColor(0xffffff, 1)
  document.body.appendChild(renderer.domElement)

  const textureLoader = new THREE.CubeTextureLoader();
  textureLoader.setPath( 'textures/cube/Bridge2/' );

  // MATERIALS
  let phongMaterial = new THREE.MeshPhongMaterial( { color: 0x40c463, transparent: true, opacity: 0.2, side: THREE.DoubleSide } )
  bronzeMaterial = new THREE.MeshStandardMaterial( {metalness: 1, roughness: 0.3})

  // LIGHTS
  const dLight1 = new THREE.DirectionalLight(0xebeb8c, 0.8)
  dLight1.position.set(-2, -5, 5);
  dLight1.target.position.set(0, 0, 0);
  const dLight2 = new THREE.DirectionalLight(0xebeb8c, 0.8)
  dLight2.position.set(2, -5, 5);
  dLight2.target.position.set(0, 0, 0);

  scene.add(dLight1)
  scene.add(dLight2)

  // LOAD REFERENCE MODEL
  let loader = new GLTFLoader().setPath('../models/')
  loader.load('ashtom-orig.glb', function (gltf) {
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.material = phongMaterial
        child.material.depthWrite = !child.material.transparent
      }
    })

    gltf.scene.rotation.x = Math.PI/2
    gltf.scene.rotation.y = -Math.PI

    // let worldAxis = new THREE.AxesHelper(2);
    // scene.add(worldAxis)
    render()
  })

  // BASE GEOMETRY
  let baseLoader = new GLTFLoader().setPath('../models/')
  baseLoader.load('base.glb', function (base) {
    base.scene.traverse(function (child) {
      if (child.isMesh) {
        child.material = bronzeMaterial
        child.material.depthWrite = !child.material.transparent
      }
    })

    base.scene.rotation.x = -Math.PI/2
    base.scene.rotation.z = -Math.PI


  // USERNAME + YEAR
  let fontLoader = new THREE.FontLoader()
  fontLoader.load('../fonts/helvetiker_regular.typeface.json', function (response) {
    font = response
    let textGroup = createText()

  // CONTRIBUTION BARS
  let barGroup = new THREE.Group()
  let x = 0
  let y = 0
  json.contributions.forEach(week => {
    y = (CUBE_SIZE * 7)
    week.days.forEach(day => {
      y -= CUBE_SIZE
      
      // Adjust height around distribution of values
      // Needed so that a large day doesn't blow out the scale
      let height = (0).toFixed(4)
      if (day.count === json.min)
      {
        height = MAX_HEIGHT * 0.1
      } else if (day.count > json.min && day.count <= json.p99)
      {
        height = ((MAX_HEIGHT * 0.1) + (((MAX_HEIGHT * 0.8) / json.p99) * day.count)).toFixed(4)
      }
      else if (day.count > json.p99)
      {
        height = ((MAX_HEIGHT * 0.9) + (((MAX_HEIGHT * 0.1) / json.max) * day.count)).toFixed(4)
      }

      let geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, height)
      let cube = new THREE.Mesh(geometry, bronzeMaterial)
      cube.position.x = x
      cube.position.y = y
      cube.position.z = BASE_HEIGHT / 2 + height / 2
      barGroup.add(cube)
    })
    x += CUBE_SIZE
  })

  let group = new THREE.Group()
  group.add(base.scene)
  group.add(barGroup)
  group.add(textGroup)

  const groupBox = new THREE.Box3().setFromObject(barGroup)
  const groupCenter = groupBox.getCenter(new THREE.Vector3())
  barGroup.position.x -= groupCenter.x
  barGroup.position.y -= groupCenter.y
  scene.add(group)
  group.rotateX(-Math.PI/2)
  
  })


  })

  const box = new THREE.Box3().setFromObject(scene)
  const center = box.getCenter(new THREE.Vector3())

  controls = new OrbitControls(camera, renderer.domElement)
  controls.screenSpacePanning = false;
  controls.minPolarAngle = Math.PI / 3
  controls.maxPolarAngle = Math.PI / 3;
  controls.addEventListener('change', render);
  controls.screenSpacePanning = true
  controls.enableDamping = true
  controls.enableZoom = false
  controls.dampingFactor = 0.1;

  camera.lookAt(center)
  controls.update()

  onWindowResize();

  var buttonExportASCII = document.getElementById( 'exportASCII' );
  buttonExportASCII.addEventListener( 'click', exportASCII );

  var buttonExportBinary = document.getElementById( 'exportBinary' );
  buttonExportBinary.addEventListener( 'click', exportBinary );

  // const axesHelper = new THREE.AxesHelper( 5 );
  // scene.add( axesHelper );

}

const render = () => {
  renderer.render(scene, camera)
}

function animate() {

  requestAnimationFrame( animate );

  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  render();

}

function exportASCII() {

  var result = exporter.parse( bronzeMaterial );
  saveString( result, username + '-' + year + '.stl' );

}

function exportBinary() {

  var result = exporter.parse( scene, { binary: true } );
  saveArrayBuffer( result, username + '-' + year + '.stl' );

}

//
// Event listeners
//
const onWindowResize = () => {
  let canvasWidth = window.innerWidth;
  let canvasHeight = window.innerHeight;
  renderer.setSize( canvasWidth, canvasHeight );
  camera.aspect = canvasWidth / canvasHeight;
  let position = Math.min(1000 / canvasWidth, 1000 / canvasHeight);
  camera.position.set(0, position, position)
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', onWindowResize, false)


var link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link );

function save( blob, filename ) {

  link.href = URL.createObjectURL( blob );
  link.download = filename;
  link.click();

}

function saveString( text, filename ) {

  save( new Blob( [ text ], { type: 'text/plain' } ), filename );

}

function saveArrayBuffer( buffer, filename ) {

  save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}
