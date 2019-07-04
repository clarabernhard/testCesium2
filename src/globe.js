"use strict";
// web server: http://127.1.0.0:8000/
// Créé un object globe qui pertmet de manipuler cesium plus simplement
class Globe {

  constructor(elementId, geocoder){

    // Créer le globe dans la div HTML qui a l'id cesiumContainer
    this.viewer = new Cesium.Viewer(elementId, {
      geocoder: geocoder, // connexion à la base de données d'adresses de l'EMS
      selectionIndicator: false, // enlève le carré vert lorsqu'on clique sur qqch
      requestRenderMode : true, // amélioration de performance: l'appli calcule uniquement quand on lui demande (https://cesium.com/blog/2018/01/24/cesium-scene-rendering-performance/)
      maximumRenderTimeChange : Infinity,
      baseLayerPicker: false,
      skyBox : new Cesium.SkyBox({ // définit le ciel bleu
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
    this.viewer.extend(Cesium.viewerCesiumNavigationMixin, {}); // pour ajouter la flèche nord

    /*// Supprime le terrain par défaut sur le globe
    this.viewer.scene.imageryLayers.removeAll();
    // Définit la couleur de fond du globe étant donné qu'on a supprimé le terrain (ici du noir)
    this.viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#AB9B8B').withAlpha(0.4);*/

    // importe la grille de conversion pour hauteur ellispoïdale vers altitude IGN69
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

    // variable qui stocke les évenements liés à la souris
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);

    /*
    * Div pour les affichage de coordonnées et mesures
    */
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

  }

  /*
  *
  *  Contrôle de la caméra/de la vue affichée
  *
  */

  //Définit le zoom par défaut à l'ouverture de l'appli et lorsqu'on clique sur le bouton maison
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
      let position = new Cesium.Cartesian3(4189340.8219407, 570098.5779245, 4760076.919231);
      this.viewer.camera.setView({
        destination : position,
        orientation: {
          heading : 0.3779,
          pitch : -0.6882,
          roll : 0
        }
      });
    } else {
      // sinon on lit les paramètres présents dans l'URL
      let position = new Cesium.Cartesian3(X,Y,Z);
      this.viewer.camera.setView({
        destination : position,
        orientation: {
          heading : heading,
          pitch : pitch,
          roll : roll
        }
      });
    }
    // Définir ce qu'il se passe lorsqu'on clique sur le bouton "maison" (ici retour à l'écran d'accueil)
    this.viewer.homeButton.viewModel.command.beforeExecute.addEventListener((e) => {
      e.cancel = true;
      if(X === undefined || Y === undefined || Z === undefined || heading === undefined || pitch === undefined || roll === undefined) {
        let position = new Cesium.Cartesian3(4189340.8219407, 570098.5779245, 4760076.919231)
        this.fly(position, 0.3779, -0.6882, 0);

      } else {
        let position = new Cesium.Cartesian3(X,Y,Z);
        this.fly(position, heading, pitch, roll);
      }
    });
  }

  // fonction qui lit et retourne les paramètres présents dans l'URL
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
    this.viewer.camera.flyTo({
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

    // le premier paramètre doit débuter avec un "?" et les autres paramètres doivent être séparés par un "&"
    document.getElementById('nomlink').value = window.location.href+'?X='+X+'&Y='+Y+'&Z='+Z+'&heading='+heading+'&pitch='+pitch+'&roll='+roll;
  }

  /*
  *
  * Chargement de données
  *
  */

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
      url : link,
      maximumScreenSpaceError : 1,
      maximumNumberOfLoadedTiles : 1000
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

  loadGeoJson(link, name, symbol, couleur, image, choice, billboard, options = {}){
    let promisse = Cesium.GeoJsonDataSource.load(link, {
      clampToGround: true,
      markerSymbol: symbol, // pour l'affichage en symbole maki https://cesiumjs.org/Cesium/Build/Apps/Sandcastle/index.html?src=GeoJSON%20simplestyle.html&label=All
      markerColor: couleur // choisir la couleur de l'épingle
    });
    this.viewer.scene.globe.depthTestAgainstTerrain = true; // test pour voir si les json arrête de baver
    this.viewer.scene.logarithmicDepthBuffer = false; // idem
    this.showLoader(); // fonction qui affiche un symbole de chargement sur la page

    promisse.then((dataSource) => {
      this.viewer.dataSources.add(dataSource);
      this.dataSources[name] = dataSource;
      this.hideLoader();

      // permet de classifier les json
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
      // créé un billboard pour chaque entité ponctuelle (en précisant l'image à utiliser dans les paramètres)
      if(choice === 'point') {
        for(let i=0;i<this.dataSources[name]._entityCollection._entities._array.length;i++) {
          var X = (this.dataSources[name]._entityCollection._entities._array[i]._position._value.x);
          var Y = (this.dataSources[name]._entityCollection._entities._array[i]._position._value.y);
          var Z = (this.dataSources[name]._entityCollection._entities._array[i]._position._value.z);
          var position = new Cesium.Cartesian3(X,Y,Z);
          billboard.push(this.createBillboard(position, image, true));
        }
      }
    });
    return promisse;
  }

  loadDrawing(link, name, options = {}){
    let promisse = Cesium.GeoJsonDataSource.load(link, {
      clampToGround: true
    });
    this.showLoader(); // fonction qui affiche un symbole de chargement sur la page

    promisse.then((dataSource) => {
      this.viewer.dataSources.add(dataSource);
      this.dataSources[name] = dataSource;
      this.hideLoader();

      // Get the array of entities
      var entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        if (Cesium.defined(entity.polygon)) {
          /*let rouge = parseFloat(entity.properties.color.red);
          let vert = parseFloat(entity.properties.color.green);
          let bleu = parseFloat(entity.properties.color.blue);
          let alpha = parseFloat(entity.properties.color.alpha);
          let couleur = new Cesium.Color(rouge, vert, bleu, alpha);*/
          let couleur = new Cesium.Color(0, 1, 0.5, 0.5);
          //let couleur = new Cesium.Color(Number(entity.properties.color.red), Number(entity.properties.color.green), Number(entity.properties.color.blue), Number(entity.properties.color.alpha));
          entity.polygon.material = couleur;
          entity.polygon.outline = false;
          entity.polygon.extrudedHeight = entity.properties.extrudedHeight;
          entity.polygon.classificationType = Cesium.ClassificationType.CESIUM_3D_TILE;

        } else if(Cesium.defined(entity.polyline)) {
          /*let rouge = parseFloat(entity.properties.color.red);
          let vert = parseFloat(entity.properties.color.green);
          let bleu = parseFloat(entity.properties.color.blue);
          let alpha = parseFloat(entity.properties.color.alpha);
          let couleur = new Cesium.Color(rouge, vert, bleu, alpha);*/
          let couleur = new Cesium.Color(0, 1, 0.5, 0.5);
          let largeur = entity.properties.width;

          entity.polyline.material = couleur;
          entity.polyline.width = largeur;
          entity.polyline.classificationType = Cesium.ClassificationType.CESIUM_3D_TILE;
        }
      }
    });
    return promisse;
  }

  /*
  * Afficher ou masquer la source de données "name" en fonction de la valeur de "show"
  * Si elle n'a pas enore été affiché, la fonction va télécharger les données avec le lien "link" passé en parametre
  * Enlève/Affiche les entités billboard pour les points
  */
  showJson(show, name, link, symbol, couleur, image, choice, billboard, options = {}){
    if(show){
      if(this.dataSources[name] === undefined){
        globe.loadGeoJson(link, name, symbol, couleur, image, choice, billboard, options);
      } else{
        this.dataSources[name].show = true;
        if(choice === 'point') {
          for(var i = 0; i < billboard.length; i++){
            billboard[i].show = true;
          }
        }
        this.viewer.scene.requestRender(); // dit à Cesium de recalculer la page
      }
    } else{
      if(this.dataSources[name] !== undefined){
        this.dataSources[name].show = false;
        if(choice === 'point') {
          for(var i = 0; i < billboard.length; i++){
            billboard[i].show = false;
          }
        }
        this.viewer.scene.requestRender();
      }
    }
  }

// idem pour les 3Dtiles
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
        this.viewer.scene.requestRender();
      }
    } else{
      if(this.dataSources[name] !== undefined){
        this.dataSources[name].show = false;
        this.viewer.scene.requestRender();
      }
    }
  }

  // Fonctions pour controler le loader, ie l'icône qui s'affiche pendant le chargement des données
  showLoader(){
    document.querySelector('#loadingIndicator').classList.remove('hidden');
  }
  hideLoader(){
    document.querySelector('#loadingIndicator').classList.add('hidden');
  }

  /*
  * Fonction pour afficher les ombres
  */
  shadow(enabled){
    this.handler.globe = this; // pour les problèmes de scope
    this.viewer.shadows = enabled;
    if(enabled) {
      document.addEventListener("mousemove", function() {
        globe.viewer.scene.requestRender();
      });
    } else {
      this.supprSouris();
    }
  }

  /*
  * Coordonnées
  */
  // récupérer lat/lon/hauteur à chaque clic gauche
  setCoordsCallback(callback){
    let scene = this.viewer.scene;

    this.handler.setInputAction(function(event) {

      let cartesian = scene.pickPosition(event.position);

      if (Cesium.defined(cartesian)) {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian); // cartesian = coords géometriques de l'écran
        let longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7); // en degrés décimaux
        let latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);
        let heightString = cartographic.height.toFixed(3);
        callback(longitudeString, latitudeString, heightString);
      }
      this.viewer.scene.requestRender();
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  // Convertit les lat/lon/hauteur en CC48 / IGN69 et les affiche
  showCoords(show){
    this.setCoordsCallback((longitude, latitude, hauteur) => { // Fonction éxécutée à chaque clic

      var coords = proj4('EPSG:4326','EPSG:3948', [longitude, latitude]);
      this.coordX.innerHTML = coords[0].toFixed(2);
      this.coordY.innerHTML = coords[1].toFixed(2);
      this.coordZ.innerHTML = (Number(hauteur) - Number(this.raf09.getGeoide(latitude, longitude))).toFixed(2);

    });
    if(show){
      this.coordsList.classList.remove('hidden');
    } else{
      this.coordsList.classList.add('hidden');
      this.setCoordsCallback(undefined);
    }
  }

  /*
  * Plan de coupe horizontal
  */

  // ajouter le plan de coupe horizontal: les paramètres de la fonction vont être lus dans le formulaire avant de cliquer sur 'ajouter'
  addClippingPlanes(X, Y, hauteurCoupe, longueurCoupe, largeurCoupe, couleurCoupe, planeEntities, clippingPlanes) {
    // on n'associe pas les clippingPlanes au tileset: c'est pour ça qu'ils ne coupent pas le tileset mais passent à travers
    var clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes : [
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0, -1), 0.0) // donne l'orientation du clippingPlanes
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
    this.viewer.scene.requestRender();
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
        document.getElementById("X").value = (coords[0].toFixed(2));
        document.getElementById("Y").value = (coords[1].toFixed(2));
        document.getElementById("hauteurcoupe").value = ((Number(height) - Number(globe.raf09.getGeoide(latitude, longitude))).toFixed(2));
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

// enlève le dernier plan de coupe ajouté
  annulCoupe(entity, clippingPlanes){
    document.querySelector("#annulercoupe").addEventListener('click', (e) => {
      var annul = entity.length-1;
      this.viewer.entities.remove(entity[annul]);
      entity.pop();
      clippingPlanes = [];
      this.viewer.scene.requestRender();
    });
  }

// supprime tous les plans de coupe
  supprCoupe(entity, clippingPlanes){
    document.querySelector("#supprimercoupe").addEventListener('click', (e) => {
      //this.viewer.entities.remove(planeEntity);
      for(var i = 0; i < entity.length; i++){
        this.viewer.entities.remove(entity[i]);
      }
      clippingPlanes = [];
      this.viewer.scene.requestRender();
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
      globe.altitude.innerHTML = targetY; // affiche la différence entre l'altitude actuelle et l'altitude de départ (pas métrique)
      globe.viewer.scene.requestRender();
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return function () {
      plane.distance = targetY;
      return plane;
    };
  }

  /*
  *
  *
  *  Outils de dessin
  *
  *
  */

  // pour créer un point: entité uniquement technique qui sert à afficher les autres figures (ici chaque point est affiché transparent)
  createPoint(worldPosition) {
    var point = this.viewer.entities.add({
      position : worldPosition,
      point : {
        color : Cesium.Color.TRANSPARENT,
        pixelSize : 1,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND // plaque au 3dtiles
      }
    });
    return point;
  }

  // Ajoute une image à une position spécifiée
  createBillboard(worldPosition, image, size) {
    var symbol = this.viewer.entities.add({
      position : worldPosition,
      billboard : {
        image : image,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        sizeInMeters: size // true si on veut la taille en mètre, false si on veut la taille en pixels
      }
    });
    return symbol;
  }

  // ajoute une polyligne
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

  // polyligne avec une flèche au bout
  drawArrowLine(positionData, largeur, couleur, transparence, clamp) {
    var shape = this.viewer.entities.add({
      polyline : {
        positions : positionData,
        material : new Cesium.PolylineArrowMaterialProperty(Cesium.Color.fromCssColorString(couleur).withAlpha(transparence)),
        clampToGround : clamp,
        width : largeur
      }
    });
    return shape;
  }

  // polyligne en pointillés
  drawDashLine(positionData, largeur, couleur, transparence, clamp) {
    var shape = this.viewer.entities.add({
      polyline : {
        positions : positionData,
        material : new Cesium.PolylineDashMaterialProperty({
          color : Cesium.Color.fromCssColorString(couleur).withAlpha(transparence)
        }),
        clampToGround : clamp,
        width : largeur
      }
    });
    return shape;
  }

  // dessine une surface
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

  // dessine une surface extrudée, ie une boîte pour laquelle on précise la hauteur
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

  /* LA fonction qui permet de tout dessiner
  * le paramètre choice designe si on mesure (dessins temporaires) ou si on dessine (dessins qui restent après fermeture de la fonction de dessin)
  * le paramètre choice désigne le type de dessin (line, surface, volume etc)
  * On met tous les tableaux d'entités en paramètres de la fonction car ils seront définis dans la classe ui
  * pour garder une trace des entités et permettre leur annulation/exportation
  * Le reste des paramètres correspondent aux paramètres de personnalisation définis par l'utilisateur dans les formulaires
  */
  updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol, point, billboard, line, surface, volume, dline, dline2, dsurface) {
    var activeShapePoints = [];
    var activeShape;
    var floatingPoint;
    var z;

    var scene = this.viewer.scene;
    this.handler.globe = this; // problème de scope à l'intérieur du this.handler

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
            floatingPoint = globe.createBillboard(earthPosition, 'src/img/interface.png', false);
            activeShape = globe.createPoint(dynamicPositions);
            activeShape = globe.createBillboard(dynamicPositions, 'src/img/interface.png', false);
          } else if(choice === 'polygon') {
            activeShape = globe.drawPolygon(dynamicPositions, couleur, transparence);
          } else if(choice === 'volume') {
            z = globe.getHauteur(activeShapePoints, hauteurVol);
            activeShape = globe.drawVolume(dynamicPositions, couleur, transparence, z);
          } else if(choice === 'line') {
            if(choice2 === 'mesure') {
              activeShape = globe.drawLine(dynamicPositions, largeur, couleur, transparence, false); // 1ère ligne non collée au sol pour la distance inclinée
              largeur = parseFloat(largeur);
              activeShape = globe.drawLine(dynamicPositions, largeur, '#000000', '0.5', true); // 2ème collée au sol pour distance horizontale
            } else if(choice2 === 'dessin') {
              couleur = couleur.toString();
              if($('#clampligne').val() === 'colle') { // clamp to ground ou pas
                if($('#styleligne').val() === 'simple') { // style normal
                  activeShape = globe.drawLine(dynamicPositions, largeur, couleur, transparence, true);
                } else if($('#styleligne').val() === 'pointille') { // style pointillé
                  activeShape = globe.drawDashLine(dynamicPositions, largeur, couleur, transparence, true);
                } else if($('#styleligne').val() === 'fleche') { // avec une flèche à la fin
                  activeShape = globe.drawArrowLine(dynamicPositions, largeur, couleur, transparence, true);
                }
              } else if($('#clampligne').val() === 'noncolle'){ // mêmes instructions avec la ligne non collée au sol
                if($('#styleligne').val() === 'simple') {
                  activeShape = globe.drawLine(dynamicPositions, largeur, couleur, transparence, false);
                } else if($('#styleligne').val() === 'pointille') {
                  activeShape = globe.drawDashLine(dynamicPositions, largeur, couleur, transparence, false);
                } else if($('#styleligne').val() === 'fleche') {
                  activeShape = globe.drawArrowLine(dynamicPositions, largeur, couleur, transparence, false);
                }
              }
            }
          }
        } else {
          activeShapePoints.push(earthPosition);
          if(choice === 'point'){
            point.push(globe.createPoint(earthPosition));
            billboard.push(globe.createBillboard(earthPosition, 'src/img/interface.png', false));
          } else {
            point.push(globe.createPoint(earthPosition));
          }
        }
      }
      if(choice === 'polygon'&& choice2 === 'mesure') {
        globe.measureSurface(activeShapePoints); // mesure l'aire du polygone à chaque clic gauche
      }
      globe.viewer.scene.requestRender();
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
        globe.measureDistance(activeShapePoints); // mesure la distance à chaque mouvement de souris
      }
      globe.viewer.scene.requestRender();
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.handler.setInputAction(function(event) {
      largeur = parseFloat(largeur);
      transparence = parseFloat(transparence);
      // on supprime le dernier point flottant
      activeShapePoints.pop();

      // on ajoute les entités dans le taleau d'entités correspondant
      if(choice2 === 'dessin'){
        if(choice === 'point') {
          point.push(globe.createPoint(activeShapePoints));
          billboard.push(globe.createBillboard(activeShapePoints, 'src/img/interface.png', false));
        } else if(choice === 'line') {
          if($('#clampligne').val() === 'colle') {
            if($('#styleligne').val() === 'simple') {
              line.push(globe.drawLine(activeShapePoints, largeur, couleur, transparence, true));
            } else if($('#styleligne').val() === 'pointille') {
              line.push(globe.drawDashLine(activeShapePoints, largeur, couleur, transparence, true));
            } else if($('#styleligne').val() === 'fleche') {
              line.push(globe.drawArrowLine(activeShapePoints, largeur, couleur, transparence, true));
            }
          } else if($('#clampligne').val() === 'noncolle') {
            if($('#styleligne').val() === 'simple') {
              line.push(globe.drawLine(activeShapePoints, largeur, couleur, transparence, false));
            } else if($('#styleligne').val() === 'pointille') {
              line.push(globe.drawDashLine(activeShapePoints, largeur, couleur, transparence, false));
            } else if($('#styleligne').val() === 'fleche') {
              line.push(globe.drawArrowLine(activeShapePoints, largeur, couleur, transparence, false));
            }
          }

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
      if(choice2 === 'dessin'){
        // garder les activeShapePoints définis permet l'affichage des mesures
        activeShapePoints = [];
      }
      globe.viewer.scene.requestRender();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // les 2 boutons "nouvelle mesure" pour la distance et surface: l'utilisateur est obligé d'appuyer dessus pour effectuer une nouvelle mesure
    $('.nouv').click(function(e) {
      activeShapePoints = [];
    });
  }

  // Enlève la dernière figure par catégorie (tableau lignes, surfaces etc)
  annulFigure(element, figure) {
    document.querySelector(element).addEventListener('click', (e) => {
      var lastLine = figure.pop();
      this.viewer.entities.remove(lastLine);
      this.viewer.scene.requestRender();
    });
  }

  // Supprime toutes les figures par catégorie
  supprFigure(element, figure) {
    document.querySelector(element).addEventListener('click', (e) => {
      for(var i = 0; i < figure.length+1; i++){
        this.viewer.entities.remove(figure[i]);
      }
      figure = [];
      this.viewer.scene.requestRender();
    });
  }

  // mesure de distance
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
      // convertit les coordonnées cartésiennes en lat/lon, puis en CC48
      var cartesian = new Cesium.Cartesian3(activeShapePoints[i].x, activeShapePoints[i].y, activeShapePoints[i].z);
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);
      let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);
      let height = cartographic.height.toFixed(3);

      var coords = proj4('EPSG:4326','EPSG:3948', [longitude, latitude]);
      // on stocke chque coordonnée dans un tableau séparé pour faliciter le calcul
      coordsX.push(coords[0]);
      coordsY.push(coords[1]);
      var z = (Number(height) - Number(this.raf09.getGeoide(latitude, longitude)));
      coordsZ.push(z);
    }

    for (let i=0; i < coordsX.length-1; i+=1) {
      // calcul de distances et différences d'alti
      var a = (coordsX[i+1]-coordsX[i])*(coordsX[i+1]-coordsX[i]);
      var b = (coordsY[i+1]-coordsY[i])*(coordsY[i+1]-coordsY[i]);
      var c = (coordsZ[i+1]-coordsZ[i])*(coordsZ[i+1]-coordsZ[i]);

      distance = Number(Math.sqrt(a+b).toFixed(3));
      distanceIncl = Number(Math.sqrt(a+b+c).toFixed(3));
      difference = Number(coordsZ[i+1]-coordsZ[i]).toFixed(3);

      this.distanceCumulee.innerHTML = (Number(this.distanceCumulee.innerHTML) + distance).toFixed(2);
      this.distanceInclineeC.innerHTML = (Number(this.distanceInclineeC.innerHTML) + distanceIncl).toFixed(2);
    }
    this.distance.innerHTML = distance.toFixed(2);
    this.distanceInclinee.innerHTML = distanceIncl.toFixed(2);
    this.hauteur.innerHTML = difference;
  }

  // mesure d'aire
  measureSurface(activeShapePoints) {
    var coordsX = [];
    var coordsY = [];
    var aire = 0;
    this.aire.innerHTML = 0;

    for (let i=0; i < activeShapePoints.length-1; i+=1) {
      // convertit les coordonnées cartésiennes en lat/lon, puis en CC48
      var cartesian = new Cesium.Cartesian3(activeShapePoints[i].x, activeShapePoints[i].y, activeShapePoints[i].z);
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(7);
      let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(7);

      var coords = proj4('EPSG:4326','EPSG:3948', [longitude, latitude]);
      coordsX.push(coords[0]);
      coordsY.push(coords[1]);
    }

    // dès qu'on a au moins 3 sommets
    if(coordsX.length > 2){
      for (let i=0; i < coordsX.length; i+=1) {
        // le % est un modulo qui permet de faire une boucle des sommets (ie sommet n+1 = sommet 1)
        var a = (coordsX[(i+1) % coordsX.length] - coordsX[i]);
        var b = (coordsY[(i+1) % coordsX.length] + coordsY[i] - (2 * coordsY[0]));
        var c = ((Number(a) * Number(b))/2);
        aire = (Number(aire) + Number(c)).toFixed(3);
      }
    }
    this.aire.innerHTML = Math.abs(aire);
  }

  // Récupère la hauteur d'un point en coords cartésiennes et la transforme en hauteur ellipsoïdale (pour le dessin de volumes)
  getHauteur(activeShapePoints, hauteurVol){
    var cartesian = new Cesium.Cartesian3(activeShapePoints[0].x, activeShapePoints[0].y, activeShapePoints[0].z);
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    let alti = cartographic.height.toFixed(3);

    var z = (Number(hauteurVol) + Number(alti));
    return z;
  }

  /*
  *
  * Découpe dans le photomaillage
  *
  */

  // ajoute les points et coupe aux positions définies
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

      // on ajoute visuellement des points pour la découpe qu'on supprimera au clic droit
      points.add({
        position : earthPosition,
        color : Cesium.Color.WHITE
      });

      dig_point.push(new Cesium.Cartesian3.fromDegrees(longitudeString, latitudeString));
      globe.viewer.scene.requestRender();
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.handler.setInputAction(function(event) {
      hole_pts = Array.from(dig_point);

      for (let i=0; i < coordsX.length; i+=1) {
        var a = (coordsX[(i+1) % coordsX.length] - coordsX[i]);
        var b = (coordsY[(i+1) % coordsX.length] + coordsY[i] - (2 * coordsY[0]));
        var c = ((Number(a) * Number(b))/2);
        aire = (Number(aire) + Number(c)).toFixed(3);
      }

      // si l'aire est négative (ie si l'utilisateur a dessiné sa figure dans le sens trigo)
      // on inverse le tableau de points pour que la découpe marche
      if(aire > 0) {
        globe.holePlanes(viewModel, hole_pts);
      } else if(aire < 0) {
        hole_pts = hole_pts.reverse();
        globe.holePlanes(viewModel, hole_pts);
      }
      points.removeAll();
      dig_point = [];
      globe.viewer.scene.requestRender();
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    // définit les actions sur les 2 options du formulaire (afficher ou inverser la découpe)
    Cesium.knockout.getObservable(viewModel, 'affich').subscribe(function(value) {
      tileset.clippingPlanes.enabled = value;
    });
    Cesium.knockout.getObservable(viewModel, 'trou').subscribe(function(value) {
      globe.holePlanes(viewModel, hole_pts);
    });
  }

  // ajoute les plans de coupe
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
    modelMatrix: Cesium.Matrix4.inverse(tileset._initialClippingPlanesOriginMatrix, new Cesium.Matrix4()) // ligne importante: on est obligés de passer par cette transfo de matrice car notre tileset n'a pas de matrice de transfo à la base
  });
}

/*
* fonction qui permet de cliquer les attributs sur le 3DTiles
*/
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

// supprime toutes les actions liées à la souris
supprSouris(){
  this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
  this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}


}
