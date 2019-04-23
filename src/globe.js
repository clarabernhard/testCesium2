"use strict";

// Créer un object globe qui pertmet de manipuler cesium plus simplement
class Globe {

  constructor(elementId, geocoder, link){

    // Créer le globe dans la div HTML qui a l'id cesiumContainer
    this.viewer = new Cesium.Viewer(elementId, {
      geocoder: geocoder,
      selectionIndicator: false
    });

    this.raf09 = undefined;
    new Raf09('../Cesium/data/RAF09.mnt', (raf090) => {
      this.raf09 = raf090;
    });

    // insère les logos en bas
    this.viewer.bottomContainer.innerHTML = '<img src="src/img/logo/logo-strasbourg.png" alt="Logo strasbourg" />\
    <img src="src/img/logo/europe-sengage.jpg" alt="Logo strasbourg" />\
    <img src="src/img/logo/logo-ue.jpg" alt="Logo strasbourg" />';

    // variable qui stocke les évenements liés à la souris
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

    // Légendes qui s'affichent au clic
    this.aideCheckbox = document.querySelector('#aide');
    this.distanceList = document.querySelector('#distanceList');
    this.aireList = document.querySelector('#aireList');
    this.planList = document.querySelector('#planList');
    this.coordsList = document.querySelector('#coordsList');
    this.constructionList = document.querySelector('#constructionList');

    // Boite à outils mesures coords
    this.coordX = document.querySelector('#coordX');
    this.coordY = document.querySelector('#coordY');
    this.coordZ = document.querySelector('#coordZ');

    // mesures de distance
    this.distance = document.querySelector('#distance');
    this.hauteur = document.querySelector('#hauteur');

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

// récupérer lat/lon/hauteur à chaque clic gauche
setCoordsCallback(callback){
  let scene = this.viewer.scene;

  this.handler.setInputAction(function(event) {

    let cartesian = scene.pickPosition(event.position);

    if (Cesium.defined(cartesian)) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      let longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);
      let latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);
      let heightString = cartographic.height.toFixed(3);
      callback(longitudeString, latitudeString, heightString);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

// Convertit les lat/lon/hauteur en CC48 / IGN69 et les affiche
showCoords(show){
  this.setCoordsCallback((longitude, latitude, hauteur) => { // Fonction éxécutée à chaque clic

    var coords = proj4('EPSG:4326','EPSG:3948', [longitude, latitude]);
    this.coordX.innerHTML = coords[0].toFixed(4);
    this.coordY.innerHTML = coords[1].toFixed(4);
    this.coordZ.innerHTML = (Number(hauteur) - Number(this.raf09.getGeoide(latitude, longitude))).toFixed(3);

  });
  if(show){
    this.coordsList.classList.remove('hidden');
  } else{
    this.coordsList.classList.add('hidden');
    this.setCoordsCallback(undefined);
  }
}

/*legende(){
  this.planList.classList.remove('hidden');

  // interactivité du plan de coupe
  var X = parseFloat(document.getElementById('#X').value);
  var Y = parseFloat(document.getElementById('#Y').value);
  var hauteurCoupe = parseFloat(document.getElementById('#hauteurcoupe').value);
  var longueurCoupe = parseFloat(document.getElementById('#longueurcoupe').value);
  var largeurCoupe = parseFloat(document.getElementById('#largeurcoupe').value);

  console.log(X, Y, hauteurCoupe, longueurCoupe, largeurCoupe);

}*/

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
          dimensions : new Cesium.Cartesian2(200, 200),
          material : Cesium.Color.WHITE.withAlpha(0.4),
          plane : new Cesium.CallbackProperty(this.planeUpdate(plane), false),
          outline : true,
          outlineColor : Cesium.Color.WHITE
        }
      });

      planeEntities.push(planeEntity);
    }

  } else {
    this.planList.classList.add('hidden');
    for (var i = 0; i < planeEntities.length; ++i) {
      this.viewer.entities.remove(planeEntities[i]);
    }
    planeEntities = [];

  }

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

//outil construction
createPoint(worldPosition) {
  this.cartographic = Cesium.Cartographic.fromCartesian(worldPosition);
  this.longitude = Cesium.Math.toDegrees(this.cartographic.longitude).toFixed(7);
  this.latitude = Cesium.Math.toDegrees(this.cartographic.latitude).toFixed(7);
  this.height = this.cartographic.height.toFixed(3);
  var point = this.viewer.entities.add({
    position : worldPosition,
    point : {
      color : Cesium.Color.ORANGE,
      pixelSize : 5,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
    }
  });
  return point;
}

drawLine(positionData) {
  var shape = this.viewer.entities.add({
    polyline : {
      positions : positionData,
      material : Cesium.Color.fromCssColorString('#2DC9ED'),
      clampToGround : true,
      width : 3
    }
  });
  return shape;
}

drawPolygon(positionData) {
  var shape = this.viewer.entities.add({
    polygon: {
      hierarchy: positionData,
      material : Cesium.Color.fromCssColorString('rgba(183,246,243,0.5)')
    }
  });
  return shape;
}

updateShape(choice, choice2, show) {
  var activeShapePoints = [];
  var activeShape;
  var floatingPoint;
  var scene = this.viewer.scene;
  this.handler.globe = this;

  if(show) {
    //this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.setInputAction(function(event) {
      var earthPosition = scene.pickPosition(event.position);
      if(Cesium.defined(earthPosition)) {
        if(activeShapePoints.length === 0) {
          floatingPoint = globe.createPoint(earthPosition);
          // on ajoute 2 fois un point au début pour permettre l'affichage de la ligne/surface
          // le dernier point correspond au point flottant du mouvement de la souris
          activeShapePoints.push(earthPosition);
          activeShapePoints.push(earthPosition);
          var dynamicPositions = new Cesium.CallbackProperty(function () {
            return activeShapePoints;
          }, false);
          if(choice === 'point') {
            activeShape = globe.createPoint(dynamicPositions);
          } else if(choice === 'line') {
            activeShape = globe.drawLine(dynamicPositions);
          } else if(choice === 'polygon') {
            activeShape = globe.drawPolygon(dynamicPositions);
          }
        }
        else {
          activeShapePoints.push(earthPosition);
          globe.createPoint(earthPosition);
        }

      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.handler.setInputAction(function(event) {
      if(Cesium.defined(floatingPoint)) {
        var newPosition = scene.pickPosition(event.endPosition);
        if (Cesium.defined(newPosition)) {
          floatingPoint.position.setValue(newPosition);
          activeShapePoints.pop();
          activeShapePoints.push(newPosition);
        }
      }
      if(choice2 === 'mesure') {
        globe.measureDistance(activeShapePoints);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.handler.setInputAction(function(event) {
      // on supprime le dernier point flottant
      activeShapePoints.pop();
      if(choice === 'point') {
        globe.createPoint(activeShapePoints);
      } else if(choice === 'line') {
        globe.drawLine(activeShapePoints);
      } else if( choice === 'polygon') {
        globe.drawPolygon(activeShapePoints);
      }
      globe.viewer.entities.remove(floatingPoint);
      globe.viewer.entities.remove(activeShape);
      floatingPoint = undefined;
      activeShape = undefined;

      if(choice2 === 'construction'){
        // garder les activeShapePoints définis permet l'affichage des mesures
        activeShapePoints = [];
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    this.aideCheckbox.classList.remove('hidden');

    if(choice === 'line' && choice2 === 'mesure') {
      globe.distanceList.classList.remove('hidden');
    }
    if(choice === 'polygon'&& choice2 === 'mesure') {
      globe.aireList.classList.remove('hidden');
    }
    if(choice2 === 'construction') {
      globe.constructionList.classList.remove('hidden');
    }

  } else if(choice2 === 'construction') {

    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    this.aideCheckbox.classList.add('hidden');
    this.constructionList.classList.add('hidden');

  } else if(choice2 === 'mesure'){
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    this.distanceList.classList.add('hidden');
    this.aideCheckbox.classList.add('hidden');
    this.aireList.classList.add('hidden');

    this.viewer.entities.removeAll();
  }
}

measureDistance(activeShapePoints)  {
  var coordsX = [];
  var coordsY = [];
  var coordsZ = [];

    for (let i=0; i < activeShapePoints.length; i+=1) {
      var x1 = activeShapePoints[i].x;
      var y1 = activeShapePoints[i].y;
      var z1 = activeShapePoints[i].z;
      coordsX.push(x1);
      coordsY.push(y1);
      coordsZ.push(z1);
    }
    console.log(coordsX, coordsY, coordsZ);

    for (let i=0; i < coordsX.length; i+=3) {
      var a = (coordsX[i+1]-coordsX[i])*(coordsX[i+1]-coordsX[i]);
      var b = (coordsY[i+1]-coordsY[i])*(coordsY[i+1]-coordsY[i]);
      var diff = (coordsZ[i+1]-coordsZ[i]);

      console.log(a,b,diff);

      this.distance.innerHTML = Math.sqrt(a+b).toFixed(3);
      this.hauteur.innerHMTL = diff;

      /*for (let i=0; i < activeShapePoints.length; i+=1) {
        var coords = proj4('EPSG:4326','EPSG:3948', [activeShapePoints[i].x, activeShapePoints[i].y]);
        //var z1 = (Number(activeShapePoints[i].z) - Number(this.raf09.getGeoide(activeShapePoints[i].x, activeShapePoints[i].y)));
        coordsX.push(coords[i]);
        coordsY.push(coords[i+1]);
        //coordsZ.push(z1);
      }

      for (let i=0; i < coordsX.length; i+=3) {
        console.log(coordsX, coordsY, coordsZ);
        var a = (coordsX[i+1]-coordsX[i])*(coordsX[i+1]-coordsX[i]);
        var b = (coordsY[i+1]-coordsY[i])*(coordsY[i+1]-coordsY[i]);
        var diff = (coordsZ[i+1]-coordsZ[i]);

        console.log(a,b,diff);

        this.distance.innerHTML = Math.sqrt(a+b).toFixed(3);
        this.hauteur.innerHMTL = diff;*/
    }


}

}
