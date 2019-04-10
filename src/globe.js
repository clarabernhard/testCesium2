"use strict";

// Créer un object globe qui pertmet de manipuler cesium plus simplement
class Globe {

  constructor(elementId, geocoder, link){

    // Créer le globe dans la div HTML qui a l'id cesiumContainer
    this.viewer = new Cesium.Viewer(elementId, {
      geocoder: geocoder,
    });

    // insère les logos en bas
    this.viewer.bottomContainer.innerHTML = '<img src="src/img/logo/logo-strasbourg.png" alt="Logo strasbourg" />\
    <img src="src/img/logo/europe-sengage.jpg" alt="Logo strasbourg" />\
    <img src="src/img/logo/logo-ue.jpg" alt="Logo strasbourg" />';

    this.coordsMouseMoveEvent = undefined;

    this.hoverHandler = undefined;
    this.clickHandler = undefined;

    /*var elevation = new Cesium.WebMapServiceImageryProvider({
    url : 'http://wxs.ign.fr/pvwmk1wgxoei8orp7rd1re78/geoportail/r/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap',
    layer : 'ELEVATION.ELEVATIONGRIDCOVERAGE',
    parameters : {
    crossOrigin: '0'
  }
});
this.viewer.imageryLayers.addImageryProvider(elevation);*/
}

// définit le zoom par défaut
setHome(tileset){
  this.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-35), 1750));

  // Définir ce qu'il se passe lorsqu'on clique sur le bouton "maison"
  this.viewer.homeButton.viewModel.command.beforeExecute.addEventListener((e) => {
    e.cancel = true;

    // Quand on clique on "vole" à l'endroit où est le photo maillage
    this.viewer.flyTo(tileset, {
      offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-35), 1750)
    });
  });
}

load3DTiles(link, options = {}){
  // Chargement du photo maillage au format 3D tiles
  let tileset = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url : link, // URL vers le ficher JSON "racine"
    maximumScreenSpaceError : 1,
    maximumNumberOfLoadedTiles : 1000 // Nombre maximum de dalles chargées simultanément
  }));

  return tileset.readyPromise;
}

loadKml(link, options = {}){
  // Chargement du fichier KML (les points avec leurs descriptions)
  let promisse = Cesium.KmlDataSource.load(link);
  promisse.then((dataSource) => {
    this.viewer.dataSources.add(dataSource);
  });
  return promisse;
}

loadGeoJson(link, options = {}){
  let promisse = Cesium.GeoJsonDataSource.load(link, {clampToGround : true});
  promisse.then((dataSource) => {

    this.viewer.dataSources.add(dataSource);

    if(options.classification && options.classificationField !== undefined){
      // Get the array of entities
      let entities = dataSource.entities.values;

      if(options.colors != undefined){
        Object.keys(options.colors).forEach(function(c){
          options.colors[c] = Cesium.Color.fromCssColorString(options.colors[c]);
          options.colors[c].alpha = options.alpha || 0.8;
        })
      }

      let colors = options.colors || {};

      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];

        if (Cesium.defined(entity.polygon)) {
          let color = colors[entity.properties[options.classificationField]];
          if(!color){
            color = Cesium.Color.fromRandom({ alpha : options.alpha || 0.8 });
            colors[entity.properties[options.classificationField]] = color;
          }

          entity.polygon.material = color;
          entity.polygon.classificationType = Cesium.ClassificationType.CESIUM_3D_TILE;
        }
      }
    }
  });

  return promisse;
}

// Fonction pour afficher les ombres
shadow(enabled){
  this.viewer.shadows = enabled;
}

setCoordsCallback(callback){
  if(callback === undefined && this.coordsMouseMoveEvent !== undefined){
    this.coordsMouseMoveEvent.destroy();
    this.coordsMouseMoveEvent = undefined;

    return;
  }

  if(callback !== undefined && this.coordsMouseMoveEvent !== undefined){
    this.coordsMouseMoveEvent.destroy();
  }

  this.coordsMouseMoveEvent = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

  this.coordsMouseMoveEvent.setInputAction((movement) => {
    let scene = this.viewer.scene;
    if (scene.mode !== Cesium.SceneMode.MORPHING) {
      let pickedObject = scene.pick(movement.endPosition);

      if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
        let cartesian = this.viewer.scene.pickPosition(movement.endPosition);

        if (Cesium.defined(cartesian)) {
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          let longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5);
          let latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5);
          let heightString = cartographic.height.toFixed(2);

          callback(longitudeString, latitudeString, heightString);
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

// Fonction qui permet de gérer les mouvements du plan de coupe
planeUpdate(plane) {

  var targetY = 0.0;
  var selectedPlane;
  var scene = this.viewer.scene;

  // Select plane when mouse down
  var downHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
  downHandler.setInputAction(function(movement) {
    var pickedObject = scene.pick(movement.position);
    if (Cesium.defined(pickedObject) &&
    Cesium.defined(pickedObject.id) &&
    Cesium.defined(pickedObject.id.plane)) {
      selectedPlane = pickedObject.id.plane;
      selectedPlane.material = Cesium.Color.WHITE.withAlpha(0.4);
      selectedPlane.outlineColor = Cesium.Color.WHITE;
      scene.screenSpaceCameraController.enableInputs = false;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  // Release plane on mouse up
  var upHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
  upHandler.setInputAction(function() {
    if (Cesium.defined(selectedPlane)) {
      selectedPlane.material = Cesium.Color.WHITE.withAlpha(0.4);
      selectedPlane.outlineColor = Cesium.Color.WHITE;
      selectedPlane = undefined;
    }
    scene.screenSpaceCameraController.enableInputs = true;
  }, Cesium.ScreenSpaceEventType.LEFT_UP);

  // Update plane on mouse move
  var moveHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
  moveHandler.setInputAction(function(movement) {
    if (Cesium.defined(selectedPlane)) {
      var deltaY = movement.startPosition.y - movement.endPosition.y;
      targetY += deltaY;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  return function () {
    plane.distance = targetY;
    return plane;
  };
}

// Afficher ou enlever le plan de coupe
addClippingPlanes(tileset, show) {

  var planeEntities = [];
  var clippingPlanes = new Cesium.ClippingPlaneCollection({
    planes : [
      new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 0.0)
    ],
  });

  if(show) {
    for (var i = 0; i < clippingPlanes.length; ++i) {
      var plane = clippingPlanes.get(i);
      var planeEntity = this.viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(7.754114, 48.584783, 260),
        plane : {
          dimensions : new Cesium.Cartesian2(2800, 1800),
          material : Cesium.Color.WHITE.withAlpha(0.4),
          plane : new Cesium.CallbackProperty(this.planeUpdate(plane), false),
          outline : true,
          outlineColor : Cesium.Color.WHITE
        }
      });

      planeEntities.push(planeEntity);
    }
  } else {
    this.viewer.entities.removeAll();
    planeEntities = [];
  }

}

//outil construction
createPoint(worldPosition) {
    var point = this.viewer.entities.add({
        position : worldPosition,
        point : {
            color : Cesium.Color.WHITE,
            pixelSize : 5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
    });
    return point;
}

drawLine(positionData) {
  var shape = this.viewer.entities.add({
    polyline : {
      positions : positionData,
      clampToGround : true,
      width : 3
    }
  });
}

drawPolygon(positionData) {
  var shape = this.viewer.entities.add({
    polygon: {
      hierarchy: positionData,
      material: new Cesium.ColorMaterialProperty(Cesium.Color.WHITE.withAlpha(0.7))
    }
  });
}

updateLine() {
var activeShapePoints = [];
var activeShape;
var floatingPoint;
var scene = this.viewer.scene;

var handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
handler.setInputAction(function(event) {

    // We use `viewer.scene.pickPosition` here instead of `viewer.camera.pickEllipsoid` so that
    // we get the correct point when mousing over terrain.
    var earthPosition = scene.pickPosition(event.position);
    // `earthPosition` will be undefined if our mouse is not over the globe.
    if (Cesium.defined(earthPosition)) {
        if (activeShapePoints.length === 0) {
            floatingPoint = this.createPoint(earthPosition);
            activeShapePoints.push(earthPosition);
            var dynamicPositions = new Cesium.CallbackProperty(function () {
                return activeShapePoints;
            }, false);
            activeShape = this.drawLine(dynamicPositions);
        }
        activeShapePoints.push(earthPosition);
        this.createPoint(earthPosition);
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

handler.setInputAction(function(event) {
    if (Cesium.defined(floatingPoint)) {
        var newPosition = scene.pickPosition(event.endPosition);
        if (Cesium.defined(newPosition)) {
            floatingPoint.position.setValue(newPosition);
            activeShapePoints.pop();
            activeShapePoints.push(newPosition);
        }
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

handler.setInputAction(function(event) {
  activeShapePoints.pop();
  this.drawLine(activeShapePoints);
  this.viewer.entities.remove(floatingPoint);
  this.viewer.entities.remove(activeShape);
  floatingPoint = undefined;
  activeShape = undefined;
  activeShapePoints = [];
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);


}


}
