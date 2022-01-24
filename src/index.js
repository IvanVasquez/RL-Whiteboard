import "./css/styles.css"
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import RLWhiteboard from "./js/whiteboard"
import Whiteboard3D from "./js/whiteboard3d"
import * as THREE from 'three'

if (window._rlwb) 
	console.error("A variable _rlwb has already been declared");
else {
	window._rlwb = new RLWhiteboard();
	//window._rlwb.start();
}

if(window._wb3d)
	console.error("A variable _rlwb3d has already been declared");
else {
	window._wb3d = new Whiteboard3D();
	_wb3d.init();
	_wb3d.animate();

	
	//window._wb3d.start();
}