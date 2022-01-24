var mouseMoved = true;
var mouse = {x: 0, y: 0};
var point = {x: 0, y: 0};
var arrow = {speed: 0.1, rotation: 0, x: -50, y: -50};
var ticker = null;

export class Draggable{

    constructor() {
        arrow = {speed: 0.1, rotation: 0, x: -50, y: -50}
        ticker = new Ticker();
        ticker.add(this.update);
    }

    detectMovment(event){
        mouse.x = event.x;
        mouse.y = event.y;  
        mouseMoved = true;            
    }

    update(delta) {
        if (mouseMoved) {      
            point = {
                x: (mouse.x / document.getElementById("workArea").offsetWidth) * 500,
                y: (mouse.y / document.getElementById("workArea").offsetHeight) * 500
            }        
            mouseMoved = false;
        }
        if (arrow.x !== point.x && arrow.y !== point.y) {                
            var dt = 1 - Math.pow(1 - arrow.speed, delta);                              
            arrow.x += (point.x - arrow.x) * dt;        
            arrow.y += (point.y - arrow.y) * dt;          
            var dx = point.x - arrow.x;
            var dy = point.y - arrow.y;                   
            arrow.rotation = Math.atan2(dy, dx);               
            if (Math.abs(dx) < 0.1)
                arrow.x = point.x;        
            if (Math.abs(dy) < 0.1)
                arrow.y = point.y; 
            if(document.querySelector(".car.active"))                      
                document.querySelector(".car.active").style.transform = `rotate(${arrow.rotation}rad)`;        
        }
    }
}

class Ticker {
  
    maxElapsedMS = 100;
    lastTime = -1;
    elapsedMS = -1;
    deltaTime = 1;
    speed = 1;
    listeners = [];
    started = false;
    
    constructor(fps = 60) {
      this.targetFPMS = fps / 1000;
    }
    
    add(listener) {
      this.listeners.push(listener);      
      if (this.listeners.length && !this.started) {
        this.started = true;
        requestAnimationFrame(this.update);
      }
    }
    
    update = (currentTime = performance.now()) => {      
      this.elapsedMS = currentTime - this.lastTime;    
      this.deltaTime = this.elapsedMS * this.targetFPMS * this.speed;  
      if (this.elapsedMS > this.maxElapsedMS) {
        this.elapsedMS = this.maxElapsedMS;
      }    
      for (let listener of this.listeners) {
        listener(this.deltaTime);
      }         
      this.lastTime = currentTime;    
      requestAnimationFrame(this.update);
    }
}


function start() {
    var scene = new THREE.Scene();
    var workArea = document.getElementById("workArea");
    var canvReference = document.getElementById("mapCanvas");
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    var renderer = new THREE.WebGLRenderer({
        antialias:true,
        canvas: canvReference
    });
    renderer.setSize( workArea.offsetWidth, workArea.offsetHeight );
    document.body.appendChild( renderer.domElement );

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
    //scene.add( cube );

    const loader = new GLTFLoader();        

    /*loader.load( 'models/ball/scene.gltf', function ( gltf ) {
        scene.add( gltf.scene );
    }, undefined, function ( error ) {        
        console.error( error );        
    } );*/

    // Load a glTF resource
    loader.load(
      // resource URL
      'models/cars/octane/scene.gltf',
      // called when the resource is loaded
      function ( gltf ) {

          scene.add( gltf.scene );
          console.log(gltf)
          gltf.animations; // Array<THREE.AnimationClip>
          gltf.scene; // THREE.Group
          gltf.scenes; // Array<THREE.Group>
          gltf.cameras; // Array<THREE.Camera>
          gltf.asset; // Object

      },
      // called while loading is progressing
      function ( xhr ) {
          console.log(xhr);
          console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

      },
      // called when loading has errors
      function ( error ) {

          console.log( 'An error happened' );

      }
  );
  

  camera.position.z = 5;

  var animate = function () {
      requestAnimationFrame( animate );

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render( scene, camera );
  };

  animate();

  document.getElementById("workArea").appendChild(canvReference)
  canvReference.style = ""
}