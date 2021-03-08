// @flow
import {layerIdentifier} from './layer_identifier';
import {extend, clone} from '../../../dependencies.js';
import {local_point as LocalPoint} from '@innerpeacer/map-entity-base';
import {MercatorCoordinate} from '../../config/inherit';
import {IPMap} from '../../map/map';

let defaultCustomLayer = {
    'type': 'custom',
    'renderingMode': '3d'
};

class custom_model_layer {
    THREE: Object;

    name: string;
    modelLayerID: string;
    modelLayer: Object;

    map: IPMap | any;
    camera: Object;
    scene: Object;
    renderer: Object;

    gltf: Object;
    modelTransform: Object;
    modelOrigin: Object;

    constructor(name: string, options: Object) {
        this.name = name;

        let modelLayerID = layerIdentifier(name, 'circle');
        this.modelLayerID = modelLayerID;

        this.THREE = options.THREE;
        this.modelLayer = extend({id: modelLayerID}, clone(defaultCustomLayer));
    }

    addToMap(map: IPMap) {
        this.map = map;

        let THREE = this.THREE;
        this.modelLayer.onAdd = (map, gl) => {
            this.camera = new THREE.Camera();
            this.scene = new THREE.Scene();

            let directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
            directionalLight.position.set(0.75, 0.75, 1.0).normalize();
            this.scene.add(directionalLight);

            const ambientLight = new THREE.AmbientLight(0xcccccc, 0.8);
            this.scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0xffffff, 0.8);
            this.scene.add(pointLight);

            this.renderer = new THREE.WebGLRenderer({
                canvas: map.getCanvas(),
                context: gl,
                antialias: true
            });
            this.renderer.autoClear = false;
        };

        this.modelLayer.render = (gl, matrix) => {
            if (!this.gltf) return;

            let rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
            let m = new THREE.Matrix4().fromArray(matrix);
            let l = new THREE.Matrix4().makeTranslation(this.modelTransform.translateX, this.modelTransform.translateY, this.modelTransform.translateZ)
                .scale(new THREE.Vector3(this.modelTransform.scale, -this.modelTransform.scale, this.modelTransform.scale))
                .multiply(rotationX);

            this.camera.projectionMatrix = m.multiply(l);
            this.renderer.state.reset();
            this.renderer.render(this.scene, this.camera);
        };

        let lastID = map.getLastLayerID('extrusion');
        let nextOf = map.getNextLayerID(lastID);
        map.addLayer(this.modelLayer, nextOf);
    }

    removeFromMap() {
        this.map.removeLayer(this.modelLayerID);
        this.map = null;
        this.gltf = null;
    }

    loadModel(params: Object) {
        // console.log('loadModel');
        let url = params.url;
        let modelOrigin = this.modelOrigin = LocalPoint.fromXY(params.origin);
        let modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(modelOrigin.getCoord());
        const latRad = modelOrigin.lat / 180 * Math.PI;
        this.modelTransform = {
            translateX: modelAsMercatorCoordinate.x,
            translateY: modelAsMercatorCoordinate.y,
            translateZ: modelAsMercatorCoordinate.z,
            scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits() * Math.cos(latRad)
        };

        let THREE = this.THREE;
        let loader = new THREE.GLTFLoader();
        loader.load(
            url,
            (gltf) => {
                this.scene.add(gltf.scene);
                this.gltf = gltf;
            }
        );
    }

    show() {
        this.updateModelLayerVisible(true);
    }

    hide() {
        this.updateModelLayerVisible(false);
    }

    updateModelLayerVisible(isVisible: boolean) {
        this.map.setLayoutProperty(this.modelLayerID, 'visibility', !!isVisible ? 'visible' : 'none');
    }
}

export {custom_model_layer};
