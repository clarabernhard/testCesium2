"use strict";
// web server: http://127.1.0.0:8000/
// Créer un object globe qui pertmet de manipuler cesium plus simplement
class Globe {

  constructor(elementId, geocoder){

    // Créer le globe dans la div HTML qui a l'id cesiumContainer
    this.viewer = new Cesium.Viewer(elementId, {
      geocoder: geocoder,
      selectionIndicator: false,
      skyBox : new Cesium.SkyBox({
       sources : {
         positiveX : 'src/img/Sky.jpg',
         negativeX : 'src/img/Sky.jpg',
         positiveY : 'src/img/Sky.jpg',
         negativeY : 'src/img/Sky.jpg',
         positiveZ : 'src/img/Sky.jpg',
         negativeZ : 'src/img/Sky.jpg'
       }
     })
    });

    // Supprime le terrain par défaut sur le globe
    this.viewer.scene.imageryLayers.removeAll();

    // Définit la couleur de fond du globe étant donné qu'on a supprimé le terrain (ici du noir)
    this.viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#D6CCBF').withAlpha(0.4);


    this.raf09 = undefined;
    new Raf09('../Cesium/data/RAF09.mnt', (raf090) => {
      this.raf09 = raf090;
    });

    // Créer la liste des dataSource sous forme d'un object clé / valeur
    // Avec le nom de la source comme clé et la dataSource comme valeur
    this.dataSources = [];

    // insère les logos en bas
    this.viewer.bottomContainer.innerHTML = '<img src="src/img/logo/logo-strasbourg.png" alt="Logo strasbourg" />\
    <img src="src/img/logo/europe-sengage.jpg" alt="Logo strasbourg" />\
    <img src="src/img/logo/logo-ue.jpg" alt="Logo strasbourg" />\
    <span style="color: #BEC8D1;font-size:small;"> Icons created by : <a style="color: #BEC8D1;font-size:small;" href="https://icons8.com" target="_blank" > https://icons8.com </span>';

    /*var navigationHelpButton = new Cesium.NavigationHelpButton({
    container : 'cesiumContainer'
    });*/

    // variable qui stocke les évenements liés à la souris
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

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
    this.coupeX = document.querySelector('#X');
    this.coupeY = document.querySelector('#Y');
    this.coupeZ = document.querySelector('#hauteurcoupe');

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
  var params = this.getAllUrlParams(window.location.href);
  let X = params.x;
  let Y = params.y;
  let Z = params.z;
  let heading = params.heading;
  let pitch = params.pitch;
  let roll = params.roll;

  // si l'URL ne contient pas de paramètres, on zoome sur la cathédrale
  if(X === undefined || Y === undefined || Z === undefined || heading === undefined || pitch === undefined || roll === undefined) {
    let position = new Cesium.Cartesian3(4189340.8219407, 570098.5779245, 4760076.919231)
    this.fly(position, 0.3779, -0.6882, 0);
  } else {
    // sinon on lit les paramètres présents dans l'URL
    let position = new Cesium.Cartesian3(X,Y,Z);
    this.fly(position, heading, pitch, roll);
  }

  // Définir ce qu'il se passe lorsqu'on clique sur le bouton "maison" (ici retour à la cathédrale)
  this.viewer.homeButton.viewModel.command.beforeExecute.addEventListener((e) => {
    e.cancel = true;
    let position = new Cesium.Cartesian3(4189340.8219407, 570098.5779245, 4760076.919231)
    this.fly(position, 0.3779, -0.6882, 0);
  });
}

// fonction qui retourne les paramètres présents dans l'URL
getAllUrlParams(url) {
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
  var obj = {};

  if (queryString) {
    queryString = queryString.split('#')[0];
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      var a = arr[i].split('=');
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      paramName = paramName.toLowerCase();
      if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

      if (paramName.match(/\[(\d+)?\]$/)) {
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        if (paramName.match(/\[\d+\]$/)) {
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          obj[key].push(paramValue);
        }
      } else {
        if (!obj[paramName]) {
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          obj[paramName].push(paramValue);
        }
      }
    }
  }
  return obj;
}

getOrientation() {
  this.handler.setInputAction(function(event) {
    console.log(globe.viewer.camera.heading);
    console.log(globe.viewer.camera.pitch);
    console.log(globe.viewer.camera.roll);
    console.log(globe.viewer.camera.positionWC);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

// Fonction pour définir le point de vue de caméra en fonction de la position (Cartesian3)
// et des 3 paramètres d'orientation de la caméra
fly(position, lacet, tangage, roulis) {
  this.viewer.camera.setView({
    destination : position,
    orientation: {
      heading : lacet,
      pitch : tangage,
      roll : roulis
    }
  });
}

// Ajoute un bouton HTML qui enregistre un point de vue de caméra
addViewPoint(nom) {
  var viewPoint = document.createElement("BUTTON");
  viewPoint.innerHTML = nom;
  viewPoint.classList.add('nowrap');
  document.getElementById("camera-content").appendChild(viewPoint);

  return viewPoint;

}

// Fonction pour créer le lien de partage
createLink() {
  let X = globe.viewer.camera.positionWC.x;
  let Y = globe.viewer.camera.positionWC.y;
  let Z = globe.viewer.camera.positionWC.z;
  let heading = globe.viewer.camera.heading;
  let pitch = globe.viewer.camera.pitch;
  let roll = globe.viewer.camera.roll;

  document.getElementById('nomlink').value = window.location.href+'?X='+X+'&Y='+Y+'&Z='+Z+'&heading='+heading+'&pitch='+pitch+'&roll='+roll;
}

// permet d'enregister le tileset au format 3DTiles
loadPhotomaillage(link, options = {}){
  // Chargement du photo maillage au format 3D tiles
  let tileset = new Cesium.Cesium3DTileset({
    url : link, // URL vers le ficher JSON "racine"
    maximumScreenSpaceError : 1,
    maximumNumberOfLoadedTiles : 1000 // Nombre maximum de dalles chargées simultanément
  });

  return tileset;
}

// ajoute le tileset sous forme d'entités + structure asynchrone
addPhotomaillage(tileset) {
  var tilesetPrimitive = this.viewer.scene.primitives.add(tileset);
  return tilesetPrimitive.readyPromise;
}

// permet de charger des 3DTiles en gardant une structure asynchrone (voir fonction show dans la classe UI)
load3DTiles(link, options = {}){
  let tileset = globe.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
    url : link, // URL vers le ficher JSON "racine"
    maximumScreenSpaceError : 1,
    maximumNumberOfLoadedTiles : 1000 // Nombre maximum de dalle chargées simultanément
  }));

  return tileset.readyPromise;
}

loadKml(link, options = {clampToGround : true}){
  // Chargement du fichier KML (les points avec leurs descriptions)
  let promisse = Cesium.KmlDataSource.load(link);
  promisse.then((dataSource) => {
    this.viewer.dataSources.add(dataSource);
  });
  return promisse;
}

loadGeoJson(link, name, symbol, couleur, options = {}){
  let promisse = Cesium.GeoJsonDataSource.load(link, {
    clampToGround: true,
    markerSymbol: symbol,
    markerColor: Cesium.Color.fromCssColorString(couleur)
  });
  this.viewer.scene.globe.depthTestAgainstTerrain = true;
  this.viewer.scene.logarithmicDepthBuffer = false;
  this.showLoader();
  promisse.then((dataSource) => {

    this.viewer.dataSources.add(dataSource);
    this.dataSources[name] = dataSource;
    this.hideLoader();


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

// Fonctions pour controler le loader
showLoader(){
  document.querySelector('#loadingIndicator').classList.remove('hidden');
}
hideLoader(){
  document.querySelector('#loadingIndicator').classList.add('hidden');
}

/*
* Afficher ou masquer la source de données "name" en fonction de la valeur de "show"
* Si elle n'a pas enore été affiché, la fonction va télécharger les données avec le lien "link" passé en parametre
* Elle utilise la fonction "loader" passé en paramètre pour télécharger les données et les ajouter au globe
* "Options" est un paramètre optionel (un objet) qui sera passé en deuxième paramètre de la fonction "loader"
marche pour les 3DTiles et KML
*/
showJson(show, name, link, symbol, couleur, options = {}){
  if(show){
    if(this.dataSources[name] === undefined){
      globe.loadGeoJson(link, name, symbol, couleur, options);
    } else{
      this.dataSources[name].show = true;
    }
  } else{
    if(this.dataSources[name] !== undefined){
      this.dataSources[name].show = false;
    }
  }
}

show3DTiles(show, name, link, options = {}){
  if(show){
    if(this.dataSources[name] === undefined){
      globe.showLoader();
      globe.load3DTiles(link, options).then((data) => {
        this.dataSources[name] = data;
        globe.hideLoader();
      });
    } else{
      this.dataSources[name].show = true;
    }
  } else{
    if(this.dataSources[name] !== undefined){
      this.dataSources[name].show = false;
    }
  }
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

// ajouter le plan de coupe horizontal
addClippingPlanes(X, Y, hauteurCoupe, longueurCoupe, largeurCoupe, couleurCoupe, planeEntities, clippingPlanes) {

    var clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes : [
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, orientation1, orientation2), 0.0)
      ]
    });


    for (var i = 0; i < clippingPlanes.length; i=+1) {
      var coords = proj4('EPSG:3948','EPSG:4326', [Number(X), Number(Y)]);
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
      planeEntities.push(planeEntity);
    }
}

// Récupérer les coordonnées au clic et les afficher dans le formulaire du plan de coupe horizontal
coordCoupe(){

  let scene = this.viewer.scene;
  this.handler.globe = this;

  this.handler.setInputAction(function(event) {
    let cartesian = scene.pickPosition(event.position);
    if (Cesium.defined(cartesian)) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);
      let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);
      let height = cartographic.height.toFixed(3);

      var coords = proj4('EPSG:4326','EPSG:3948', [longitude, latitude]);
      document.getElementById("X").value = (coords[0].toFixed(4));
      document.getElementById("Y").value = (coords[1].toFixed(4));
      document.getElementById("hauteurcoupe").value = ((Number(height) - Number(globe.raf09.getGeoide(latitude, longitude))).toFixed(3));
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

annulCoupe(entity, clippingPlanes){
  document.querySelector("#annulercoupe").addEventListener('click', (e) => {
    var annul = entity.length-1;
    this.viewer.entities.remove(entity[annul]);
    entity.pop();
    clippingPlanes = [];
  });
}

supprCoupe(entity, clippingPlanes){
  document.querySelector("#supprimercoupe").addEventListener('click', (e) => {
    //this.viewer.entities.remove(planeEntity);
    for(var i = 0; i < entity.length; i++){
      this.viewer.entities.remove(entity[i]);
    }
    entity = [];
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

//outils dessin
createPoint(worldPosition) {
  var point = this.viewer.entities.add({
    position : worldPosition,
    point : {
      color : Cesium.Color.TRANSPARENT,
      pixelSize : 1,
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
    }
  });
  return point;
}

createBillboard(worldPosition) {
  var symbol = this.viewer.entities.add({
    position : worldPosition,
    billboard : {
      image : 'src/img/interface.png',
      heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM
    }
  });
  return symbol;
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
      extrudedHeight: hauteurVol,
      shadows : Cesium.ShadowMode.ENABLED
      //extrudedHeightReference : Cesium.HeightReference.CLAMP_TO_GROUND
    }
  });
  return shape;
}

updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol, point, billboard, line, surface, volume, dline, dline2, dsurface) {
  var activeShapePoints = [];
  var activeShape;
  var floatingPoint;
  var z;

  var scene = this.viewer.scene;
  this.handler.globe = this;

    this.handler.setInputAction(function(event) {
      var earthPosition = scene.pickPosition(event.position);
      if(Cesium.defined(earthPosition)) {
        if(activeShapePoints.length === 0) {
          // on ajoute 2 fois un point au début pour permettre l'affichage de la ligne/surface
          // le dernier point correspond au point flottant du mouvement de la souris
          floatingPoint = globe.createPoint(earthPosition);
          activeShapePoints.push(earthPosition);
          activeShapePoints.push(earthPosition);
          var dynamicPositions = new Cesium.CallbackProperty(function () {
            return activeShapePoints;
          }, false);
          largeur = parseFloat(largeur);
          transparence = parseFloat(transparence);
          if(choice === 'point') {
            floatingPoint = globe.createBillboard(earthPosition);
            activeShape = globe.createPoint(dynamicPositions);
            activeShape = globe.createBillboard(dynamicPositions);
          } else if(choice === 'polygon') {
            activeShape = globe.drawPolygon(dynamicPositions, couleur, transparence);
          } else if(choice === 'volume') {
            z = globe.getHauteur(activeShapePoints, hauteurVol);
            activeShape = globe.drawVolume(dynamicPositions, couleur, transparence, z);
          } else if(choice === 'line') {
            if(choice2 === 'mesure') {
              activeShape = globe.drawLine(dynamicPositions, largeur, couleur, transparence, false);
              largeur = parseFloat(largeur);
              activeShape = globe.drawLine(dynamicPositions, largeur, '#000000', '0.5', true);
            } else if(choice2 === 'construction') {
              couleur = couleur.toString();
              activeShape = globe.drawLine(dynamicPositions, largeur, couleur, transparence, true);
            }
          }
        } else {
          activeShapePoints.push(earthPosition);
          if(choice === 'point'){
            point.push(globe.createPoint(earthPosition));
            billboard.push(globe.createBillboard(earthPosition));
          } else {
            point.push(globe.createPoint(earthPosition));
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
      // on supprime le dernier point flottant
      activeShapePoints.pop();

      if(choice2 === 'construction'){
        if(choice === 'point') {
          point.push(globe.createPoint(activeShapePoints));
          billboard.push(globe.createBillboard(activeShapePoints));
        } else if(choice === 'line') {
          line.push(globe.drawLine(activeShapePoints, largeur, couleur, transparence, true));
        } else if( choice === 'polygon') {
          surface.push(globe.drawPolygon(activeShapePoints, couleur, transparence));
        } else if( choice === 'volume') {
          volume.push(globe.drawVolume(activeShapePoints, couleur, transparence, z));
        }
      } else if(choice2 === 'mesure'){
        if(choice === 'line') {
          dline.push(globe.drawLine(activeShapePoints, largeur, couleur, transparence, false));
          dline2.push(globe.drawLine(activeShapePoints, largeur, '#000000', '0.5', true));
        } else if( choice === 'polygon') {
          dsurface.push(globe.drawPolygon(activeShapePoints, couleur, transparence));
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

    document.querySelector("#ligne").addEventListener('click', (e) => {
      activeShapePoints = [];
      for(var i = 0; i < dline.length; i++){
        this.viewer.entities.remove(dline[i]);
        this.viewer.entities.remove(dline2[i]);
      }
    });
    document.querySelector("#surface").addEventListener('click', (e) => {
      activeShapePoints = [];
      for(var i = 0; i < dsurface.length; i++){
        this.viewer.entities.remove(dsurface[i]);
      }
    });
  }

  annulFigure(element, figure) {
    document.querySelector(element).addEventListener('click', (e) => {
      var lastLine = figure.pop();
      this.viewer.entities.remove(lastLine);
    });
  }

  supprFigure(element, figure) {
    document.querySelector(element).addEventListener('click', (e) => {
      for(var i = 0; i < figure.length+1; i++){
        this.viewer.entities.remove(figure[i]);
      }
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
  let alti = cartographic.height.toFixed(3);

  var z = (Number(hauteurVol) + Number(alti));
  return z;

}

createHole(viewModel) {
    var dig_point = [];
  var hole_pts = [];
  var coordsX = [];
  var coordsY = [];
  var aire = 0;
  var scene = this.viewer.scene;
  this.handler.globe = this;
  var points = globe.viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());

  this.handler.setInputAction(function(event) {
    var earthPosition = scene.pickPosition(event.position);
    let cartographic = Cesium.Cartographic.fromCartesian(earthPosition);
    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);

    var coords = proj4('EPSG:4326','EPSG:3948', [longitudeString, latitudeString]);
    coordsX.push(coords[0]);
    coordsY.push(coords[1]);

    points.add({
      position : earthPosition,
      color : Cesium.Color.WHITE
    });

    dig_point.push(new Cesium.Cartesian3.fromDegrees(longitudeString, latitudeString));

  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  this.handler.setInputAction(function(event) {
    hole_pts = Array.from(dig_point);

    for (let i=0; i < coordsX.length; i+=1) {
      var a = (coordsX[(i+1) % coordsX.length] - coordsX[i]);
      var b = (coordsY[(i+1) % coordsX.length] + coordsY[i] - (2 * coordsY[0]));
      var c = ((Number(a) * Number(b))/2);
      aire = (Number(aire) + Number(c)).toFixed(3);
    }

    // si l'aire est négative (ie si l'utilistauer a dessiné sa figure dans le sens trigo)
    // on inverse le tableau de points pour que la découpe marche
    if(aire > 0) {
      globe.holePlanes(viewModel, hole_pts);
    } else if(aire < 0) {
      hole_pts = hole_pts.reverse();
      globe.holePlanes(viewModel, hole_pts);
    }
    points.removeAll();
    dig_point = [];
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  Cesium.knockout.getObservable(viewModel, 'affich').subscribe(function(value) {
    tileset.clippingPlanes.enabled = value;
});

Cesium.knockout.getObservable(viewModel, 'trou').subscribe(function(value) {
    globe.holePlanes(viewModel, hole_pts);
});

}

holePlanes(viewModel, hole_pts) {

  var pointsLength = hole_pts.length;
  var clippingPlanes = [];

  for (var i = 0; i < pointsLength; ++i) {
    var nextIndex = (i + 1) % pointsLength;
    var midpoint = Cesium.Cartesian3.add(hole_pts[i], hole_pts[nextIndex], new Cesium.Cartesian3());
    midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);
    var up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
    var right = Cesium.Cartesian3.subtract(hole_pts[nextIndex], midpoint, new Cesium.Cartesian3());
    right = Cesium.Cartesian3.normalize(right, right);
    var normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
    normal = Cesium.Cartesian3.normalize(normal, normal);
    if (!viewModel.trou){
      normal = Cesium.Cartesian3.multiplyByScalar(normal, -1 ,normal);
    }
    var plane = new Cesium.Plane.fromPointNormal(midpoint, normal);
    var clippingPlane = new Cesium.ClippingPlane.fromPlane(plane);
    clippingPlanes.push(clippingPlane);

  }

  // pour couper le globe
  this.viewer.scene.globe.depthTestAgainstTerrain = true;
  /*this.viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
  planes : clippingPlanes,
  unionClippingRegions : union,
  edgeColor: Cesium.Color.WHITE,
});*/

// pour couper le photomaillage
tileset.clippingPlanes = new Cesium.ClippingPlaneCollection({
  planes : clippingPlanes,
  unionClippingRegions: viewModel.trou, //si true: coupe tout ce qui est à l'extérieur de la zone cliquée
  enabled: viewModel.affich,
  edgeColor: Cesium.Color.WHITE,
  modelMatrix: Cesium.Matrix4.inverse(tileset._initialClippingPlanesOriginMatrix, new Cesium.Matrix4())
});

}

supprSouris(){
  this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
  this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

supprEntities(){
  this.viewer.entities.removeAll();
}

// fonction qui permet de cliquer les attributs sur le 3DTiles
handleBatimentClick(enabled, tileset){
  var scene = this.viewer.scene;
  this.handler.globe = this;

  // Informations sur le batiment séléctionné
  let selected = {
    feature: undefined,
    originalColor: new Cesium.Color(),
    selectedEntity: new Cesium.Entity() // Une entité qui contient les attributs du batiments selectionné
  };

  let defaultClickHandler = this.viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

  if (Cesium.PostProcessStageLibrary.isSilhouetteSupported(this.viewer.scene)) {
    // Créer la bordure verte
    let silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
    silhouetteGreen.uniforms.color = Cesium.Color.fromCssColorString('#E20000').withAlpha(0.7);
    silhouetteGreen.uniforms.length = 0.01;
    silhouetteGreen.selected = [];
    // Enregistrer les bordures dans cesium
    this.viewer.scene.postProcessStages.add(Cesium.PostProcessStageLibrary.createSilhouetteStage([silhouetteGreen]));

    this.handler.setInputAction(function(movement) {
      // Supprimer toutes les bordures verte
      silhouetteGreen.selected = [];
      // Récuperer la forme sur laquelle on a cliqué
      let pickedFeature = scene.pick(movement.position);
      // Si on clique sur un element qui n'appartient pas à tileset on ne met pas de bordure verte
      if (!Cesium.defined(pickedFeature) || !Cesium.defined(pickedFeature.content) || pickedFeature.content._tileset != tileset) {
        selected.feature = undefined;
        defaultClickHandler(movement);
        return;
      }
      // Ajouter le bord vert sur la forme selectionnée
      if (pickedFeature !== silhouetteGreen.selected[0]) {
        silhouetteGreen.selected = [pickedFeature];

        selected.feature = pickedFeature;
        selected.selectedEntity.name = pickedFeature.getProperty('name');
        selected.selectedEntity.description = '<table class="cesium-infoBox-defaultTable"><tbody>';

        // Générer les lignes du tableau
        let propertyNames = pickedFeature.getPropertyNames();
        for(let i = 0; i < propertyNames.length; i++){
          selected.selectedEntity.description += '<tr><th>' + propertyNames[i] + '</th><td>' + pickedFeature.getProperty(propertyNames[i]) + '</td></tr>';
        }
        selected.selectedEntity.description += '</tbody></table>';

        // Afficher le tableau en haut à droite
        globe.viewer.selectedEntity = selected.selectedEntity;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Quitter la fonction pour desactiver la selection de batiments
    if(!enabled){
      silhouetteGreen.selected = [];
      return;
    }
  }
}


}
