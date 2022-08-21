import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'

import nebula from '../img/nebula.jpg'
import stars from '../img/stars.jpg'

const monkeyUrl = new URL('../model/monkey.glb', import.meta.url)

const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

renderer.shadowMap.enabled = true

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  45, 
  window.innerWidth/window.innerHeight,
  1,
  1000
)
camera.position.set(-10,30,30)

const orbit = new OrbitControls(camera, renderer.domElement)
orbit.update()

const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

const boxGeometry = new THREE.BoxGeometry()
const boxMaterial = new THREE.MeshBasicMaterial({ color : 0x00FF00 })
const box = new THREE.Mesh(boxGeometry,boxMaterial)
scene.add(box)

const planeGeometry = new THREE.PlaneGeometry(30,30)
const planeMaterial = new THREE.MeshStandardMaterial({ color : 0xFFFFFF, side: THREE.DoubleSide })
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(plane)
plane.rotation.x = -.5 * Math.PI
plane.receiveShadow = true

const sphereGeometry = new THREE.SphereGeometry(4, 50, 50)
const sphereMaterial = new THREE.MeshStandardMaterial({ color : 0x0000FF })
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
scene.add(sphere)
sphere.position.set(-10, 10, 0)
sphere.castShadow = true

const gridHelper = new THREE.GridHelper(30)
scene.add(gridHelper)

const gui = new dat.GUI()

// const fog = new THREE.Fog(0xFFFFFF, 0, 200)
// scene.fog = fog
scene.fog = new THREE.FogExp2(0xFFFFFF, .01)
//renderer.setClearColor(0xFFEA00)

const textureLoader = new THREE.TextureLoader()
// scene.background = textureLoader.load(stars)
const cubeTextureLoader = new THREE.CubeTextureLoader()
scene.background = cubeTextureLoader.load([
  nebula,
  nebula,
  stars,
  stars,
  stars,
  stars,
])

const box2Geometry = new THREE.BoxGeometry(4,4,4)
const box2Material = new THREE.MeshBasicMaterial({ 
  //color : 0x00FF00, 
  // map: 
})
const box2MultiMaterial = [
  new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
  new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
  new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
  new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
  new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
  new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
]

const box2 = new THREE.Mesh(box2Geometry,box2MultiMaterial)
scene.add(box2)
box2.position.set(0,15,10)
box2.material.map = textureLoader.load(nebula)

const plane2Geometery = new THREE.PlaneGeometry(10,10,10,10)
const plane2Material = new THREE.MeshBasicMaterial({
  color : 0xFFFFFF,
  wireframe : true
})
const plane2 = new THREE.Mesh(plane2Geometery, plane2Material)
scene.add(plane2)
plane2.position.set(10,10,15)

plane2.geometry.attributes.position.array[0] -= 10 * Math.random() 
plane2.geometry.attributes.position.array[1] -= 10 * Math.random() 
plane2.geometry.attributes.position.array[2] -= 10 * Math.random() 

const ambientLight = new THREE.AmbientLight(0x333333)
scene.add(ambientLight)

// const vShader = `
//   void main(){
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)
//   }
// `

// const fShader = `
//   void main(){
//     gl_FragColor = vec4(.5,.5,1,1)
//   }
// `

const sphere2Geometry = new THREE.SphereGeometry(4)
const sphere2Material = new THREE.ShaderMaterial({
  vertexShader: document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent,
})

const sphere2 = new THREE.Mesh(sphere2Geometry,sphere2Material)
scene.add(sphere2)
sphere2.position.set(-5,10,10)

const assetLoader = new GLTFLoader()
assetLoader.load(monkeyUrl.href, (gltf)=>{
  const model = gltf.scene
  scene.add(model)
  model.position.set(-12,4,10)
}, undefined, function(error){
  console.log(error, " Model failed to load")
})

// const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8)
// scene.add(directionalLight)
// directionalLight.position.set(-30,50,0)
// directionalLight.castShadow = true
// directionalLight.shadow.camera.bottom = -12

// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(dLightShadowHelper)

// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5)
// scene.add(dLightHelper)

const spotlight = new THREE.SpotLight(0xFFFFFF)
scene.add(spotlight)
spotlight.position.set(-100,100,0)

const spotlightHelper = new THREE.SpotLightHelper(spotlight)
// scene.add(spotlightHelper)
spotlight.castShadow = true
spotlight.angle = .2

const options = {
  sphereColor : '#ffea00',
  wireframe: false,
  speed: 0.01,
  angle: .2,
  penumbra: 0,
  intensity: 1
}

gui.addColor(options, 'sphereColor').onChange((e)=>{
  sphere.material.color.set(e)
})

gui.add(options, 'wireframe').onChange((e)=>{
  sphere.material.wireframe = e
})

gui.add(options, 'speed', 0, 0.1)
gui.add(options, 'angle', 0, 1)
gui.add(options, 'penumbra', 0, 1)
gui.add(options, 'intensity', 0, 1)

let step = 0

const mousePosition = new THREE.Vector2()
window.addEventListener('mousemove', function(e){
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
  mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1
})

const sphereId = sphere.id
const rayCaster = new THREE.Raycaster()

box2.name = "box2"

function animate(time){

  step += options.speed
  sphere.position.y = 10 * Math.abs(Math.sin(step))

  spotlight.angle = options.angle
  spotlight.penumbra = options.penumbra
  spotlight.intensity = options.intensity
  spotlightHelper.update()

  rayCaster.setFromCamera(mousePosition, camera)
  const intersects = rayCaster.intersectObjects(scene.children)
  
  for (let i = 0; i < intersects.length; i++) {

    const s = intersects[i]

    if(s.object.id === sphereId)
      s.object.material.color.set(0xFF0000)

    if(s.object.name === "box2"){
      s.object.rotation.x = time / 1000
      s.object.rotation.y = time / 1000
    }
      
  }

  plane2.geometry.attributes.position.array[0] = 10 * Math.random()
  plane2.geometry.attributes.position.array[1] = 10 * Math.random()
  plane2.geometry.attributes.position.array[2] = 10 * Math.random()
  plane2.geometry.attributes.position.needsUpdate = true

  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})