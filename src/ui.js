"use strict";

// Gérer les interactions avec l'utilisateur (évènement sur le menu)
class Menu {

  /**
  * Le constructeur de la classe menu qui déclare toutes les variables utiles aux évènements
  *
  * @param  {Object} globe L'objet globe défini dans la classe Globe
  */
  constructor(globe){
    this.globe = globe;
    this.terrain = terrain; // format entités
    this.tileset = tileset; // format 3DTileset
    this.viewer = Globe.viewer;
    this.handler = Globe.handler;
    this.dataSources = globe.dataSources; // liste des dataSources (photomaillage, json, 3dtiles)

    // Récuperer les éléments du menu de gauche et de la boite à outils (pour l'affichage)
    this.menu = document.querySelector('#menu'); // le grand menu coulissant
    this.leftPane = document.querySelector('#left-pane'); // la zone à gauche après ce menu où s'affichent les légendes/formulaires
    this.dropdown = document.getElementsByClassName("panel-title"); // grands menus déroulants (catégorie PLU etc)
    this.deroulant = document.getElementsByClassName("deroulant"); // plus petits menus déroulants (sous catégorie PPRI etc)
    this.aideCheckbox = document.querySelector('.annotation'); // annotation en bas à droite
    // Div de la boite à outils
    this.mesuresDiv = document.querySelector('#mesures');
    this.constructionDiv = document.querySelector('#construction');
    this.coupeDiv = document.querySelector('#coupe');
    this.timeDiv = document.querySelector('#time');
    this.cameraDiv = document.querySelector('#camera');
    this.linkDiv = document.querySelector('#link');

    // Créer un gestionnaire pour les légendes
    this.legendManager = new LegendManager(this.leftPane);
    globe.legendManager = this.legendManager;

    /*
    *  Div qui contiennent les formulaires de personnalisation (affichés à gauche)
    */
    // mesures
    this.coordsList = document.querySelector('#coordsList');
    this.distanceList = document.querySelector('#distanceList');
    this.aireList = document.querySelector('#aireList');
    // dessin
    this.pointList = document.querySelector('#pointList');
    this.ligneList = document.querySelector('#ligneList');
    this.surfaceList = document.querySelector('#surfaceList');
    this.volumeList = document.querySelector('#volumeList');
    // coupe
    this.planList = document.querySelector('#planList');
    this.decoupeList = document.querySelector('#decoupeList');
    //camera & lien
    this.cameraList = document.querySelector('#cameraList');
    this.linkList = document.querySelector('#linkList');
    // choisir config
    this.configList = document.querySelector('#configList');
    // ajout de couches & classification des couches
    this.fileList = document.querySelector('#fileList');
    this.classifList = document.querySelector('#classifList');

    // Créer le calendrier pour l'affichage des ombres
    this.datepicker = $("#date")
    this.datepicker.datepicker();
    this.datepicker.datepicker("option", "dateFormat", "dd/mm/yy");
    // Récupérer la checkbox pour la classification du velum
    this.velumCouleurCheckbox = document.querySelector('#velumCouleur');

    // tableaux pour stocker les billboard des entités ponctuelles
    this.billboardArbre = [];
    this.billboardArbreRem = [];

    /*
    * Outil de découpe dans le photomaillage
    */
    this.viewModel = {
      affich : true,
      trou : false
    };

  }
  /*
  * Fin du constructeur
  */

  /**
  * Evenement pour les div déroulantes à l'intérieur du menu de gauche
  *
  * @param  {BoutonHTML} element Le bouton HTML sur lequel ajouter l'évènement
  */
  menuDeroulant(element){
    var i;
    for (i = 0; i < element.length; i++) {
      element[i].addEventListener('click', function() {
        this.classList.toggle("active");
        var dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === "block") {
          dropdownContent.style.display = "none";
        } else {
          dropdownContent.style.display = "block";
        }
      });
    }
  }

  /**
  * Affichage des divs dans la boîte à outils
  *
  * @param  {BoutonHTML} bouton Le bouton HTML sur lequel ajouter l'évènement
  * @param  {DivHTML} element La div HTML qui va s'afficher au déclenchement de l'évènement
  */
  menuClic(bouton, element) {
    document.querySelector(bouton).addEventListener('click', (e) => {
      $(element).show();
    });
  }

  /**
  * Permet de fermer les divs de la boîte à outils lorsqu'on clique ailleurs
  *
  * @param  {BoutonHTML} bouton Le bouton HTML sur lequel ajouter l'évènement
  * @param  {DivHTML} element La div HTML qui va s'afficher au déclenchement de l'évènement
  */
  windowClic(bouton, element) {
    window.addEventListener('click', function(event){
      var $trigger = $(bouton);
      if($trigger !== event.target && !$trigger.has(event.target).length){
        $(element).hide();
      }
    });
  }

  /**
  *
  *
  * Evenements sur toutes les checkbox, boutons dans le menu et toute la boîte à outils
  *
  *
  */

  evenementsCouches(){
    /*
    * Evenements d'ouverture des menus
    */

    // menu de gauche --> décale tous les éléments vers la droite
    document.querySelector("#left-pane #toggle-menu").addEventListener('click', (e) => {
      this.leftPane.classList.toggle('menu-open');
      this.menu.classList.toggle('menu-open');
      this.mesuresDiv.classList.toggle('menu-open');
      this.constructionDiv.classList.toggle('menu-open');
      this.coupeDiv.classList.toggle('menu-open');
      this.timeDiv.classList.toggle('menu-open');
      this.cameraDiv.classList.toggle('menu-open');
      this.linkDiv.classList.toggle('menu-open');
    });

    // menus déroulants et boite à outils
    this.menuDeroulant(this.dropdown);
    this.menuDeroulant(this.deroulant);
    this.menuClic("#boutonmesures", "#mesures-content");
    this.menuClic("#boutonconstruction", "#construction-content");
    this.menuClic("#boutoncoupe", "#coupe-content");
    this.menuClic("#boutontime", "#time-content");
    this.menuClic("#boutoncamera", "#camera-content");
    this.windowClic("#boutonmesures", "#mesures-content");
    this.windowClic("#boutonconstruction", "#construction-content");
    this.windowClic("#boutoncoupe", "#coupe-content");
    this.windowClic("#boutontime", "#time-content");
    this.windowClic("#boutoncamera", "#camera-content");

    /*
    * Ajout de couches
    */
    document.querySelector("#boutonfile").addEventListener('click', (e) => {
      // Ouvrir le formulaire correspondant
      this.fileList.classList.toggle('hidden');
      // Garder l'identifiant en mémoire pour éviter de le retaper à chaque fois
      if(localStorage.getItem("identifiant") != undefined) {
        document.getElementById("idEMS").value = localStorage.getItem("identifiant");
      }
    });

    // Appel des fonctions qui lisent les dossiers du serveur web
    this.getJson();
    this.get3DTiles();
    this.getDrawing();

    /*
    *bouton de configuration (affiche checkbox concernées) & réinitialisation (supprime toutes les checkbox)
    */
    document.querySelector("#config").addEventListener('click', (e) => {
      this.configList.classList.toggle('hidden');
    });
    document.querySelector("#reset").addEventListener('click', (e) => {
      hideElements();
    });
    document.querySelector("#configDefaut").addEventListener('click', (e) => {
      showElements();
      this.configList.classList.add('hidden');
    });
    document.querySelector("#configPLU").addEventListener('click', (e) => {
      initPLU();
      this.configList.classList.add('hidden');
    });
    document.querySelector("#configEco").addEventListener('click', (e) => {
      initEco();
      this.configList.classList.add('hidden');
    });

    // afficher les 2 photomaillages
    document.querySelector('#photoMaillage').addEventListener('change', (e) => {
      globe.show3DTiles(e.target.checked, 'photoMaillage', 'data/Photomaillage/Cesium_1.json');
    });
    document.querySelector('#photoMaillage2017').addEventListener('change', (e) => {
      globe.show3DTiles(e.target.checked, 'photoMaillage2017', '../Cesium/data/photoMaillage/EXPORT_Cesium_130.json');
    });


    /*
    *
    * Boite à outils
    *
    */

    //Tableaux pour les dessins/mesures d'entités : on fait un seul tableau dans la fonction
    // pour garder une trace des entités à tout moment
    // dessin
    var billboard = [];
    var line = [];
    var surface = [];
    var volume = [];
    // mesures
    var dline = [];
    var dsurface = [];
    // plan de coupe horizontal
    var planeEntities = [];
    var clippingPlanes = [];

    /*
    * MESURES
    */
    // Boutons radios
    // Les boutons radios suppriment les éléments liés aux autres boutons avant d'afficher leurs spécificités
    document.querySelector('#neutre').addEventListener('click', (e) => {
      // Tout effacer
      globe.supprSouris();
      this.coordsList.classList.add('hidden');
      this.distanceList.classList.add('hidden');
      this.aideCheckbox.classList.add('hidden');
      // Enlever les entités
      for(var i = 0; i < dline.length; i++){
        globe.viewer.entities.remove(dline[i]);
      }
      // Vider le tableau
      for(var j = 0; j <= dline.length+1; j++){
        dline.pop();
      }
      this.aireList.classList.add('hidden');
      this.aideCheckbox.classList.add('hidden');
      for(var i = 0; i < dsurface.length; i++){
        globe.viewer.entities.remove(dsurface[i]);
      }
      for(var j = 0; j <= dsurface.length+1; j++){
        dsurface.pop();
      }
      globe.viewer.scene.requestRender();
    });

    document.querySelector('#point').addEventListener('click', (e) => {
      globe.supprSouris();
      this.distanceList.classList.add('hidden');
      this.aideCheckbox.classList.add('hidden');
      this.aireList.classList.add('hidden');
      this.aideCheckbox.classList.add('hidden');

      this.coordsList.classList.remove('hidden');
      var coords = globe.showCoords();
      globe.viewer.scene.requestRender();
    });

    document.querySelector('#ligne').addEventListener('click', (e) => {
      globe.supprSouris();
      this.coordsList.classList.add('hidden');
      this.aireList.classList.add('hidden');
      this.aideCheckbox.classList.add('hidden');

      var choice = 'line';
      var choice2 = 'mesure';
      var hauteurVol;
      var url;
      globe.updateShape(choice, choice2, 3, '#FF0000', 1, hauteurVol, url, billboard, line, surface, volume, dline, dsurface);
      this.distanceList.classList.remove('hidden');
      this.aideCheckbox.classList.remove('hidden');
      globe.viewer.scene.requestRender();
    });

    document.querySelector('#surface').addEventListener('click', (e) => {
      globe.supprSouris();
      this.coordsList.classList.add('hidden');
      this.distanceList.classList.add('hidden');
      this.aideCheckbox.classList.add('hidden');

      var choice = 'polygon';
      var choice2 = 'mesure';
      var hauteurVol;
      var url;
      globe.updateShape(choice, choice2, 3, '#1ABFD0', 0.4, hauteurVol, url, billboard, line, surface, volume, dline, dsurface);
      this.aireList.classList.remove('hidden');
      this.aideCheckbox.classList.remove('hidden');
      globe.viewer.scene.requestRender();
    });

    /*
    *
    * DESSINS
    *
    */
    //Evenements pour l'ajout de l'entité
    document.querySelector("#envoyerpoint").addEventListener('click', (e) => {
      var choice = 'point';
      var choice2 = 'dessin';
      var transparence;
      var couleur = $('#couleurpoint').val();
      var largeur;
      var hauteurVol = $('#hauteurpoint').val();
      var url = 'Assets/Textures/maki/' + $('#makisymbol').val() + '.png';
      globe.updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol, url, billboard, line, surface, volume, dline, dsurface);
    });

    document.querySelector("#envoyerligne").addEventListener('click', (e) => {
      var choice = 'line';
      var choice2 = 'dessin';
      var hauteurVol;
      var url;
      var largeur = $('#largeur').val();
      var couleur = $('#couleur').val();
      var transparence = $('#transparence').val();
      globe.updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol, url, billboard, line, surface, volume, dline, dsurface);
    });

    document.querySelector("#envoyersurf").addEventListener('click', (e) => {
      var choice = 'polygon';
      var choice2 = 'dessin';
      var hauteurVol;
      var url;
      var largeur = 3;
      var couleur = $('#couleursurf').val();
      var transparence = $('#transparencesurf').val();
      globe.updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol, url, billboard, line, surface, volume, dline, dsurface);
    });

    document.querySelector("#envoyervol").addEventListener('click', (e) => {
      var choice = 'volume';
      var choice2 = 'dessin';
      var largeur = 3;
      var url;
      var hauteurVol = $('#hauteurvol').val();
      var couleur = $('#couleurvol').val();
      var transparence = $('#transparencevol').val();
      globe.updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol, url, billboard, line, surface, volume, dline, dsurface);
    });

    //Evenements pour la suppression / anunulation des dessins
    globe.annulFigure('#annulerpoint', billboard);
    globe.supprFigure('#supprimerpoint', billboard);
    globe.annulFigure('#annulerligne', line);
    globe.supprFigure('#supprimerligne', line);
    globe.annulFigure('#annulersurf', surface);
    globe.supprFigure('#supprimersurf', surface);
    globe.annulFigure('#annulervol', volume);
    globe.supprFigure('#supprimervol', volume);

    // Boutons radios pour l'affichage des formulaires de dessin
    document.querySelector('#cneutre').addEventListener('click', (e) => {
      globe.supprSouris();
      this.aideCheckbox.classList.add('hidden');
      this.pointList.classList.add('hidden');
      this.ligneList.classList.add('hidden');
      this.surfaceList.classList.add('hidden');
      this.volumeList.classList.add('hidden');
    });

    document.querySelector('#cpoint').addEventListener('click', (e) => {
      //globe.supprSouris();
      this.aideCheckbox.classList.add('hidden');
      this.ligneList.classList.add('hidden');
      this.surfaceList.classList.add('hidden');
      this.volumeList.classList.add('hidden');

      this.pointList.classList.remove('hidden');
    });

    document.querySelector('#cligne').addEventListener('click', (e) => {
      //globe.supprSouris();
      this.pointList.classList.add('hidden');
      this.surfaceList.classList.add('hidden');
      this.volumeList.classList.add('hidden');

      this.ligneList.classList.remove('hidden');
      this.aideCheckbox.classList.remove('hidden');
    });

    document.querySelector('#csurface').addEventListener('click', (e) => {
      //globe.supprSouris();
      this.pointList.classList.add('hidden');
      this.ligneList.classList.add('hidden');
      this.volumeList.classList.add('hidden');

      this.surfaceList.classList.remove('hidden');
      this.aideCheckbox.classList.remove('hidden');
    });

    document.querySelector('#volume').addEventListener('click', (e) => {
      //globe.supprSouris();
      this.pointList.classList.add('hidden');
      this.ligneList.classList.add('hidden');
      this.surfaceList.classList.add('hidden');

      this.volumeList.classList.remove('hidden');
      this.aideCheckbox.classList.remove('hidden');
    });

    // supprime toutes les entités
    document.querySelector('#suppr').addEventListener('click', function() {
      globe.viewer.entities.removeAll();
      for(var i = 0; i <= billboard.length+1; i++){
        billboard.pop();
      }
      for(var i = 0; i <= line.length+1; i++){
        line.pop();
      }
      for(var i = 0; i <= surface.length+1; i++){
        surface.pop();
      }
      for(var i = 0; i <= volume.length+1; i++){
        volume.pop();
      }
    });

    /*
    *
    *  Export des dessins
    *
    */
    document.querySelector("#exportDessin").addEventListener('click', (e) => {
      // on donne la structure au json
      let jsonGlob = {};
      jsonGlob = {"type" : "FeatureCollection", "features" : []};
      let features = [];

      // Export des entités ligne
      for (let i = 0; i < line.length; i++) {
        let j = 0;
        // le tableaux dans lequel on va mettre les coordonnées des sommets de la ligne
        let coordLine = [];
        // On récupère la valeur de chaque coordonnée X Y Z
        while (j < line[i].polyline.positions._value.length) {
          // Structure json
          var type = {"type" : "Feature", "properties" : {}, "geometry" : {}};
          type["geometry"] = {"type" : "LineString", "coordinates" : []};

          // Conversion des coordonnées cartesiennes en lat/long
          let cartesian = new Cesium.Cartesian3(line[i].polyline.positions._value[j].x, line[i].polyline.positions._value[j].y, line[i].polyline.positions._value[j].z);
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let coordXY = [Number(longitude), Number(latitude)];
          coordLine.push(coordXY);
          j++;
        }

        // On récupère la valeur rgba de la couleur
        type["properties"].color = {};
        type["properties"]["color"].red = line[i].polyline.material.color._value.red;
        type["properties"]["color"].green = line[i].polyline.material.color._value.green;
        type["properties"]["color"].blue = line[i].polyline.material.color._value.blue;
        type["properties"]["color"].alpha = line[i].polyline.material.color._value.alpha;

        // la valeur de la largeur de la ligne
        type["properties"].width = line[i].polyline.width._value;

        // On met les coordonées dans le tableau
        type["geometry"].coordinates = coordLine;
        // On les ajoute à la liste des features
        features.push(type);
      }

      // Export des entités billboard (ie des points)
      for (let i = 0; i < billboard.length; i++) {
        // Structure du json
        var typePoint = {"type" : "Feature", "properties" : {}, "geometry" : {}};
        typePoint["geometry"] = {"type" : "Point", "coordinates" : {}};

        // Certaines entités n'ont pas la position définie car les marker sont créés de manière asynchrone
        if(Cesium.defined(billboard[i].position._value)) {
          let cartesian = new Cesium.Cartesian3(billboard[i].position._value.x, billboard[i].position._value.y, billboard[i].position._value.z);
          // Conversion des coordonnées cartesiennes en lat/long
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let z = cartographic.height;
          let coordXYZ = [Number(longitude), Number(latitude), Number(z)];

          // On exporte la hauteur du point
          let hauteur = billboard[i].billboard.height._value;
          typePoint["properties"].height = hauteur;

          // On ne sait pas exporter les entités maki donc on met une image unique
          typePoint["properties"].image = 'src/img/interface.png';

          // Les coordonnées ponctuelles n'ont qu'une seule coordonnée et donc pas besoin de 2 array
          typePoint["geometry"].coordinates = coordXYZ;
          features.push(typePoint);
        }
      }

      // Export des surfaces
      for (let i = 0; i < surface.length; i++) {
        let coordSurf = [];
        let arraySurf = [];
        let k = 0;
        while (k < surface[i].polygon.hierarchy._value.length) {
          var typeSurf = {"type" : "Feature", "properties" : {}, "geometry" : {}};
          typeSurf["geometry"] = {"type" : "Polygon",  "coordinates" : [[]]};

          let cartesian = new Cesium.Cartesian3(surface[i].polygon.hierarchy._value[k].x, surface[i].polygon.hierarchy._value[k].y, surface[i].polygon.hierarchy._value[k].z);
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let coordXY = [Number(longitude), Number(latitude)];
          coordSurf.push(coordXY);
          k++;
        }

        // on rajoute la première coordonnée à la fin de la liste pour permettre l'affichage
        let cartesian = new Cesium.Cartesian3(surface[i].polygon.hierarchy._value[0].x, surface[i].polygon.hierarchy._value[0].y, surface[i].polygon.hierarchy._value[0].z);
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let longitude = Cesium.Math.toDegrees(cartographic.longitude);
        let latitude = Cesium.Math.toDegrees(cartographic.latitude);
        let coordXY = [Number(longitude), Number(latitude)];
        coordSurf.push(coordXY);

        typeSurf["properties"].color = {};
        typeSurf["properties"]["color"].red = surface[i].polygon.material.color._value.red;
        typeSurf["properties"]["color"].green = surface[i].polygon.material.color._value.green;
        typeSurf["properties"]["color"].blue = surface[i].polygon.material.color._value.blue;
        typeSurf["properties"]["color"].alpha = surface[i].polygon.material.color._value.alpha;

        // il faut une array de plus pour les coordonnées des polygon pour que Cesium arrive à lire le JSON
        arraySurf.push(coordSurf);
        typeSurf["geometry"].coordinates = arraySurf;
        features.push(typeSurf);
      }

      // Export des volumes, ie des surfaces avec un attribut 'extrudedHeight'
      for (let i = 0; i < volume.length; i++) {
        let coordVol = [];
        let arrayVol = [];
        let k = 0;
        while (k < volume[i].polygon.hierarchy._value.length) {
          var typeVol = {"type" : "Feature", "properties" : {}, "geometry" : {}};
          typeVol["geometry"] = {"type" : "Polygon",  "coordinates" : [[]]};

          let cartesian = new Cesium.Cartesian3(volume[i].polygon.hierarchy._value[k].x, volume[i].polygon.hierarchy._value[k].y, volume[i].polygon.hierarchy._value[k].z);
          let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          let longitude = Cesium.Math.toDegrees(cartographic.longitude);
          let latitude = Cesium.Math.toDegrees(cartographic.latitude);
          let coordXY = [Number(longitude), Number(latitude)];
          coordVol.push(coordXY);
          k++;
        }

        // on rajoute la première coordonnée à la fin de la liste pour permettre l'affichage
        let cartesian = new Cesium.Cartesian3(volume[i].polygon.hierarchy._value[0].x, volume[i].polygon.hierarchy._value[0].y, volume[i].polygon.hierarchy._value[0].z);
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let longitude = Cesium.Math.toDegrees(cartographic.longitude);
        let latitude = Cesium.Math.toDegrees(cartographic.latitude);
        let coordXY = [Number(longitude), Number(latitude)];
        coordVol.push(coordXY);

        typeVol["properties"].color = {};
        typeVol["properties"]["color"].red = volume[i].polygon.material.color._value.red;
        typeVol["properties"]["color"].green = volume[i].polygon.material.color._value.green;
        typeVol["properties"]["color"].blue = volume[i].polygon.material.color._value.blue;
        typeVol["properties"]["color"].alpha = volume[i].polygon.material.color._value.alpha;

        typeVol["properties"].extrudedHeight = volume[i].polygon.extrudedHeight._value;

        // il faut une accolade de plus pour les coordonnées des polygon pour que Cesium arrive à lire le JSON
        arrayVol.push(coordVol);
        typeVol["geometry"].coordinates = arrayVol;
        features.push(typeVol);
      }

      // Une fois toutes les features ajoutées dans l'array, on la définit dans le JSON
      jsonGlob["features"] = features;

      // On transforme la string en un JSON
      var download = JSON.stringify(jsonGlob);

      // Téléchargement du fichier drawing.json
      let element = document.querySelector('#exportDessin');
      element.setAttribute('href', 'data:json,' + encodeURIComponent(download));
      element.setAttribute('download', 'drawing.json');

    });

    /*
    * Decoupes
    */
    // Evenement pour l'ajout du plan
    document.querySelector("#envoyercoupe").addEventListener('click', (e) => {
      var X = $('#X').val();
      var Y = $('#Y').val();
      var hauteur = $('#hauteurcoupe').val();
      var longueur = $('#longueurcoupe').val();
      var largeur = $('#largeurcoupe').val();
      var couleur = $('#couleurcoupe').val();
      globe.addClippingPlanes(X, Y, hauteur, longueur, largeur, couleur, planeEntities, clippingPlanes);
    });
    // Evenement pour l'affichage du formulaire
    document.querySelector('#plancoupe').addEventListener('change', (e) => {
      if(e.target.checked){
        globe.coordCoupe();
        this.planList.classList.remove('hidden');
      } else {
        this.planList.classList.add('hidden');
        globe.supprSouris();
      }
    });
    // Suppression/ annulation des plans de coupe
    document.querySelector("#annulercoupe").addEventListener('click', (e) => {
      var annul = planeEntities.length-1;
      this.viewer.entities.remove(planeEntities[annul]);
      planeEntities.pop();
      clippingPlanes = [];
      this.viewer.scene.requestRender();
    });
    document.querySelector("#supprimercoupe").addEventListener('click', (e) => {
      //this.viewer.entities.remove(planeEntity);
      for(var i = 0; i < planeEntities.length; i++){
        this.viewer.entities.remove(planeEntities[i]);
      }
      clippingPlanes = [];
      this.viewer.scene.requestRender();
    });


    // Decoupe dans le photomaillage
    var toolbar = document.getElementById('toolbar');
    Cesium.knockout.track(this.viewModel);
    globe.viewer.scene.requestRender();
    Cesium.knockout.applyBindings(this.viewModel, toolbar);
    globe.viewer.scene.requestRender();

    document.querySelector('#decoupe').addEventListener('change', (e) => {
      if(e.target.checked){
        this.decoupeList.classList.remove('hidden');
      } else {
        this.decoupeList.classList.add('hidden');
        globe.supprSouris();
      }
    });

    document.querySelector("#envoyerdecoupe").addEventListener('click', (e) => {
      globe.createHole(this.viewModel);
      globe.viewer.scene.requestRender();
    });

    /*
    * Ombres
    */
    document.querySelector('#shadows').addEventListener('change', function(e){
      globe.shadow(e.target.checked);
    });
    // Créé le calendrier
    this.datepicker.on('change', () => {
      this.onDateChanged(this.datepicker.val());
    });

    /*
    *  Ajout de points de vue de caméra
    */
    document.querySelector("#ajoutercamera").addEventListener('click', function() {
      var nom = $('#nomcamera').val();
      var viewPoint = globe.addViewPoint(nom);

      document.querySelector('#cameraList').classList.add('hidden');
      document.getElementById("nomcamera").value = '';

      let position = new Cesium.Cartesian3(globe.viewer.camera.positionWC.x, globe.viewer.camera.positionWC.y, globe.viewer.camera.positionWC.z);
      let heading = globe.viewer.camera.heading;
      let pitch = globe.viewer.camera.pitch;
      let roll = globe.viewer.camera.roll;

      viewPoint.addEventListener('click', function() {
        globe.fly(position, heading, pitch, roll);
      });

    });

    document.querySelector('#addcamera').addEventListener('click', (e) => {
      this.cameraList.classList.toggle('hidden');
    });
    document.querySelector('#nord').addEventListener('click', function() {
      globe.fly(globe.viewer.camera.position, Cesium.Math.toRadians(0.0), Cesium.Math.toRadians(-90), 0);
    });
    document.querySelector('#ouest').addEventListener('click', function() {
      globe.fly(globe.viewer.camera.position, Cesium.Math.toRadians(-90), Cesium.Math.toRadians(-90), 0);
    });
    document.querySelector('#est').addEventListener('click', function() {
      globe.fly(globe.viewer.camera.position, Cesium.Math.toRadians(90), Cesium.Math.toRadians(-90), 0);
    });
    document.querySelector('#sud').addEventListener('click', function() {
      globe.fly(globe.viewer.camera.position, Cesium.Math.toRadians(180), Cesium.Math.toRadians(-90), 0);
    });
    document.querySelector('#cathedrale').addEventListener('click', function() {
      var position = new Cesium.Cartesian3(4189249.7037263233, 570120.9393585781, 4760103.226866859);
      globe.fly(position, 0.154, -0.712, 0);
    });
    document.querySelector('#stade').addEventListener('click', function() {
      var position = new Cesium.Cartesian3(4191131.537797537, 570676.907960483, 4758499.857702635);
      globe.fly(position, 0.347, -0.759, 0);
    });
    document.querySelector('#centre').addEventListener('click', function() {
      var position = new Cesium.Cartesian3(4189625.3805890195, 570566.3438953182, 4759621.616047475);
      globe.fly(position, 4.402, -0.653, 6.279);
    });

    /*
    * Création du lien de partage
    */
    document.querySelector("#addlink").addEventListener('click', function() {
      globe.createLink();
    });

    document.querySelector('#boutonlink').addEventListener('click', (e) => {
      this.linkList.classList.toggle('hidden');
    });

    /*
    *
    * Toutes les couches présentes
    *
    */
    //PLU
    document.querySelector('#ER').addEventListener('change', (e) => {
      let colors = {
        'Emplacement_réservé': '#F32525'
      }

      if(e.target.checked){
        this.legendManager.addLegend('ER', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('ER');
      }

      globe.showJson(e.target.checked, 'ER', 'data/geojson/empl_reserve.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'type_prescription',
        colors: colors,
        alpha: 0.7
      });
    });

    document.querySelector('#marge').addEventListener('change', (e) => {
      let colors = {
        'Marge_voirie': '#FF9E00',
        'Marge_cours_eau': '#0CB5D1',
        'Marge_voie_ferree': '#D93008',
        'Marge_lisiere': '#EED32E'
      }

      if(e.target.checked){
        this.legendManager.addLegend('margeRecul', colors, 'line');
      } else{
        this.legendManager.removeLegend('margeRecul');
      }

      globe.showJson(e.target.checked, 'margeRecul', 'data/geojson/marge_surf.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'sous_type',
        colors: colors,
        alpha: 0.7
      });
    });

    document.querySelector('#ensPaysager').addEventListener('change', (e) => {
      let color = {
        'Ensemble_paysager': '#063868'
      }

      if(e.target.checked){
        this.legendManager.addLegend('ensPaysager', color, 'polygon');
      } else{
        this.legendManager.removeLegend('ensPaysager');
      }

      globe.showJson(e.target.checked, 'ens_paysager', 'data/geojson/ens_paysager.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'sous_type',
        colors: color,
        alpha: 0.7
      });
    });

    document.querySelector('#batiInteressant').addEventListener('change', (e) => {
      let colors = {
        'Bati_intéressant': '#11C7E9'
      }

      if(e.target.checked){
        this.legendManager.addLegend('batimentsInteressant', colors, 'polygon'); // Création de la légende qui a l'ID 'batiments' avec ces couleurs
      } else{
        this.legendManager.removeLegend('batimentsInteressant'); // Suppression de la légende qui a l'ID 'batiments'
      }

      globe.showJson(e.target.checked, 'bati_interessant', 'data/geojson/bati_interessant.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'sous_type',
        colors: colors,
        alpha: 0.5
      });
    });

    document.querySelector('#batiExceptionnel').addEventListener('change', (e) => {
      let colors = {
        'Bati_exceptionnel': '#0C77D9'
      }

      if(e.target.checked){
        this.legendManager.addLegend('batimentsExceptionnel', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('batimentsExceptionnel');
      }

      globe.showJson(e.target.checked, 'bati_exceptionnel', 'data/geojson/bati_exceptionnel.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'sous_type',
        colors: colors,
        alpha: 0.6
      });
    });

    document.querySelector('#continuite').addEventListener('change', (e) => {
      let color = {
        'Continuité_écologique': '#00741D'
      }

      if(e.target.checked){
        this.legendManager.addLegend('continuite', color, 'polygon');
      } else{
        this.legendManager.removeLegend('continuite');
      }

      globe.showJson(e.target.checked, 'continuite_eco', 'data/geojson/cont_ecologique.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'sous_type',
        colors: color,
        alpha: 0.5
      });
    });

    document.querySelector('#plante').addEventListener('change', (e) => {
      let color = {
        'Espace_planté': '#39BC56',
      }

      if(e.target.checked){
        this.legendManager.addLegend('plante', color, 'polygon');
      } else{
        this.legendManager.removeLegend('plante');
      }

      globe.showJson(e.target.checked, 'espaces_plantes', 'data/geojson/esp_plante.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'sous_type',
        colors: color,
        alpha: 0.5
      });
    });

    document.querySelector('#jardin').addEventListener('change', (e) => {
      let color = {
        'Jardin_devant': '#42B50C',
      }

      if(e.target.checked){
        this.legendManager.addLegend('jardin', color, 'line');
      } else{
        this.legendManager.removeLegend('jardin');
      }

      globe.showJson(e.target.checked, 'jardin', 'data/geojson/jardin_surf.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'name',
        colors: color,
        alpha: 1
      });
    });

    document.querySelector('#alignement').addEventListener('change', (e) => {
      let color = {
        'Alignement_arbres': '#C6BC00',
      }

      if(e.target.checked){
        this.legendManager.addLegend('aligne', color, 'line');
      } else{
        this.legendManager.removeLegend('aligne');
      }

      globe.showJson(e.target.checked, 'alignement', 'data/geojson/alignement_surf.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'sous_type',
        colors: color,
        alpha: 0.5
      });
    });

    document.querySelector('#arbre').addEventListener('change', (e) => {
      let color = {
        'Arbre_PLU': '#8AC467',
      }

      if(e.target.checked){
        this.legendManager.addLegend('arbre', color, 'point', "<img src='src/img/icons8-treeblue.png'>");
      } else{
        this.legendManager.removeLegend('arbre');
      }

      globe.showJson(e.target.checked, 'arbre', 'data/geojson/arbres.json', undefined, Cesium.Color.fromCssColorString('#05A197').withAlpha(0.1), 'src/img/icons8-treeblue.png', 'point' , this.billboardArbre, {
      });
    });


    // ECOLOGIE
    document.querySelector('#zhaverees').addEventListener('change', (e) => {
      let color = {
        'Zone_humide_avérée': '#A551ED'
      }

      if(e.target.checked){
        this.legendManager.addLegend('zh_averees', color, 'polygon');
      } else{
        this.legendManager.removeLegend('zh_averees');
      }

      globe.showJson(e.target.checked, 'zones_humides', 'data/geojson/zh_averees.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'name',
        colors: color,
        alpha: 0.4
      });
    });

    document.querySelector('#pollue').addEventListener('change', (e) => {
      let color = {
        'Sol_pollué': '#84560D'
      }

      if(e.target.checked){
        this.legendManager.addLegend('sol_pollue', color, 'polygon');
      } else{
        this.legendManager.removeLegend('sol_pollue');
      }

      globe.showJson(e.target.checked, 'solpollue', 'data/geojson/sol_pollue.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'sous_type',
        colors: color,
        alpha: 0.4
      });
    });

    document.querySelector('#risquetechno').addEventListener('change', (e) => {
      let color = {
        'Risque_technologique': '#D40606'
      }

      if(e.target.checked){
        this.legendManager.addLegend('risquetechno', color, 'polygon');
      } else{
        this.legendManager.removeLegend('risquetechno');
      }

      globe.showJson(e.target.checked, 'risque_techno', 'data/geojson/risque_techno.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'sous_type',
        colors: color,
        alpha: 0.4
      });
    });

    document.querySelector('#arbresRem').addEventListener('change', (e) => {
      let color = {
        'Arbre_remarquable': '#8AC467',
      }

      if(e.target.checked){
        this.legendManager.addLegend('arbreRem', color, 'point', "<img src='src/img/icons8-tree.png'>");
      } else{
        this.legendManager.removeLegend('arbreRem');
      }

      globe.showJson(e.target.checked, 'arbreRem', 'data/geojson/arbres_rem.json', undefined, Cesium.Color.fromCssColorString('#05A119').withAlpha(0.1), 'src/img/icons8-tree.png', 'point', this.billboardArbreRem, {
      });
    });

    document.querySelector('#tvbCorridor').addEventListener('change', (e) => {
      let color = {
        'TVB_Corridors': '#24B9E0'
      }

      if(e.target.checked){
        this.legendManager.addLegend('trame', color, 'polygon');
      } else{
        this.legendManager.removeLegend('trame');
      }

      globe.showJson(e.target.checked, 'trame_verte_bleue', 'data/geojson/tvb.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'name',
        colors: color,
        alpha: 0.4
      });
    });

    document.querySelector('#tvbReservoir').addEventListener('change', (e) => {
      let color = {
        'TVB_reservoir': '#1FDED8'
      }

      if(e.target.checked){
        this.legendManager.addLegend('trameReservoir', color, 'polygon');
      } else{
        this.legendManager.removeLegend('trameReservoir');
      }

      globe.showJson(e.target.checked, 'trameReservoir', 'data/geojson/tvb_reservoir.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'name',
        colors: color,
        alpha: 0.4
      });
    });

    document.querySelector('#ppriNappe').addEventListener('change', (e) => {
      let color = {
        '<0m_(nappe_débordante)': '#FF0000',
        '0-1m': '#CE6A27'
      }

      if(e.target.checked){
        this.legendManager.addLegend('nappe', color, 'polygon');
      } else{
        this.legendManager.removeLegend('nappe');
      }

      globe.showJson(e.target.checked, 'nappe', 'data/geojson/ppri_nappe.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'classe',
        colors: color,
        alpha: 0.4
      });
    });

    document.querySelector('#ppriRemont').addEventListener('change', (e) => {
      let colors = {
        'Zone_verte': '#014F03',
        'Zone_vert_clair': '#0E8E12'
      }

      if(e.target.checked){
        this.legendManager.addLegend('remont', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('remont');
      }

      globe.showJson(e.target.checked, 'remontee', 'data/geojson/ppri_innond_remontee.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'nom',
        colors: colors,
        alpha: 0.4
      });
    });

    document.querySelector('#ppriSub').addEventListener('change', (e) => {
      let colors = {
        'Sous_zone_bleu_clair_hachuree': '#40839A',
        'Zone_rouge_clair': '#EC2B2B',
        'Zone_rouge_fonce': '#A70505',
        'Zone_bleu_clair': '#049AD6',
        'Zone_de_securite':'#9300ED',
        'Zone_bleu_fonce_hachuree': '#0013ED',
        'Zone_orange': '#E6840A'

      }

      if(e.target.checked){
        this.legendManager.addLegend('submersion', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('submersion');
      }

      globe.showJson(e.target.checked, 'submersion', 'data/geojson/ppri_innond_debord.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'nom',
        colors: colors,
        alpha: 0.4
      });
    });

    document.querySelector('#reservoirA').addEventListener('change', (e) => {
      let color = {
        'Réservoir_arboré': '#A2A706'
      }

      if(e.target.checked){
        this.legendManager.addLegend('reservoirA', color, 'polygon');
      } else{
        this.legendManager.removeLegend('reservoirA');
      }

      globe.showJson(e.target.checked, 'tnu_reservoirA', 'data/geojson/tnu_reserv_arbore.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'name',
        colors: color,
        alpha: 0.4
      });
    });

    document.querySelector('#reservoirH').addEventListener('change', (e) => {
      let color = {
        'Réservoir_herbacé': '#5FA706'
      }

      if(e.target.checked){
        this.legendManager.addLegend('reservoirH', color, 'polygon');
      } else{
        this.legendManager.removeLegend('reservoirH');
      }

      globe.showJson(e.target.checked, 'tnu_reservoirH', 'data/geojson/tnu_reservoir_herbace.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'name',
        colors: color,
        alpha: 0.4
      });
    });

    document.querySelector('#corridorH').addEventListener('change', (e) => {
      let color = {
        'Corridor_herbacé': '#06A783'
      }

      if(e.target.checked){
        this.legendManager.addLegend('corridorH', color, 'polygon');
      } else{
        this.legendManager.removeLegend('corridorH');
      }

      globe.showJson(e.target.checked, 'tnu_corridorH', 'data/geojson/tnu_corridor_herbace.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'name',
        colors: color,
        alpha: 0.4
      });
    });

    document.querySelector('#corridorA').addEventListener('change', (e) => {
      let color = {
        'Corridor_arboré': '#D7C518'
      }

      if(e.target.checked){
        this.legendManager.addLegend('corridorA', color, 'polygon');
      } else{
        this.legendManager.removeLegend('corridorA');
      }

      globe.showJson(e.target.checked, 'tnu_corridorA', 'data/geojson/tnu_corridor_arbore.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'name',
        colors: color,
        alpha: 0.4
      });
    });

    // Reglementaire
    document.querySelector('#monument').addEventListener('change', (e) => {
      let colors = {
        'classé': '#D1D716',
        'inscrit': '#F07200'
      }

      if(e.target.checked){
        this.legendManager.addLegend('monuments_historiques', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('monuments_historiques');
      }

      globe.showJson(e.target.checked, 'monuments_historiques', 'data/geojson/monument_histo.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'type_entite',
        colors: colors,
        alpha: 0.6
      });
    });

    // Divers
    document.querySelector('#danube').addEventListener('change', (e) => {
      globe.show3DTiles(e.target.checked, 'danube', 'data/Danube/tileset.json');
    });

    document.querySelector('#velo').addEventListener('change', (e) => {
      let colors = {
        '1': '#DEA11F'
      }

      globe.showJson(e.target.checked, 'velo', 'data/geojson/trajet_velo.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'id',
        colors: colors,
        alpha: 0.6
      });
    });

    document.querySelector('#velosurf').addEventListener('change', (e) => {
      let colors = {
        'velo': '#DEA11F'
      }

      if(e.target.checked){
        this.legendManager.addLegend('velosurf', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('velosurf');
      }

      globe.showJson(e.target.checked, 'velosurf', 'data/geojson/velo_surf.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'id',
        colors: colors,
        alpha: 0.6
      });
    });

    document.querySelector('#velum').addEventListener('change', (e) => {
      if(e.target.checked == false){
        this.velumCouleurCheckbox.checked = false;
      }
      globe.show3DTiles(e.target.checked, 'velum', 'data/Velum3D/tileset.json');
    });

    this.velumCouleurCheckbox.addEventListener('change', (e) => {
      this.couleurVelum(e.target.checked);

      let legendColors = {
        'HT': '#C29D00',
        'ET': '#E77200',
        'NR': '#949DA5'
      }

      if(e.target.checked){
        this.legendManager.addLegend('velumCouleur', legendColors, 'polygon');
        globe.handleBatimentClick(e.target.checked, this.dataSources['velum']);
      } else{
        this.legendManager.removeLegend('velumCouleur');
        globe.supprSouris();
      }
    });

    document.querySelector('#administratif').addEventListener('change', (e) => {
      let colors = {
        'administratif': '#DEC01F'
      }

      if(e.target.checked){
        this.legendManager.addLegend('administratif', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('administratif');
      }

      globe.showJson(e.target.checked, 'administratif', 'data/geojson/batipublic_administratif.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'categorie',
        colors: colors,
        alpha: 0.6
      });
    });

    document.querySelector('#religieux').addEventListener('change', (e) => {
      let colors = {
        'religieux': '#5604C4'
      }

      if(e.target.checked){
        this.legendManager.addLegend('religieux', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('religieux');
      }

      globe.showJson(e.target.checked, 'religieux', 'data/geojson/batipublic_religieux.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'categorie',
        colors: colors,
        alpha: 0.6
      });
    });

    document.querySelector('#culturel').addEventListener('change', (e) => {
      let colors = {
        'culturel': '#1FBDDE'
      }

      if(e.target.checked){
        this.legendManager.addLegend('culturel', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('culturel');
      }

      globe.showJson(e.target.checked, 'culturel', 'data/geojson/batipublic_culturel.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'categorie',
        colors: colors,
        alpha: 0.6
      });
    });

    document.querySelector('#social').addEventListener('change', (e) => {
      let colors = {
        'social': '#E36100'
      }

      if(e.target.checked){
        this.legendManager.addLegend('social', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('social');
      }

      globe.showJson(e.target.checked, 'social', 'data/geojson/batipublic_social.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'categorie',
        colors: colors,
        alpha: 0.6
      });
    });

    document.querySelector('#historique').addEventListener('change', (e) => {
      let colors = {
        'historique': '#E3002B'
      }

      if(e.target.checked){
        this.legendManager.addLegend('historique', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('historique');
      }

      globe.showJson(e.target.checked, 'historique', 'data/geojson/batipublic_historique.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'categorie',
        colors: colors,
        alpha: 0.6
      });
    });

    document.querySelector('#sante').addEventListener('change', (e) => {
      let colors = {
        'sante': '#10AA7E'
      }

      if(e.target.checked){
        this.legendManager.addLegend('sante', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('sante');
      }

      globe.showJson(e.target.checked, 'sante', 'data/geojson/batipublic_sante.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'categorie',
        colors: colors,
        alpha: 0.6
      });
    });

    document.querySelector('#sportif').addEventListener('change', (e) => {
      let colors = {
        'sportif': '#0F4CEF'
      }

      if(e.target.checked){
        this.legendManager.addLegend('sportif', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('sportif');
      }

      globe.showJson(e.target.checked, 'sportif', 'data/geojson/batipublic_sportif.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'categorie',
        colors: colors,
        alpha: 0.6
      });
    });

    document.querySelector('#enseignement').addEventListener('change', (e) => {
      let colors = {
        'enseignement': '#008B1F'
      }

      if(e.target.checked){
        this.legendManager.addLegend('enseignement', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('enseignement');
      }

      globe.showJson(e.target.checked, 'enseignement', 'data/geojson/batipublic_enseignement.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'categorie',
        colors: colors,
        alpha: 0.6
      });
    });

    document.querySelector('#autre').addEventListener('change', (e) => {
      let colors = {
        'autre': '#DD3588',
        'ordre_secours': '#B30E38',
        'industr_techno': '#9BB24C',
        'transport': '#9D7534'
      }

      if(e.target.checked){
        this.legendManager.addLegend('autre', colors, 'polygon');
      } else{
        this.legendManager.removeLegend('autre');
      }

      globe.showJson(e.target.checked, 'autre', 'data/geojson/batipublic_autre.json', undefined, undefined , undefined, undefined, undefined, {
        classification: true,
        classificationField: 'categorie',
        colors: colors,
        alpha: 0.6
      });
    });

  }

  /*
  *
  * Fin de la fonction evenementsCouches
  */

  /**
  * Ajoute une source de données à la liste en donnant son nom "name" et la datasource "value"
  *
  * @param  {String} name Le nom qu'on souhaite donner à la datasource
  * @param  {Object} value La valeur qu'on donne à la dataSource
  */
  addDataSource(name, value){
    this.dataSources[name] = value;
  }

  /**
  * Mise a jour de la timeline lorsque l'utilisateur choisit une date dans le calendrier
  *
  * @param  {Object} value La valeur de la date rentrée dans le calendrier
  */
  onDateChanged(value){
    let date = value.split('/');

    let day = date[0];
    let month = date[1];
    let year = date[2];

    let startTime = Cesium.JulianDate.fromIso8601(year + '-' + month + '-' + day + 'T00:00:00Z');
    let stopTime = Cesium.JulianDate.fromIso8601(year + '-' + month + '-' + day + 'T23:59:59Z');

    this.globe.viewer.timeline.zoomTo(startTime, stopTime); // Définit la portion visible de la timeline
  }


  /**
  * Classification du 3Dtiles velum en fonction de la valeur de l'attribut 'classif'
  *
  * @param  {String} show le paramètre qui spécifie quand l'affichage doit être actif - prend la valeur e.target.checked ou non
  */
  couleurVelum(show){
    if(this.dataSources.velum === undefined || this.dataSources.velum.show == false){
      alert("Vous devez afficher le velum pour utiliser cette fonction");
      this.velumCouleurCheckbox.checked = false;
      return;
    }

    let color = undefined;
    if(show){
      color = {
        conditions: [
          ["${CLASSIF} === 'HT'", "color('#C29D00', 0.7)"],
          ["${CLASSIF} === 'ET'", "color('#E77200', 0.7)"],
          ["${CLASSIF} === 'NR'", "color('#949DA5', 0.7)"],
          ["true", "color('#1F85DE')"]
        ]
      };
    } else{
      color = {
        conditions: [
          ["true", "color('#FFFFFF'), 0.3"]
        ]
      };
    }

    // Construire et appliquer le style au tileset
    this.dataSources.velum.style = new Cesium.Cesium3DTileStyle({
      color: color
    });
  }

  /**
  * Ajout de couches interactif
  * Principe: on a un serveur web qui permet d'avoir les fichiers au format http (Cesium n'accepte pas les fichiers stockés en
  * local pour des raisons de crossOrigin), on veut récupérer une liste de tous les fichiers présents dans un dossier spécifique.
  * On envoie la requête sur le serveur qui nous donne la liste au format texte, on récupère tous les noms de fichiers et
  * on s'en sert pour créer les liens d'accès jusqu'aux json
  *
  * @return {Object} la liste des fichiers sur le serveur web
  *
  */
  getJson() {
    var result = []; // tableau pour stocker les éléments du dossier
    var noms = []; // stocke les noms des couches
    var json = []; // stocke les liens vers les json associés au nom

    var id = []; // tableau unitaire 1, 2, 3 jusqu'à 100
    // permet de donner un identifiant aux couches
    // on ne peut pas avoir plus de 100 fichiers présents dans le dossier du serveur
    var N = 100;
    for (var i = 1; i <= N; i++) {
      id.push(i);
    }

    var valeurClassif = []; // champ de texte utlisé pour la classification
    var couleurClassif = []; // couleur associée

    document.querySelector('#affichercouche').addEventListener('click', function() {
      document.querySelector('#affichercouche').classList.add('hidden'); // on ne peut afficher qu'un seul contenu de dossier par session
      localStorage.setItem('identifiant', $('#idEMS').val()); // on enregistre l'identifiant dans la mémoire du navigateur (cookie)
      var identifiant = localStorage.getItem('identifiant'); // et on le récupère

      var filePath = 'http://127.1.0.0:8000/' + identifiant + '/json/'; // donne le chemin d'accès au dossier

      var xmlhttp = new XMLHttpRequest();
      this.xmlhttp = this;
      xmlhttp.open("GET", filePath, true);
      xmlhttp.onreadystatechange = function () {
        if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {

          let html = xmlhttp.responseText; // renvoie un texte au format html où la liste des fichers est dans une li
          result = $(html).find("li > a"); // on récupère tous les li

          for(let i=0;i<result.length;i++) {
            noms.push(result[i].innerText);
            json.push(filePath + result[i].innerText);

            // créé les boutons qui récupère les infos du serveur et s'affiche dans la div fileList
            var couche = document.createElement("BUTTON");
            couche.innerHTML = noms[i];
            document.getElementById("fileList").appendChild(couche);
            var espace = document.createElement("br");
            document.getElementById("fileList").appendChild(espace);

            // Lorsqu'on clique sur un des boutons, ouvre un menu de classification et créé une checkbox dans l'onglet "mes couches"
            couche.addEventListener('click', (e) => {
              var divClone = $("#classifList").clone(); // on garde en mémoire l'état d'origine pour le remettre une fois une couche ajoutée
              document.querySelector('#fileList').classList.add('hidden');
              document.querySelector('#classifList').classList.remove('hidden');

              document.querySelector('#ajoutertype').addEventListener('click', function() {
                if($('#typeclassif').val() === 'ponctuelle') {
                  document.querySelector('#ponctuelleDiv').classList.remove('hidden');
                  document.querySelector('#ajouterclassif').classList.remove('hidden');
                  document.querySelector('#ajoutertype').classList.add('hidden');
                  document.querySelector('#choixDiv').classList.add('hidden');
                } else if($('#typeclassif').val() === 'surfacique') {
                  document.querySelector('#surfaciqueDiv').classList.remove('hidden');
                  document.querySelector('#ajouterclassif').classList.remove('hidden');
                  document.querySelector('#ajoutertype').classList.add('hidden');
                  document.querySelector('#choixDiv').classList.add('hidden');
                }
              });

              // A chaque clic, ajoute les 2 div pour classifier
              document.querySelector('#addclassif').addEventListener('click', function() {
                let divValClassif = document.createElement("input");
                divValClassif.type = "text";
                divValClassif.size = 10;
                divValClassif.classList.add('valeurclassif');
                let valText = document.createElement('span');
                valText.innerHTML = 'Valeur : ';

                let divCouleurClassif = document.createElement("input");
                divCouleurClassif.type = "color";
                divCouleurClassif.value = '#FFFFFF';
                divCouleurClassif.classList.add('couleurclassif');
                let coulText = document.createElement('span');
                coulText.innerHTML = 'Couleur : ';

                var espace2 = document.createElement("br");
                var espace3 = document.createElement("br");
                document.getElementById("classifForm").appendChild(valText);
                document.getElementById("classifForm").appendChild(divValClassif);
                document.getElementById("classifForm").appendChild(espace2);
                document.getElementById("classifForm").appendChild(coulText);
                document.getElementById("classifForm").appendChild(divCouleurClassif);
                document.getElementById("classifForm").appendChild(espace3);

              });

              // Lorsqu'on a tout classifié, on récupère les valeurs de classif et créé la checkbox dans l'onglet "mes couches"
              document.querySelector('#ajouterclassif').addEventListener('click', function() {
                let item = document.createElement('div');
                item.classList.add('nowrap');
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name = noms[i];
                checkbox.id = id[i];

                let label = document.createElement('label');
                label.htmlFor = id[i];
                label.appendChild(document.createTextNode(noms[i]));
                item.appendChild(checkbox);
                item.appendChild(label);
                document.getElementById("mescouches").appendChild(item);

                // données surfaciques
                var champ = $('#classif').val();
                var transparence = $('#classiftransparence').val();
                valeurClassif = $('.valeurclassif').map(function() {
                  return $(this).val();
                }).get();
                couleurClassif = $('.couleurclassif').map(function() {
                  return $(this).val();
                }).get();

                var colors = new Map();
                for(let j=0; j<valeurClassif.length; j++) {
                  colors[valeurClassif[j]] = couleurClassif[j];
                }

                // données ponctuelles
                var couleur = $('#classifpoint').val();
                var url = $('#makiclassif').val();

                document.querySelector('#classifList').classList.add('hidden');
                $("#classifList").replaceWith(divClone); // pour avoir une div vierge lors de l'ajout de la prochaine couche

                // L'evenement pour afficher la nouvelle couche
                checkbox.addEventListener('change', (e) => {
                  globe.showJson(e.target.checked, noms[i], json[i], url, Cesium.Color.fromCssColorString(couleur), undefined, undefined, undefined, {
                    classification: true,
                    classificationField: champ,
                    colors: colors,
                    alpha: transparence
                  });
                });
              });
            });
          }
        }
      };

      xmlhttp.send();
    });
  }

  /**
  * Ajout de couches interactif
  * La même fonction qui récupère les données dans le dossier 3dtiles et affiche la couche
  * pas de classification simple pour les 3dtiles
  *
  */
  get3DTiles() {
    var result = [];
    var noms = [];
    var json = [];
    var id = [];
    var N = 100;
    for (var i = 1; i <= N; i++) {
      id.push(i);
    }

    document.querySelector('#affichercouche').addEventListener('click', function() {
      document.querySelector('#affichercouche').classList.add('hidden');
      var identifiant = localStorage.getItem('identifiant');


      var filePath = 'http://127.1.0.0:8000/' + identifiant + '/3dtiles/';

      var xmlhttp = new XMLHttpRequest();
      this.xmlhttp = this;

      xmlhttp.open("GET", filePath, true);
      xmlhttp.onreadystatechange = function () {
        if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {

          let html = xmlhttp.responseText;
          result = $(html).find("li > a");

          for(let i=0;i<result.length;i++) {
            noms.push(result[i].innerText);
            json.push(filePath + result[i].innerText + 'tileset.json');

            // créé les boutons qui récupère les infos du serveur
            var couche = document.createElement("BUTTON");
            couche.innerHTML = noms[i];
            document.getElementById("fileList").appendChild(couche);
            let espace = document.createElement("br");
            document.getElementById("fileList").appendChild(espace);

            // Pour chaque bouton, créé une checkbox dans l'onglet "mes couches"
            couche.addEventListener('click', (e) => {
              document.querySelector('#fileList').classList.add('hidden');

              let item = document.createElement('div');
              item.classList.add('nowrap');
              let checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.name = noms[i];
              checkbox.id = id[i];
              let label = document.createElement('label');
              label.htmlFor = id[i];
              label.appendChild(document.createTextNode(noms[i]));
              item.appendChild(checkbox);
              item.appendChild(label);
              document.getElementById("mescouches").appendChild(item);

              checkbox.addEventListener('change', (e) => {
                globe.show3DTiles(e.target.checked, 'test', json[i]);
              });

            });
          }
        }
      };

      xmlhttp.send();
    });
  }

  /**
  * Ajout de couches interactif
  * Et une 3ème fois la même fonction pour récupérer le contenu du dossier drawings et l'afficher
  *
  */
  getDrawing() {
    var result = []; // tableau pour stocker les éléments du dossier
    var noms = []; // stocke les noms des couches
    var json = []; // stocke les liens vers les json associés au nom

    var id = []; // tableau unitaire 1, 2, 3 jusqu'à 100
    // permet de donner un identifiant aux couches
    // on ne peut pas avoir plus de 100 fichiers présents dans le dossier du serveur
    var N = 100;
    for (var i = 1; i <= N; i++) {
      id.push(i);
    }

    var valeurClassif = []; // champ de texte utlisé pour la classification
    var couleurClassif = []; // couleur associée

    // variables neutres qui servent lors de l'appel de la fonction showJson
    var symbol;
    var couleur = 'FFFFFF';
    var options;

    document.querySelector('#affichercouche').addEventListener('click', function() {
      document.querySelector('#affichercouche').classList.add('hidden'); // on ne peut afficher qu'un seul contenu de dossier par session
      localStorage.setItem('identifiant', $('#idEMS').val()); // on enregistre l'identifiant dans la mémoire du navigateur (cookie)
      var identifiant = localStorage.getItem('identifiant'); // et on le récupère

      var filePath = 'http://127.1.0.0:8000/' + identifiant + '/drawing/'; // donne le chemin d'accès au dossier

      var divClone = $("#classifList").clone(); // on garde en mémoire l'état d'origine pour le remettre une fois une couche ajoutée

      var xmlhttp = new XMLHttpRequest();
      this.xmlhttp = this;
      xmlhttp.open("GET", filePath, true);
      xmlhttp.onreadystatechange = function () {
        if(xmlhttp.readyState === 4 && xmlhttp.status === 200) {

          let html = xmlhttp.responseText; // renvoie un texte au format html où la liste des fichers est dans une li
          result = $(html).find("li > a"); // on récupère tous les li


          for(let i=0;i<result.length;i++) {
            noms.push(result[i].innerText);
            json.push(filePath + result[i].innerText);

            // créé les boutons qui récupère les infos du serveur
            var couche = document.createElement("BUTTON");
            couche.innerHTML = noms[i];
            document.getElementById("fileList").appendChild(couche);
            let espace = document.createElement("br");
            document.getElementById("fileList").appendChild(espace);

            // Pour chaque bouton, créé une checkbox dans l'onglet "mes couches"
            couche.addEventListener('click', (e) => {
              document.querySelector('#fileList').classList.add('hidden');

              let item = document.createElement('div');
              item.classList.add('nowrap');
              let checkbox = document.createElement("input");
              checkbox.type = "checkbox";
              checkbox.name = noms[i];
              checkbox.id = id[i];
              let label = document.createElement('label');
              label.htmlFor = id[i];
              label.appendChild(document.createTextNode(noms[i]));
              item.appendChild(checkbox);
              item.appendChild(label);
              document.getElementById("mescouches").appendChild(item);

              // L'evenement pour afficher la nouvelle couche
              checkbox.addEventListener('change', (e) => {
                if(e.target.checked){
                  if(globe.dataSources[noms[i]] === undefined){
                    globe.loadDrawing(json[i], noms[i], options);
                  } else{
                    globe.dataSources[noms[i]].show = true;
                    globe.viewer.scene.requestRender();
                  }
                } else{
                  if(globe.dataSources[noms[i]] !== undefined){
                    globe.dataSources[noms[i]].show = false;
                    globe.viewer.scene.requestRender();
                  }
                }
              });
            });
          }
        }
      };

      xmlhttp.send();
    });
  }

  /*
  * Fin de la classe Menu
  */

}
