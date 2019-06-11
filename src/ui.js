"use strict";

// Gérer les interactions avec l'utilisateur (évènement sur le menu)
class Menu {

  constructor(globe){
    this.globe = globe;
    this.terrain = terrain; // format entités
    this.tileset = tileset; // format 3DTileset

    this.viewer = Globe.viewer;
    this.handler = Globe.handler;

    // boutons de personnalisation
    this.addFile = document.querySelector("#boutonfile");
    this.config = document.querySelector("#config");
    this.reset = document.querySelector("#reset");
    this.configDefaut = document.querySelector("#configDefaut");
    this.configPLU = document.querySelector("#configPLU");
    this.configEco = document.querySelector("#configEco");

    // Récuperer les éléments du menu de gauche
    this.leftPane = document.querySelector('#left-pane');
    this.menu = document.querySelector('#menu');
    this.dropdown = document.getElementsByClassName("panel-title");
    this.deroulant = document.getElementsByClassName("deroulant");

    // Créer un gestionnaire pour les légendes
    this.legendManager = new LegendManager(this.leftPane);

    // Formulaires
    this.distanceList = document.querySelector('#distanceList');
    this.aireList = document.querySelector('#aireList');
    this.planList = document.querySelector('#planList');
    this.ligneList = document.querySelector('#ligneList');
    this.surfaceList = document.querySelector('#surfaceList');
    this.pointList = document.querySelector('#pointList');
    this.volumeList = document.querySelector('#volumeList');
    this.fileList = document.querySelector('#fileList');
    this.configList = document.querySelector('#configList');
    this.decoupeList = document.querySelector('#decoupeList');
    this.cameraList = document.querySelector('#cameraList');

    // annotation en bas à droite
    this.aideCheckbox = document.querySelector('.annotation');

    // Affichage des couches
    this.photoMaillageCheckbox = document.querySelector('#photoMaillage');
    // PLU
    this.ERCheckbox = document.querySelector('#ER');
    this.margeCheckbox = document.querySelector('#marge');
    this.ensPaysagerCheckbox = document.querySelector('#ensPaysager');
    this.batiInteressantCheckbox = document.querySelector('#batiInteressant');
    this.batiExceptionnelCheckbox = document.querySelector('#batiExceptionnel');
    this.planteCheckbox = document.querySelector('#plante');
    this.continuiteCheckbox = document.querySelector('#continuite');
    this.jardinCheckbox = document.querySelector('#jardin');
    this.alignementCheckbox = document.querySelector('#alignement');
    this.arbreCheckbox = document.querySelector('#arbre');
    // Ecologie
    this.trameCheckbox = document.querySelector('#tvb');
    this.zhAvereesCheckbox = document.querySelector('#zhaverees');
    this.solPollueCheckbox = document.querySelector('#pollue');
    this.risqueTechnoCheckbox = document.querySelector('#risquetechno');
    this.arbreRemCheckbox = document.querySelector('#arbresRem');
    this.ppriNappeCheckbox = document.querySelector('#ppriNappe');
    this.ppriRemontCheckbox = document.querySelector('#ppriRemont');
    this.ppriSubCheckbox = document.querySelector('#ppriSub');
    this.corridorHCheckbox = document.querySelector('#corridorH');
    this.corridorACheckbox = document.querySelector('#corridorA');
    this.reservoirHCheckbox = document.querySelector('#reservoirH');
    this.reservoirACheckbox = document.querySelector('#reservoirA');
    //Reglementaire
    this.monumentCheckbox = document.querySelector('#monument');
    //Divers
    this.velumCheckbox = document.querySelector('#velum');
    this.velumCouleurCheckbox = document.querySelector('#velumCouleur');
    this.administratifCheckbox = document.querySelector('#administratif');
    this.religieuxCheckbox = document.querySelector('#religieux');
    this.culturelCheckbox = document.querySelector('#culturel');
    this.enseignementCheckbox = document.querySelector('#enseignement');
    this.socialCheckbox = document.querySelector('#social');
    this.santeCheckbox = document.querySelector('#sante');
    this.sportifCheckbox = document.querySelector('#sportif');
    this.historiqueCheckbox = document.querySelector('#historique');

    //Boite à outils
    // boutons de la boite à outils
    this.mesuresContent = document.querySelector('#mesures-content');
    this.constructionContent = document.querySelector('#construction-content');
    this.coupeContent = document.querySelector('#coupe-content');
    this.timeContent = document.querySelector('#time-content');
    this.cameraContent = document.querySelector('#camera-content');
    this.mesuresDiv = document.querySelector('#mesures');
    this.constructionDiv = document.querySelector('#construction');
    this.coupeDiv = document.querySelector('#coupe');
    this.timeDiv = document.querySelector('#time');
    this.cameraDiv = document.querySelector('#camera');
    // mesures
    this.coordsCheckbox = document.querySelector('#point');
    this.ligneCheckbox = document.querySelector('#ligne');
    this.surfaceCheckbox = document.querySelector('#surface');
    //construction
    this.cpointCheckbox = document.querySelector('#cpoint');
    this.cligneCheckbox = document.querySelector('#cligne');
    this.csurfaceCheckbox = document.querySelector('#csurface');
    this.volumeCheckbox = document.querySelector('#volume');
    this.supprCheckbox = document.querySelector("#suppr");
    // plan de coupe
    this.coupeCheckbox = document.querySelector('#plancoupe');
    this.decoupeCheckbox = document.querySelector('#decoupe');
    // ombres
    this.shadowCheckbox = document.querySelector('#shadows');
          // Créer le datepicker
    this.datepicker = $("#date")
    this.datepicker.datepicker();
    this.datepicker.datepicker("option", "dateFormat", "dd/mm/yy");
    // caméra
    this.addCamera = document.querySelector('#addcamera');
    this.nordCheckbox = document.querySelector('#nord');
    this.ouestCheckbox = document.querySelector('#ouest');
    this.estCheckbox = document.querySelector('#est');
    this.sudCheckbox = document.querySelector('#sud');
    this.cathedraleCheckbox = document.querySelector('#cathedrale');
    this.centreCheckbox = document.querySelector('#centre');
    this.stadeCheckbox = document.querySelector('#stade');

    // Créer la liste des dataSource sous forme d'un object clé / valeur
    // Avec le nom de la source comme clé et la dataSource comme valeur
    this.dataSources = [];

    // Evenements pour le menu de gauche
    this.openMenu();
    this.menuDeroulant(this.dropdown);
    this.menuDeroulant(this.deroulant);
    this.menuClic("#boutonmesures", this.mesuresContent);
    this.menuClic("#boutonconstruction", this.constructionContent);
    this.menuClic("#boutoncoupe", this.coupeContent);
    this.menuClic("#boutontime", this.timeContent);
    this.menuClic("#boutoncamera", this.cameraContent);

    //Variables pour les formulaires
    var point = [];
    var volume = [];
    var surface = [];
    var billboard = [];
    var line = [];
    var dline = [];
    var dline2 = [];
    var dsurface = [];
    var planeEntities = [];
    var clippingPlanes = [];
    var box = [];

    //Evenements pour les boutons des formulaires
    document.querySelector("#envoyerligne").addEventListener('click', (e) => {
      var choice = 'line';
      var choice2 = 'construction';
      var hauteurVol;
      let showCouleur = document.querySelector("#showcouleurligne");
      var largeur = $('#largeur').val();
      var couleur = $('#couleur').val();
      var transparence = $('#transparence').val();
      showCouleur.style.backgroundColor = couleur;

      globe.updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol, point, billboard, line, surface, volume, dline, dline2, dsurface);

    });

    document.querySelector("#envoyersurf").addEventListener('click', (e) => {
      var choice = 'polygon';
      var choice2 = 'construction';
      var hauteurVol;
      var largeur = 3;
      let showCouleur = document.querySelector("#showcouleursurf");

      var couleur = $('#couleursurf').val();
      var transparence = $('#transparencesurf').val();
      showCouleur.style.backgroundColor = couleur;

      globe.updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol, point, billboard, line, surface, volume, dline, dline2, dsurface);

    });

    document.querySelector("#envoyervol").addEventListener('click', (e) => {
      var choice = 'volume';
      var choice2 = 'construction';
      var largeur = 3;
      let showCouleur = document.querySelector("#showcouleurvol");

      var hauteurVol = $('#hauteurvol').val();
      var couleur = $('#couleurvol').val();
      var transparence = $('#transparencevol').val();
      showCouleur.style.backgroundColor = couleur;

      globe.updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol, point, billboard, line, surface, volume, dline, dline2, dsurface);

    });

    document.querySelector("#envoyercoupe").addEventListener('click', (e) => {
      var orientation1 = 0.0;
      var orientation2 = -1.0;
      let showCouleur = document.querySelector("#showcouleurcoupe");
      var X = $('#X').val();
      var Y = $('#Y').val();
      var hauteur = $('#hauteurcoupe').val();
      var longueur = $('#longueurcoupe').val();
      var largeur = $('#largeurcoupe').val();
      var couleur = $('#couleurcoupe').val();
      showCouleur.style.backgroundColor = couleur;

      globe.addClippingPlanes(orientation1, orientation2, X, Y, hauteur, longueur, largeur, couleur, planeEntities, clippingPlanes);
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
    globe.annulCoupe(planeEntities, clippingPlanes);
    globe.supprCoupe(planeEntities, clippingPlanes);

    // decoupe
    this.viewModel = {
      affich : true,
      trou : false
    };

    var toolbar = document.getElementById('toolbar');
    Cesium.knockout.track(this.viewModel);
    Cesium.knockout.applyBindings(this.viewModel, toolbar);

    document.querySelector("#envoyerdecoupe").addEventListener('click', (e) => {
      globe.createHole(this.viewModel);
    });

    document.querySelector("#ajoutercamera").addEventListener('click', (e) => {
      var nom = $('#nomcamera').val();
      globe.addViewPoint(nom);
    });

    //globe.getOrientation();

  }

  openMenu(){
    // Crée l'évènement qui permet d'ouvrir le menu
    document.querySelector("#left-pane #toggle-menu").addEventListener('click', (e) => {
      this.leftPane.classList.toggle('menu-open');
      this.menu.classList.toggle('menu-open');
      this.mesuresDiv.classList.toggle('menu-open');
      this.constructionDiv.classList.toggle('menu-open');
      this.coupeDiv.classList.toggle('menu-open');
      this.timeDiv.classList.toggle('menu-open');
      this.cameraDiv.classList.toggle('menu-open');
    });
  }

  // Evenement pour les menus déroulants
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

  menuClic(bouton, element) {
    document.querySelector(bouton).addEventListener('click', (e) => {
      /*if (!e.target.matches(bouton)) {
      if (element.classList.contains('show')) {
      element.classList.remove('show');
    }
  }*/
  element.classList.toggle('show');
});
}

// Fonctions pour controler le loader
showLoader(){
  document.querySelector('#loadingIndicator').classList.remove('hidden');
}

hideLoader(){
  document.querySelector('#loadingIndicator').classList.add('hidden');
}

// enregistre toutes les actions sur les boutons (menus de gauche + boite à outils)
evenementsCouches(){

  this.addFile.addEventListener('click', (e) => {
    this.fileList.classList.toggle('hidden');
    this.formulaireFichier();
  });

  //configuration
  this.config.addEventListener('click', (e) => {
    this.configList.classList.toggle('hidden');
  });
  this.reset.addEventListener('click', (e) => {
    hideElements();
  });

  this.configDefaut.addEventListener('click', (e) => {
    showElements();
  });
  this.configPLU.addEventListener('click', (e) => {
    initPLU();
  });
  this.configEco.addEventListener('click', (e) => {
    initEco();
  });

  this.photoMaillageCheckbox.addEventListener('change', (e) => {
    this.show('photoMaillage', 'data/Photomaillage/Cesium_1.json', Globe.prototype.load3DTiles.bind(this.globe), e.target.checked);
  });

  this.shadowCheckbox.addEventListener('change', function(e){
    globe.shadow(e.target.checked);
  });

  // Créé le date picker
  this.datepicker.on('change', () => {
    this.onDateChanged(this.datepicker.val());
  });

  // Boite à outils
  this.coordsCheckbox.addEventListener('change', (e) => {
    globe.showCoords(e.target.checked);
  });

  this.ligneCheckbox.addEventListener('change', (e) => {
    var choice = 'line';
    var choice2 = 'mesure';
    var hauteurVol;
    var point = [];
    var dline = [];
    var dline2 = [];
    var surface;
    var billboard;
    var line;
    var volume;
    var dsurface;

    if(e.target.checked){
      globe.updateShape(choice, choice2, 3, '#FF0000', 1, hauteurVol, point, billboard, line, surface, volume, dline, dline2, dsurface);
      this.distanceList.classList.remove('hidden');
      this.aideCheckbox.classList.remove('hidden');
    } else{
      this.distanceList.classList.add('hidden');
      this.aideCheckbox.classList.add('hidden');
      globe.supprSouris();
    }
  });

  this.surfaceCheckbox.addEventListener('change', (e) => {
    var choice = 'polygon';
    var choice2 = 'mesure';
    var hauteurVol;
    var point = [];
    var dline;
    var dline2;
    var surface;
    var billboard;
    var line;
    var volume;
    var dsurface = [];

    if(e.target.checked){
      globe.updateShape(choice, choice2, 3, '#1ABFD0', 0.4, hauteurVol, point, billboard, line, surface, volume, dline, dline2, dsurface);
      this.aireList.classList.remove('hidden');
      this.aideCheckbox.classList.remove('hidden');
    } else{
      this.aireList.classList.add('hidden');
      this.aideCheckbox.classList.add('hidden');
      globe.supprSouris();
    }
  });

  this.cpointCheckbox.addEventListener('change', (e) => {
    var choice = 'point';
    var choice2 = 'construction';
    var transparence;
    var couleur;
    var largeur;
    var hauteurVol;
    var point = [];
    var dline;
    var dline2;
    var surface;
    var billboard = [];
    var line;
    var volume;
    var dsurface;

    if(e.target.checked){
      this.pointList.classList.remove('hidden');
      globe.updateShape(choice, choice2, largeur, couleur, transparence, hauteurVol, point, billboard, line, surface, volume, dline, dline2, dsurface);
    } else{
      this.pointList.classList.add('hidden');
      globe.supprSouris();
    }

  });

  this.cligneCheckbox.addEventListener('change', (e) => {
    if(e.target.checked){
      this.ligneList.classList.remove('hidden');
      this.aideCheckbox.classList.remove('hidden');
    } else{
      this.ligneList.classList.add('hidden');
      this.aideCheckbox.classList.add('hidden');
      globe.supprSouris();
    }

  });

  this.csurfaceCheckbox.addEventListener('change', (e) => {
    if(e.target.checked){
      this.surfaceList.classList.remove('hidden');
      this.aideCheckbox.classList.remove('hidden');
    } else{
      this.surfaceList.classList.add('hidden');
      this.aideCheckbox.classList.add('hidden');
      globe.supprSouris();
    }
  });

  this.volumeCheckbox.addEventListener('change', (e) => {
    if(e.target.checked){
      this.volumeList.classList.remove('hidden');
      this.aideCheckbox.classList.remove('hidden');
    } else{
      this.volumeList.classList.add('hidden');
      this.aideCheckbox.classList.add('hidden');
      globe.supprSouris();
    }
  });

  this.coupeCheckbox.addEventListener('change', (e) => {
    if(e.target.checked){
      globe.coordCoupe("X", "Y", "hauteurcoupe");
      this.planList.classList.remove('hidden');
    } else {
      this.planList.classList.add('hidden');
      globe.supprSouris();
    }
  });

  this.decoupeCheckbox.addEventListener('change', (e) => {
    if(e.target.checked){
      this.decoupeList.classList.remove('hidden');
    } else {
      this.decoupeList.classList.add('hidden');
      globe.supprSouris();
    }
  });

  this.supprCheckbox.addEventListener('click', function() {
    globe.supprEntities();
  });

  //caméra
  this.addCamera.addEventListener('click', (e) => {
    this.cameraList.classList.toggle('hidden');
  });

  this.nordCheckbox.addEventListener('click', function() {
    globe.flyTo(globe.viewer.camera.position, Cesium.Math.toRadians(0.0), Cesium.Math.toRadians(-90), 0);
  });

  this.ouestCheckbox.addEventListener('click', function() {
    globe.flyTo(globe.viewer.camera.position, Cesium.Math.toRadians(90), Cesium.Math.toRadians(-90), 0);
  });

  this.estCheckbox.addEventListener('click', function() {
    globe.flyTo(globe.viewer.camera.position, Cesium.Math.toRadians(-90), Cesium.Math.toRadians(-90), 0);
  });

  this.sudCheckbox.addEventListener('click', function() {
    globe.flyTo(globe.viewer.camera.position, Cesium.Math.toRadians(180), Cesium.Math.toRadians(-90), 0);
  });

  this.cathedraleCheckbox.addEventListener('click', function() {
    var position = new Cesium.Cartesian3(4189249.7037263233, 570120.9393585781, 4760103.226866859);
    globe.flyTo(position, 0.154, -0.712, 0);
  });

  this.stadeCheckbox.addEventListener('click', function() {
    var position = new Cesium.Cartesian3(4191131.537797537, 570676.907960483, 4758499.857702635);
    globe.flyTo(position, 0.347, -0.759, 0);
  });

  this.centreCheckbox.addEventListener('click', function() {
    var position = new Cesium.Cartesian3(4189625.3805890195, 570566.3438953182, 4759621.616047475);
    globe.flyTo(position, 4.402, -0.653, 6.279);
  });


  // Couches en surbrillance
  //PLU
  this.ERCheckbox.addEventListener('change', (e) => {
    let colors = {
      'Emplacement_réservé': '#F32525'
    }

    if(e.target.checked){
      this.legendManager.addLegend('ER', colors, 'polygon');
    } else{
      this.legendManager.removeLegend('ER');
    }

    this.show('ER', 'data/geojson/empl_reserve.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'type_prescription',
      colors: colors,
      alpha: 0.7
    });

  });

  this.margeCheckbox.addEventListener('change', (e) => {
    let colors = {
      'Marge_voirie': '#FF5D00',
      'Marge_cours_eau': '#8B601F',
      'Marge_voie_ferree': '#760808',
      'Marge_lisiere': '#E18FB5'
    }

    if(e.target.checked){
      this.legendManager.addLegend('margeRecul', colors, 'line');
    } else{
      this.legendManager.removeLegend('margeRecul');
    }

    this.show('margeRecul', 'data/geojson/marge_surf.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'sous_type',
      colors: colors,
      alpha: 0.7
    });

  });

  this.ensPaysagerCheckbox.addEventListener('change', (e) => {
    let color = {
      'Ensemble_paysager': '#063868'
    }

    if(e.target.checked){
      this.legendManager.addLegend('ensPaysager', color, 'polygon');
    } else{
      this.legendManager.removeLegend('ensPaysager');
    }

    this.show('ens_paysager', 'data/geojson/ens_paysager.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'sous_type',
      colors: color,
      alpha: 0.7
    });

  });

  this.batiInteressantCheckbox.addEventListener('change', (e) => {
    let colors = {
      'Bati_intéressant': '#11C7E9'
    }

    if(e.target.checked){
      this.legendManager.addLegend('batimentsInteressant', colors, 'polygon'); // Création de la légende qui a l'ID 'batiments' avec ces couleurs
    } else{
      this.legendManager.removeLegend('batimentsInteressant'); // Suppression de la légende qui a l'ID 'batiments'
    }

    this.show('bati_interessant', 'data/geojson/bati_interessant.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'sous_type',
      colors: colors,
      alpha: 0.5
    });

  });

  this.batiExceptionnelCheckbox.addEventListener('change', (e) => {
    let colors = {
      'Bati_exceptionnel': '#0C77D9'
    }

    if(e.target.checked){
      this.legendManager.addLegend('batimentsExceptionnel', colors, 'polygon');
    } else{
      this.legendManager.removeLegend('batimentsExceptionnel');
    }

    this.show('bati_exceptionnel', 'data/geojson/bati_exceptionnel.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'sous_type',
      colors: colors,
      alpha: 0.6
    });
    //globe.loadGeoJson('data/geojson/bati_exceptionnel.json');

  });

  this.continuiteCheckbox.addEventListener('change', (e) => {
    let color = {
      'Continuité_écologique': '#00741D'
    }

    if(e.target.checked){
      this.legendManager.addLegend('continuite', color, 'polygon');
    } else{
      this.legendManager.removeLegend('continuite');
    }

    this.show('continuite_eco', 'data/geojson/cont_ecologique.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'sous_type',
      colors: color,
      alpha: 0.5
    });
  });

  this.planteCheckbox.addEventListener('change', (e) => {
    let color = {
      'Espace_planté': '#39BC56',
    }

    if(e.target.checked){
      this.legendManager.addLegend('plante', color, 'polygon');
    } else{
      this.legendManager.removeLegend('plante');
    }

    this.show('espaces_plantes', 'data/geojson/esp_plante.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'sous_type',
      colors: color,
      alpha: 0.5
    });
  });

  this.jardinCheckbox.addEventListener('change', (e) => {
    let color = {
      'Jardin_devant': '#42B50C',
    }

    if(e.target.checked){
      this.legendManager.addLegend('jardin', color, 'line');
    } else{
      this.legendManager.removeLegend('jardin');
    }

    this.show('jardin', 'data/geojson/jardin_surf.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'sous_type',
      colors: color,
      alpha: 1
    });
  });

  this.alignementCheckbox.addEventListener('change', (e) => {
    let color = {
      'Alignement_arbres': '#C6BC00',
    }

    if(e.target.checked){
      this.legendManager.addLegend('aligne', color, 'line');
    } else{
      this.legendManager.removeLegend('aligne');
    }

    this.show('alignement', 'data/geojson/alignement_surf.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'sous_type',
      colors: color,
      alpha: 0.5
    });
  });

  this.arbreCheckbox.addEventListener('change', (e) => {
    let color = {
      'Arbre_PLU': '#8AC467',
    }

    if(e.target.checked){
      this.legendManager.addLegend('arbre', color, 'point');
    } else{
      this.legendManager.removeLegend('arbre');
    }

    this.show('arbre', 'data/geojson/arbres.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'name',
      colors: color,
      alpha: 0.4
    });
  });


  // ECOLOGIE
  this.trameCheckbox.addEventListener('change', (e) => {
    let color = {
      'TVB': '#24B9E0'
    }

    if(e.target.checked){
      this.legendManager.addLegend('trame', color, 'polygon');
    } else{
      this.legendManager.removeLegend('trame');
    }

    this.show('trame_verte_bleue', 'data/geojson/tvb.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'name',
      colors: color,
      alpha: 0.4
    });
  });

  this.zhAvereesCheckbox.addEventListener('change', (e) => {
    let color = {
      'Zone_humide_avérée': '#A551ED'
    }

    if(e.target.checked){
      this.legendManager.addLegend('zh_averees', color, 'polygon');
    } else{
      this.legendManager.removeLegend('zh_averees');
    }

    this.show('zones_humides', 'data/geojson/zh_averees.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'name',
      colors: color,
      alpha: 0.4
    });
  });

  this.solPollueCheckbox.addEventListener('change', (e) => {
    let color = {
      'Sol_pollué': '#84560D'
    }

    if(e.target.checked){
      this.legendManager.addLegend('sol_pollue', color, 'polygon');
    } else{
      this.legendManager.removeLegend('sol_pollue');
    }

    this.show('solpollue', 'data/geojson/sol_pollue.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'sous_type',
      colors: color,
      alpha: 0.4
    });
  });

  this.risqueTechnoCheckbox.addEventListener('change', (e) => {
    let color = {
      'Risque_technologique': '#D40606'
    }

    if(e.target.checked){
      this.legendManager.addLegend('risquetechno', color, 'polygon');
    } else{
      this.legendManager.removeLegend('risquetechno');
    }

    this.show('risque_techno', 'data/geojson/risque_techno.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'sous_type',
      colors: color,
      alpha: 0.4
    });
  });

  this.arbreRemCheckbox.addEventListener('change', (e) => {
    let color = {
      'Arbre_remarquable': '#8AC467',
    }

    if(e.target.checked){
      this.legendManager.addLegend('arbreRem', color, 'point');
    } else{
      this.legendManager.removeLegend('arbreRem');
    }

    this.show('arbreRem', 'data/geojson/arbres_rem.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'name',
      colors: color,
      alpha: 0.4
    });
  });

  this.ppriNappeCheckbox.addEventListener('change', (e) => {
    let color = {
      '<0m_(nappe_débordante)': '#FF0000',
      '0-1m': '#CE6A27'
    }

    if(e.target.checked){
      this.legendManager.addLegend('nappe', color, 'polygon');
    } else{
      this.legendManager.removeLegend('nappe');
    }

    this.show('nappe', 'data/geojson/ppri_nappe.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'classe',
      colors: color,
      alpha: 0.4
    });
  });

  this.ppriRemontCheckbox.addEventListener('change', (e) => {
    let colors = {
      'Zone_verte': '#014F03',
      'Zone_vert_clair': '#0E8E12'
    }

    if(e.target.checked){
      this.legendManager.addLegend('remont', colors, 'polygon');
    } else{
      this.legendManager.removeLegend('remont');
    }

    this.show('remontee', 'data/geojson/ppri_innond_remontee.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'nom',
      colors: colors,
      alpha: 0.4
    });
  });

  this.ppriSubCheckbox.addEventListener('change', (e) => {
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

    this.show('submersion', 'data/geojson/ppri_innond_debord.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'nom',
      colors: colors,
      alpha: 0.4
    });
  });

  this.reservoirACheckbox.addEventListener('change', (e) => {
    let color = {
      'Réservoir_arboré': '#A2A706'
    }

    if(e.target.checked){
      this.legendManager.addLegend('reservoirA', color, 'polygon');
    } else{
      this.legendManager.removeLegend('reservoirA');
    }

    this.show('tnu_reservoirA', 'data/geojson/tnu_reserv_arbore.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'name',
      colors: color,
      alpha: 0.4
    });
  });

  this.reservoirHCheckbox.addEventListener('change', (e) => {
    let color = {
      'Réservoir_herbacé': '#5FA706'
    }

    if(e.target.checked){
      this.legendManager.addLegend('reservoirH', color, 'polygon');
    } else{
      this.legendManager.removeLegend('reservoirH');
    }

    this.show('tnu_reservoirH', 'data/geojson/tnu_reservoir_herbace.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'name',
      colors: color,
      alpha: 0.4
    });
  });

  this.corridorHCheckbox.addEventListener('change', (e) => {
    let color = {
      'Corridor_herbacé': '#06A783'
    }

    if(e.target.checked){
      this.legendManager.addLegend('corridorH', color, 'polygon');
    } else{
      this.legendManager.removeLegend('corridorH');
    }

    this.show('tnu_corridorH', 'data/geojson/tnu_corridor_herbace.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'name',
      colors: color,
      alpha: 0.4
    });
  });

  this.corridorACheckbox.addEventListener('change', (e) => {
    let color = {
      'Corridor_arboré': '#D7C518'
    }

    if(e.target.checked){
      this.legendManager.addLegend('corridorA', color, 'polygon');
    } else{
      this.legendManager.removeLegend('corridorA');
    }

    this.show('tnu_corridorA', 'data/geojson/tnu_corridor_arbore.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'name',
      colors: color,
      alpha: 0.4
    });
  });

  // DIVERS
  this.monumentCheckbox.addEventListener('change', (e) => {
    let colors = {
      'classé': '#D1D716',
      'inscrit': '#F07200'
    }

    if(e.target.checked){
      this.legendManager.addLegend('monuments_historiques', colors, 'polygon');
    } else{
      this.legendManager.removeLegend('monuments_historiques');
    }

    this.show('monuments_historiques', 'data/geojson/monument_histo.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'type_entite',
      colors: colors,
      alpha: 0.6
    });

  });

  this.administratifCheckbox.addEventListener('change', (e) => {
    let colors = {
      'administratif': '#DEC01F'
    }

    if(e.target.checked){
      this.legendManager.addLegend('administratif', colors, 'polygon');
    } else{
      this.legendManager.removeLegend('administratif');
    }

    this.show('administratif', 'data/geojson/batipublic_administratif.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'categorie',
      colors: colors,
      alpha: 0.6
    });

  });

  this.religieuxCheckbox.addEventListener('change', (e) => {
    let colors = {
      'religieux': '#5604C4'
    }

    if(e.target.checked){
      this.legendManager.addLegend('religieux', colors, 'polygon');
    } else{
      this.legendManager.removeLegend('religieux');
    }

    this.show('religieux', 'data/geojson/batipublic_religieux.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'categorie',
      colors: colors,
      alpha: 0.6
    });

  });

  this.culturelCheckbox.addEventListener('change', (e) => {
    let colors = {
      'culturel': '#1FBDDE'
    }

    if(e.target.checked){
      this.legendManager.addLegend('culturel', colors, 'polygon');
    } else{
      this.legendManager.removeLegend('culturel');
    }

    this.show('culturel', 'data/geojson/batipublic_culturel.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'categorie',
      colors: colors,
      alpha: 0.6
    });

  });

  this.socialCheckbox.addEventListener('change', (e) => {
    let colors = {
      'social': '#E36100'
    }

    if(e.target.checked){
      this.legendManager.addLegend('social', colors, 'polygon');
    } else{
      this.legendManager.removeLegend('social');
    }

    this.show('social', 'data/geojson/batipublic_social.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'categorie',
      colors: colors,
      alpha: 0.6
    });

  });

  this.historiqueCheckbox.addEventListener('change', (e) => {
    let colors = {
      'historique': '#E3002B'
    }

    if(e.target.checked){
      this.legendManager.addLegend('historique', colors, 'polygon');
    } else{
      this.legendManager.removeLegend('historique');
    }

    this.show('historique', 'data/geojson/batipublic_historique.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'categorie',
      colors: colors,
      alpha: 0.6
    });

  });

  this.santeCheckbox.addEventListener('change', (e) => {
    let colors = {
      'sante': '#10AA7E'
    }

    if(e.target.checked){
      this.legendManager.addLegend('sante', colors, 'polygon');
    } else{
      this.legendManager.removeLegend('sante');
    }

    this.show('sante', 'data/geojson/batipublic_sante.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'categorie',
      colors: colors,
      alpha: 0.6
    });

  });

  this.sportifCheckbox.addEventListener('change', (e) => {
    let colors = {
      'sportif': '#0F4CEF'
    }

    if(e.target.checked){
      this.legendManager.addLegend('sportif', colors, 'polygon');
    } else{
      this.legendManager.removeLegend('sportif');
    }

    this.show('sportif', 'data/geojson/batipublic_sportif.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'categorie',
      colors: colors,
      alpha: 0.6
    });

  });

  this.enseignementCheckbox.addEventListener('change', (e) => {
    let colors = {
      'enseignement': '#008B1F'
    }

    if(e.target.checked){
      this.legendManager.addLegend('enseignement', colors, 'polygon');
    } else{
      this.legendManager.removeLegend('enseignement');
    }

    this.show('enseignement', 'data/geojson/batipublic_enseignement.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
      classification: true,
      classificationField: 'categorie',
      colors: colors,
      alpha: 0.6
    });

  });

  this.velumCheckbox.addEventListener('change', (e) => {
    if(e.target.checked == false){
      this.velumCouleurCheckbox.checked = false;
    }
    this.show('velum', 'data/Velum3D/tileset.json', Globe.prototype.load3DTiles.bind(this.globe), e.target.checked);

  });

  this.velumCouleurCheckbox.addEventListener('change', (e) => {
    this.couleurVelum(e.target.checked);

    let legendColors = {
      'HT': '#1F9BDE',
      'ET': '#B75AF1',
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

}

// Ajouter une source de données a la liste en donnant son nom "name" et la datasource "value"
addDataSource(name, value){
  this.dataSources[name] = value;
}
/*
* Afficher ou masquer la source de données "name" en fonction de la valeur de "show"
* Si elle n'a pas enore été affiché, la fonction va télécharger les données avec le lien "link" passé en parametre
* Elle utilise la fonction "loader" passé en paramètre pour télécharger les données et les ajouter au globe
* "Options" est un paramètre optionel (un objet) qui sera passé en deuxième paramètre de la fonction "loader"
*/
show(name, link, loader, show, options = {}){
  if(show){
    if(this.dataSources[name] === undefined){
      this.showLoader();
      loader(link, options).then((data) => {
        this.dataSources[name] = data;
        this.hideLoader();
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

// Mise a jour de la timeline lorsque l'utilisateur choisit une date dans le calendrier
onDateChanged(value){
  let date = value.split('/');

  let day = date[0];
  let month = date[1];
  let year = date[2];

  let startTime = Cesium.JulianDate.fromIso8601(year + '-' + month + '-' + day + 'T00:00:00Z');
  let stopTime = Cesium.JulianDate.fromIso8601(year + '-' + month + '-' + day + 'T23:59:59Z');

  this.globe.viewer.timeline.zoomTo(startTime, stopTime); // Définit la portion visible de la timeline
}

//Formulaire
formulaireFichier(){
  document.querySelector("#ajouter").addEventListener('click', (e) => {
    var fichier = $('#fichier').prop('files')[0];
    //var fichier = "file://S:/Commun/SIG3D/2019/PROJETS_2019/19027_PFE_INSA/FME/exports/bati_exceptionnel.json";
    var reader = new FileReader();

    reader.addEventListener('load', function() {
      alert('Contenu du fichier "' + fichier.name + '" :\n\n' + reader.result);
    });
    reader.readAsText(fichier);
    var jsonObj = reader.result;
    //Cesium.GeoJsonDataSource.load(fichier);
    globe.loadGeoJson(jsonObj);
  });
}

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
        ["${CLASSIF} === 'HT'", "color('#1F9BDE', 0.7)"],
        ["${CLASSIF} === 'ET'", "color('#B75AF1', 0.7)"],
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


}
