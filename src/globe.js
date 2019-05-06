"use strict";

// Créer un object globe qui pertmet de manipuler cesium plus simplement
class Globe {

  constructor(elementId, geocoder, link){

    // Créer le globe dans la div HTML qui a l'id cesiumContainer
    this.viewer = new Cesium.Viewer(elementId, {
      geocoder: geocoder,
      vrButton: true,
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
    //this.leftClick = this.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(Cesium.ScreenSpaceEventTypeLEFT_CLICK);

    // mesures de coords
    this.coordX = document.querySelector('#coordX');
    this.coordY = document.querySelector('#coordY');
    this.coordZ = document.querySelector('#coordZ');
    this.coordsList = document.querySelector('#coordsList');

    // mesures de distance
    this.distance = document.querySelector('#distance');
    this.distanceCumulee = document.querySelector('#distancecumulee');
    this.hauteur = document.querySelector('#hauteur');
    this.distanceInclinee = document.querySelector('#distanceinclinee');
    this.distanceInclineeC = document.querySelector('#distanceinclineecum');

    // mesures de surface
    this.aire = document.querySelector('#aire');

    // plan de coupe
    this.altitude = document.querySelector('#alticoupe');

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

// lire les valeurs rentrées par l'utilisateur
formulairePlan(){
  document.querySelector("#envoyercoupe").addEventListener('click', (e) => {
    var X = $('#X').val();
    var Y = $('#Y').val();
    var hauteurCoupe = $('#hauteurcoupe').val();
    var longueurCoupe = $('#longueurcoupe').val();
    var largeurCoupe = $('#largeurcoupe').val();
    var couleurCoupe = $('#couleurcoupe').val();

    this.addClippingPlanes(X, Y, hauteurCoupe, longueurCoupe, largeurCoupe, couleurCoupe);

  });
}

// Afficher ou enlever le plan de coupe
addClippingPlanes(X, Y, hauteurCoupe, longueurCoupe, largeurCoupe, couleurCoupe) {

    var planeEntities = [];
    var clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes : [
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 0.0)
      ],
    });

    for (var i = 0; i < clippingPlanes.length; ++i) {
      var coords = proj4('EPSG:3948','EPSG:4326', [X, Y]);
      var a = Number(this.raf09.getGeoide(coords[1], coords[0]));

      var y = coords[1];
      var x = coords[0];
      var z = (Number(hauteurCoupe) + a);

      var plane = clippingPlanes.get(i);
      var planeEntity = this.viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(x, y, z),
        plane : {
          dimensions : new Cesium.Cartesian2(longueurCoupe, largeurCoupe),
          material : Cesium.Color.fromCssColorString(couleurCoupe).withAlpha(0.4),
          plane : new Cesium.CallbackProperty(this.planeUpdate(plane, couleurCoupe), false),
          outline : true,
          outlineColor : Cesium.Color.WHITE
        }
      });
      }

      planeEntities.push(planeEntity);
      document.querySelector("#supprimercoupe").addEventListener('click', (e) => {
        this.viewer.entities.remove(planeEntity);
        this.viewer.entities.remove(planeEntities);
        clippingPlanes = [];
      });
      document.querySelector("#plancoupe").addEventListener('click', (e) => {
        this.viewer.entities.remove(planeEntity);
        this.viewer.entities.remove(planeEntities);
        clippingPlanes = [];
      });

}

// Fonction qui permet de gérer les mouvements du plan de coupe
planeUpdate(plane, couleurCoupe) {

  var targetY = 0.0;
  var selectedPlane;
  var scene = this.viewer.scene;
  this.altitude.innerHTML = 0;
  this.handler.globe = this;

  // Select plane when mouse down
  this.handler.setInputAction(function(movement) {
    var pickedObject = scene.pick(movement.position);
    if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.id.plane)) {
      selectedPlane = pickedObject.id.plane;
      selectedPlane.material = Cesium.Color.fromCssColorString(couleurCoupe).withAlpha(0.4);
      selectedPlane.outlineColor = Cesium.Color.WHITE;
      scene.screenSpaceCameraController.enableInputs = false;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  // Release plane on mouse up
  this.handler.setInputAction(function() {
    if (Cesium.defined(selectedPlane)) {
      selectedPlane.material = Cesium.Color.fromCssColorString(couleurCoupe).withAlpha(0.4);
      selectedPlane.outlineColor = Cesium.Color.WHITE;
      selectedPlane = undefined;
    }
    scene.screenSpaceCameraController.enableInputs = true;
  }, Cesium.ScreenSpaceEventType.LEFT_UP);

  // Update plane on mouse move
  this.handler.setInputAction(function(movement) {
    if (Cesium.defined(selectedPlane)) {
      var deltaY = movement.startPosition.y - movement.endPosition.y;
      targetY += deltaY;
    }
    globe.altitude.innerHTML = targetY;
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



  return function () {
    plane.distance = targetY;
    return plane;
  };
}

// formulaires
formulaireLigne(choice, choice2){
  var hauteurVol;
  document.querySelector("#envoyerligne").addEventListener('click', (e) => {
    var largeur = $('#largeur').val();
    var couleur = $('#couleur').val();
    var transparence = $('#transparence').val();

    globe.updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol);

  });
}

formulaireSurface(choice, choice2){
  var hauteurVol;
  var largeur = 3;
  document.querySelector("#envoyersurf").addEventListener('click', (e) => {
    var couleur = $('#couleursurf').val();
    var transparence = $('#transparencesurf').val();

    globe.updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol);

  });
}

formulairePoint(choice, choice2){
  var transparence;
  var hauteurVol;

  document.querySelector("#envoyerpoint").addEventListener('click', (e) => {
    var largeur = $('#largeurpoint').val();
    var couleur = $('#couleurpoint').val();
    this.updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol);

  });
}

formulaireVolume(choice, choice2){
  var largeur = 3;

  document.querySelector("#envoyervol").addEventListener('click', (e) => {
    var hauteurVol = $('#hauteurvol').val();
    var couleur = $('#couleurvol').val();
    var transparence = $('#transparencevol').val();

    this.updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol);

  });
}

//outil construction
createPoint(worldPosition, largeur, couleur, test) {
  var point = this.viewer.entities.add({
    position : worldPosition,
    point : {
      color : Cesium.Color.fromCssColorString(couleur),
      pixelSize : largeur,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
    }
  });
  var symbol = this.viewer.entities.add({
    position : worldPosition,
    billboard : {
      show: test,
      image : 'src/img/interface.png',
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    }
  });
  return point;
}

drawLine(positionData, largeur, couleur, transparence, clamp) {
  var shape = this.viewer.entities.add({
    polyline : {
      positions : positionData,
      material : Cesium.Color.fromCssColorString(couleur).withAlpha(transparence),
      clampToGround : clamp,
      width : largeur
    }
  });
  return shape;
}

drawPolygon(positionData, couleur, transparence) {
  var shape = this.viewer.entities.add({
    polygon: {
      id: 'polygon',
      hierarchy: positionData,
      material : Cesium.Color.fromCssColorString(couleur).withAlpha(transparence)
    }
  });
  return shape;
}

drawVolume(positionData, couleur, transparence, hauteurVol) {
  var shape = this.viewer.entities.add({
    polygon: {
      hierarchy: positionData,
      material : Cesium.Color.fromCssColorString(couleur).withAlpha(transparence),
      extrudedHeight: hauteurVol
      //extrudedHeightReference : Cesium.HeightReference.CLAMP_TO_GROUND
    }
  });
  return shape;
}

updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol) {
  var point;
  var line;
  var volume;
  var surface;
  var dline;
  var dline2;
  var dsurface;

  var activeShapePoints = [];
  var figures = [];
  var activeShape;
  var floatingPoint;

  var scene = this.viewer.scene;
  this.handler.globe = this;

    //this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.setInputAction(function(event) {
      var earthPosition = scene.pickPosition(event.position);
      if(Cesium.defined(earthPosition)) {
        if(activeShapePoints.length === 0) {
          // on ajoute 2 fois un point au début pour permettre l'affichage de la ligne/surface
          // le dernier point correspond au point flottant du mouvement de la souris
          activeShapePoints.push(earthPosition);
          activeShapePoints.push(earthPosition);
          var dynamicPositions = new Cesium.CallbackProperty(function () {
            return activeShapePoints;
          }, false);
          largeur = parseFloat(largeur);
          transparence = parseFloat(transparence);
          couleur = couleur.toString();
          if(choice === 'point') {
            floatingPoint = globe.createPoint(earthPosition, largeur, couleur, true);
            activeShape = globe.createPoint(dynamicPositions, largeur, couleur, true);
          } else if(choice === 'polygon') {
            floatingPoint = globe.createPoint(earthPosition, largeur, couleur, false);
            activeShape = globe.drawPolygon(dynamicPositions, couleur, transparence);
          } else if(choice === 'volume') {
            floatingPoint = globe.createPoint(earthPosition, largeur, couleur, false);
            var z = globe.getHauteur(activeShapePoints, hauteurVol);
            activeShape = globe.drawVolume(dynamicPositions, couleur, transparence, z);
          } else if(choice === 'line') {
            if(choice2 === 'mesure') {
              floatingPoint = globe.createPoint(earthPosition, largeur, couleur, false);
              activeShape = globe.drawLine(dynamicPositions, largeur, couleur, transparence, false);
              largeur = parseFloat(largeur);
              activeShape = globe.drawLine(dynamicPositions, largeur, '#000000', '0.5', true);
            } else if(choice2 === 'construction') {
              floatingPoint = globe.createPoint(earthPosition, largeur, couleur, false);
              couleur = couleur.toString();
              activeShape = globe.drawLine(dynamicPositions, largeur, couleur, transparence, true);
            }
          }
        } else {
          activeShapePoints.push(earthPosition);
          if(choice === 'point'){
            globe.createPoint(earthPosition, largeur, couleur, true);
          } else {
            globe.createPoint(earthPosition, largeur, couleur, false);
          }
        }

      }
      if(choice === 'polygon'&& choice2 === 'mesure') {
        globe.measureSurface(activeShapePoints);
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
      if(choice === 'line' && choice2 === 'mesure') {
        globe.measureDistance(activeShapePoints);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.handler.setInputAction(function(event) {
      largeur = parseFloat(largeur);
      transparence = parseFloat(transparence);
      couleur = couleur.toString();
      // on supprime le dernier point flottant
      activeShapePoints.pop();
      if(choice2 === 'construction'){
        if(choice === 'point') {
          point = globe.createPoint(activeShapePoints, largeur, couleur, true);
        } else if(choice === 'line') {
          line = globe.drawLine(activeShapePoints, largeur, couleur, transparence, true);
        } else if( choice === 'polygon') {
          surface = globe.drawPolygon(activeShapePoints, couleur, transparence);
        } else if( choice === 'volume') {
          var z = globe.getHauteur(activeShapePoints, hauteurVol);
          volume = globe.drawVolume(activeShapePoints, couleur, transparence, z);
        }
      } else if(choice2 === 'mesure'){
        if(choice === 'line') {
          console.log('coucou');
          dline = globe.drawLine(activeShapePoints, largeur, couleur, transparence, false);
          dline2 = globe.drawLine(activeShapePoints, largeur, '#000000', '0.5', true);
        } else if( choice === 'polygon') {
          dsurface = globe.drawPolygon(activeShapePoints, couleur, transparence);
        }
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

    $('.nouv').click(function(e) {
      activeShapePoints = [];
    });

    document.querySelector("#supprimerpoint").addEventListener('click', (e) => {
      this.viewer.entities.remove(point);
    });
    document.querySelector("#supprimerligne").addEventListener('click', (e) => {
      this.viewer.entities.remove(line);
    });
    document.querySelector("#supprimersurf").addEventListener('click', (e) => {
      this.viewer.entities.remove(surface);
    });
    document.querySelector("#supprimervol").addEventListener('click', (e) => {
      this.viewer.entities.remove(volume);
    });
    document.querySelector("#ligne").addEventListener('click', (e) => {
      activeShapePoints = [];
      this.viewer.entities.remove(dline);
      this.viewer.entities.remove(dline2);
    });
    document.querySelector("#surface").addEventListener('click', (e) => {
      activeShapePoints = [];
      this.viewer.entities.remove(dsurface);
    });
}

measureDistance(activeShapePoints)  {
  var coordsX = [];
  var coordsY = [];
  var coordsZ = [];
  var distance = 0;
  var distanceIncl = 0;
  var difference = 0;
  this.distance.innerHTML = 0;
  this.distanceCumulee.innerHTML = 0;
  this.hauteur.innerHTML = 0;
  this.distanceInclinee.innerHTML = 0;
  this.distanceInclineeC.innerHTML = 0;

  for (let i=0; i < activeShapePoints.length; i+=1) {
    var cartesian = new Cesium.Cartesian3(activeShapePoints[i].x, activeShapePoints[i].y, activeShapePoints[i].z);

    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);
    let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);
    let height = cartographic.height.toFixed(3);

    var coords = proj4('EPSG:4326','EPSG:3948', [longitude, latitude]);
    coordsX.push(coords[0]);
    coordsY.push(coords[1]);
    var z = (Number(height) - Number(this.raf09.getGeoide(latitude, longitude)));
    coordsZ.push(z);

  }

  for (let i=0; i < coordsX.length-1; i+=1) {
    var a = (coordsX[i+1]-coordsX[i])*(coordsX[i+1]-coordsX[i]);
    var b = (coordsY[i+1]-coordsY[i])*(coordsY[i+1]-coordsY[i]);
    var c = (coordsZ[i+1]-coordsZ[i])*(coordsZ[i+1]-coordsZ[i]);
    distance = Number(Math.sqrt(a+b).toFixed(3));
    distanceIncl = Number(Math.sqrt(a+b+c).toFixed(3));
    difference = Number(coordsZ[i+1]-coordsZ[i]).toFixed(3);

    this.distanceCumulee.innerHTML = (Number(this.distanceCumulee.innerHTML) + distance).toFixed(3);
    this.distanceInclineeC.innerHTML = (Number(this.distanceInclineeC.innerHTML) + distanceIncl).toFixed(3);
  }
  this.distance.innerHTML = distance.toFixed(3);
  this.distanceInclinee.innerHTML = distanceIncl.toFixed(3);
  this.hauteur.innerHTML = difference;

}

measureSurface(activeShapePoints) {
  var coordsX = [];
  var coordsY = [];
  var aire = 0;
  this.aire.innerHTML = 0;

  for (let i=0; i < activeShapePoints.length-1; i+=1) {
    var cartesian = new Cesium.Cartesian3(activeShapePoints[i].x, activeShapePoints[i].y, activeShapePoints[i].z);

    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);
    let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);

    var coords = proj4('EPSG:4326','EPSG:3948', [longitude, latitude]);
    coordsX.push(coords[0]);
    coordsY.push(coords[1]);
  }

  if(coordsX.length > 2){
  for (let i=0; i < coordsX.length; i+=1) {
    var a = (coordsX[(i+1) % coordsX.length] - coordsX[i]);
    var b = (coordsY[(i+1) % coordsX.length] + coordsY[i] - (2 * coordsY[0]));
    var c = ((Number(a) * Number(b))/2);
    aire = (Number(aire) + Number(c)).toFixed(3);
  }
}
  this.aire.innerHTML = Math.abs(aire);

}

getHauteur(activeShapePoints, hauteurVol){
    var cartesian = new Cesium.Cartesian3(activeShapePoints[0].x, activeShapePoints[0].y, activeShapePoints[0].z);

    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);
    let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);

    var a = Number(this.raf09.getGeoide(latitude, longitude));
    var z = (Number(hauteurVol) + a);
    return z;

}

supprSouris(){
  this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
  this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

supprEntities(){
  this.viewer.entities.removeAll();
}

}
