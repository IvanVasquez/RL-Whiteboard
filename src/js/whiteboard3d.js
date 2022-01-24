import * as THREE from 'three';
import { OrbitControls, MapControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class Whiteboard3D {

    constructor(fov = 45, camera, scene, controls, renderer, loader) {        
        this.camera = camera;
        this.scene = scene;
        this.controls = controls;
        this.renderer = renderer;
        this.loader = loader;
              
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.workArea = document.getElementById("workArea");
        this.canvReference = document.getElementById("mapCanvas");  
        this._CANVAS = {
            models: [],
            draggables: [],
            camera: {
                fov: fov,
                minDistance: 250,
                maxDistance: 500,
                x: 0,
                y: 500,
                z: 0,
            },
            drawing: {
                active: false,
                points: []
            }   
        }      
        this._RL_OPTIONS = {
            ball: {
                list: [
                    //{name: 'Default', folder: 'ball', fileName: 'scene.gltf', scale: {x: 1, y: 0.5, z: 1}}
                ],
                path: 'models/balls/',
            },
            car: {                
                list: [
                    {name: 'Octane', folder: 'octane', fileName: 'scene.gltf', scale: {x: 0.15, y: 0.25, z: 0.25}},
                    {name: 'Dominus', folder: 'dominus', fileName: 'scene.gltf', scale: {x: 0.15, y: 0.25, z: 0.25}},
                    {name: 'Fennec', folder: 'fennec', fileName: 'scene.gltf', scale: {x: 0.15, y: 0.25, z: 0.25}}
                ],
                path: 'models/cars/',
            },
        };
    }

    async init() {
        let _this = this;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(this._CANVAS.camera.fov, 1, 1, 10000);        
        //this.camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 1, 1000)        
        this.camera.position.set(this._CANVAS.camera.x, this._CANVAS.camera.y, this._CANVAS.camera.z);
        this.camera.up.set(0, 0, -1);        
        this.camera.lookAt(0, 0, 0);
        this.scene.add(this.camera);

        
        this.renderer = new THREE.WebGLRenderer({canvas: this.canvReference , antialias: true});
        this.renderer.setSize(this.workArea.offsetWidth, this.workArea.offsetHeight);
        this.renderer.setClearColor(0xEEEEEE);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        this.workArea.appendChild(this.renderer.domElement);
        this.canvReference.style = "";
        
        
        var hemisphereLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        this.scene.add( hemisphereLight );
        
        const ambientLight = new THREE.AmbientLight( 0x020202  ); 
        this.scene.add(ambientLight);
        
        var dirLight = new THREE.DirectionalLight( 0xffffff );
        //dirLight.position.set( 0, 50, 0 );
        dirLight.position.set(50, 50, 50)
        dirLight.castShadow = true;
        dirLight.shadow.camera.near = 1;
        dirLight.shadow.camera.far = 4000;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        this.scene.add( dirLight );
        
        /*
        const light = new THREE.SpotLight( 0xffffff, 1.5 );
        light.position.set( 0, 1000, 0 );
        light.angle = Math.PI / 9;
        
        light.castShadow = true;
        light.shadow.camera.near = 1000;
        light.shadow.camera.far = 4000;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        
        this.scene.add( light );
         */
        
        this.loader = new GLTFLoader();
        
        const draggables = await this.loadModels();
        const dragControls = new DragControls( [ ... draggables ], _this.camera, _this.renderer.domElement );
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.enableRotate = false;               
        this.controls.minDistance = this._CANVAS.camera.minDistance;
        this.controls.maxDistance = this._CANVAS.camera.maxDistance;

        dragControls.addEventListener('dragstart', () => _this.controls.enabled = false);
		dragControls.addEventListener('dragend', () => _this.controls.enabled = true);
        window.addEventListener('mousedown', () => {
            if(_this.controls.enabled){
                this._CANVAS.drawing.active = true
                this._CANVAS.drawing.points = [];
            }
        });
        const material = new LineMaterial( { color: 0x00ffff, linewidth: 5 } );
        this.canvReference.addEventListener('mousemove', (event) => {
            if(this._CANVAS.drawing.active){
                const canvas = this.canvReference;
               /* var vectorMouse = new THREE.Vector3(
                    -(canvas.offsetWidth/2-event.clientX)*2/canvas.offsetWidth,
                    (canvas.offsetHeight/2-event.clientY)*2/canvas.offsetHeight,
                    -1/Math.tan((this._CANVAS.camera.fov / 2)*Math.PI/180)); */
                    console.log(-(canvas.offsetWidth/2-event.clientX)*2/canvas.offsetWidth)
                let x = (event.offsetX / (canvas.offsetWidth / 2) - 1) * 207;
                let z = (event.offsetY / (canvas.offsetHeight / 2) - 1) * 207;
                var vectorMouse = new THREE.Vector3(x, 1, z)
                console.log(this._CANVAS.drawing.points);
                this._CANVAS.drawing.points.push(x, 1, z);
                //console.log(vectorMouse)
            }
        });
        window.addEventListener('mouseup', (event) => {
            this._CANVAS.drawing.active = false;           
            console.log("end drawing");
            const geometry = new LineGeometry();
            geometry.setPositions( this._CANVAS.drawing.points );
            //geometry.setColors( colors );
            let line = new Line2( geometry, material );
            line.computeLineDistances();
            line.scale.set( 1, 1, 1 );
            scene.add( line );
        })
        window.addEventListener('resize', this.onWindowResize, false);        
        
    }      
    
    onClick( event ) {
        event.preventDefault();
        super.render();

    }
    
    async loadModels() {   
        var _this = this;
        
        let ang_rad = this._CANVAS.camera.fov * Math.PI / 180;
        let fov_y = this._CANVAS.camera.y * Math.tan(ang_rad / 2) * 2;        
        var map = new THREE.TextureLoader().load( "./img/dfh-stadium.png" );
        var geometry = new THREE.PlaneGeometry(fov_y, fov_y);
        var material = new THREE.MeshBasicMaterial( { map, opacity : 1, side : THREE.DoubleSide, transparent : true } );        
        var floor = new THREE.Mesh( geometry, material );
        material.map.flipY = false;
        map.receiveShadow = true;
        floor.receiveShadow = true;
        floor.rotation.x = (90 * Math.PI / 180);        
        _this.scene.add( floor );     

       /* this._RL_OPTIONS.ball.list.forEach((ball) => {
            _this.loader.load(this._RL_OPTIONS.ball.path + ball.folder + "/" + ball.fileName, (gltf) => {
                gltf.scene.traverse( child => {
                    if ( child.material ) child.material.metalness = 0;            
                } );
                //_this._RL_OPTIONS.models.balls.push(gltf.scene);
                           
            }, undefined, (error) => console.log(error));
        });*/
        var position = -1;
        /*this._RL_OPTIONS.car.list.forEach((car) => {
            _this.loader.load(this._RL_OPTIONS.car.path + car.folder + "/" + car.fileName, (gltf) => {                        
                gltf.scene.traverse( child => {                    
                    if(child.material) child.material.metalness = 0;
                    if(child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                } );
                if(child.material.name.indexOf('_Body') != -1){
                    child.material.color.setHex(0xff0000)
                }
                _this.scene.add(gltf.scene);     
                console.log(gltf.scene.rotation)
                //gltf.scene.position.z = position++ * 100
                gltf.scene.position.y = (1 + position++) * 75;                
                _this._RL_OPTIONS.models.cars.push(gltf.scene);
            }, undefined, (error) => console.log(error));
        });     */
        await Promise.all(this._RL_OPTIONS.ball.list.map(async (ball) => {
            let group = await this.addBallIntoScene(ball);
            _this.scene.add(group);            
        }));
        await Promise.all(this._RL_OPTIONS.car.list.map(async (car) => {
            let group = await this.addCarIntoScene(car);
            _this.scene.add(group);            
        }));
        return this._CANVAS.draggables;
    }

    drawBox(width, height, depth){
        let geometry, material, box;
        geometry = new THREE.BoxGeometry(width, height, depth);
        material = new THREE.MeshBasicMaterial({color: 0xffff00, transparent: true, opacity: 0, depthTest:false});
        box = new THREE.Mesh(geometry, material);
        this._CANVAS.draggables.push(box);
        box.position.set(0, 0, 0);
        return box;
    }

    async addBallIntoScene(ball){ 
        const gltf = await this._modelLoader(this._RL_OPTIONS.ball.path + ball.folder + "/" + ball.fileName);
        return this.createDraggableBox(gltf, ball);
    }

    async addCarIntoScene(car){         
        const gltf = await this._modelLoader(this._RL_OPTIONS.car.path + car.folder + "/" + car.fileName);
         gltf.scene.traverse( child => {                    
            if(child.material) child.material.metalness = 0;
            if(child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        return this.createDraggableBox(gltf, car);       
    }

    createDraggableBox(gltf, object) {        
        let group = new THREE.Group();
        let mesh = gltf.scene;  
        mesh.scale.set(object.scale.x, object.scale.y, object.scale.z);
        let gltfbox = new THREE.Box3().setFromObject(mesh);
        let gltfsize = gltfbox.getSize(mesh.position);        
        let width = Math.floor(gltfsize.x) + parseInt(2);
        let height = Math.floor(gltfsize.y) + parseInt(2);
        let depth = Math.floor(gltfsize.z) + parseInt(1);
        mesh.position.set(0, -height/2, 0);        
        let box  = this.drawBox(width, height, depth); 
        box.position.set(0, height/2, 0);
        group.add(box);              
        group.name = object.name;
        box.add(mesh);
        return group;
    }

    _modelLoader(url) {
        return new Promise((resolve, reject) => {
          this.loader.load(url, data => resolve(data), null, reject);
        });
      }
    
    animate(){
        requestAnimationFrame( this.animate.bind(this) );
        this.render();        
        //this.controls.update();
    }    
    
    render(){
        this.renderer.render( this.scene, this.camera );        
    }
    
    onWindowResize() {
        //this.camera.aspect = this.workArea.offsetWidth / this.workArea.offsetHeight;
        //this.camera.updateProjectionMatrix();
        this.renderer.setSize( this.workArea.offsetWidth, this.workArea.offsetHeight );
    }

}

export default Whiteboard3D;