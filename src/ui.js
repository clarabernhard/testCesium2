"use strict";

// Fonctions pour controler le loader
let showLoader = function(){
  document.querySelector('#loadingIndicator').classList.remove('hidden');
}

let hideLoader = function(){
  document.querySelector('#loadingIndicator').classList.add('hidden');
}

// Gérer les interactions avec l'utilisateur (évènement sur le menu)
class Menu {

  constructor(globe){
    this.globe = globe;
    this.terrain = terrain;
    this.viewer = Globe.viewer;

    // Récuperer les éléments du menu
    this.leftPane = document.querySelector('#left-pane');
    this.menu = document.querySelector('#menu');
    this.dropdown = document.getElementsByClassName("panel-title");

    // Créer un gestionnaire pour les légendes
    this.legendManager = new LegendManager(this.leftPane);

    // Légendes qui s'affichent au clic des boîtes à outils associées
    this.aideCheckbox = document.querySelector('#aide');
    this.distanceList = document.querySelector('#distanceList');
    this.aireList = document.querySelector('#aireList');
    this.planList = document.querySelector('#planList');
    this.ligneList = document.querySelector('#ligneList');
    this.surfaceList = document.querySelector('#surfaceList');
    this.pointList = document.querySelector('#pointList');
    this.volumeList = document.querySelector('#volumeList');

    // Récuperer les checkboxes
    this.photoMaillageCheckbox = document.querySelector('#photoMaillage');
    this.shadowCheckbox = document.querySelector('#shadows');
    this.monumentCheckbox = document.querySelector('#monument');

    // mesures
    this.coordsCheckbox = document.querySelector('#point');
    this.ligneCheckbox = document.querySelector('#ligne');
    this.surfaceCheckbox = document.querySelector('#surface');

    //construction
    this.cpointCheckbox = document.querySelector('#cpoint');
    this.cligneCheckbox = document.querySelector('#cligne');
    this.csurfaceCheckbox = document.querySelector('#csurface');
    this.volumeCheckbox = document.querySelector('#volume');

    // plan de coupe
    this.coupeCheckbox = document.querySelector('#plancoupe');

    // boutons supprimer
    this.supprCheckbox = document.querySelector("#suppr");

    // Créer le datepicker
    this.datepicker = $("#date")
    this.datepicker.datepicker();
    this.datepicker.datepicker("option", "dateFormat", "dd/mm/yy");

    // Créer la liste des dataSource sous forme d'un object clé / valeur
    // Avec le nom de la source comme clé et la dataSource comme valeur
    this.dataSources = {};

    this.menuDeroulant();
    this.registerMenuEvent();

  }

  registerMenuEvent(){
    // Crée l'évènement qui permet d'ouvrir le menu
    document.querySelector("#left-pane #toggle-menu").addEventListener('click', (e) => {
      this.leftPane.classList.toggle('menu-open');
      this.menu.classList.toggle('menu-open');
    });
  }

  // Evenement pour les menus déroulants
  menuDeroulant(){
    var i;
    for (i = 0; i < this.dropdown.length; i++) {
      this.dropdown[i].addEventListener('click', function() {
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

  // Ajouter une source de données a la liste en donnant son nom "name" et la datasource "value"
  addDataSource(name, value){
    this.dataSources[name] = value;
  }

  // Créer tous les évènements
  registerEvents(){
    this.photoMaillageCheckbox.addEventListener('change', (e) => {
      this.show('photoMaillage', 'data/photoMaillage/EXPORT_Cesium_130.json', Globe.prototype.load3DTiles.bind(this.globe), e.target.checked);
    });

    this.shadowCheckbox.addEventListener('change', function(e){
      globe.shadow(e.target.checked);
    });

    // Créé le date picker
    this.datepicker.on('change', () => {
      this.onDateChanged(this.datepicker.val());
    });

    this.coordsCheckbox.addEventListener('change', (e) => {
      globe.showCoords(e.target.checked);
    });

    this.ligneCheckbox.addEventListener('change', (e) => {
      var choice = 'line';
      var choice2 = 'mesure';
      var hauteurVol;

      if(e.target.checked){
        globe.updateShape(choice, choice2, 3, '#FF0000', 1, hauteurVol);
        this.distanceList.classList.remove('hidden');
        this.aideCheckbox.classList.remove('hidden');
      } else{
        this.distanceList.classList.add('hidden');
        this.aideCheckbox.classList.add('hidden');
        globe.supprSouris();
        //globe.supprEntities();
      }

    });

    this.surfaceCheckbox.addEventListener('change', (e) => {
      var choice = 'polygon';
      var choice2 = 'mesure';
      var hauteurVol;

      if(e.target.checked){
        globe.updateShape(choice, choice2, 3, '#1ABFD0', 0.4, hauteurVol);
        this.aireList.classList.remove('hidden');
        this.aideCheckbox.classList.remove('hidden');
      } else{
        this.aireList.classList.add('hidden');
        this.aideCheckbox.classList.add('hidden');
        globe.supprSouris();
        //globe.supprEntities();
      }

    });

    this.cpointCheckbox.addEventListener('change', (e) => {
      var choice = 'point';
      var choice2 = 'construction';
      var transparence;

      if(e.target.checked){
        this.pointList.classList.remove('hidden');
        globe.formulairePoint(choice, choice2);
      } else{
        this.pointList.classList.add('hidden');
        globe.supprSouris();

      }

    });

    this.cligneCheckbox.addEventListener('change', (e) => {
      var choice = 'line';
      var choice2 = 'construction';

      if(e.target.checked){
        globe.formulaireLigne(choice, choice2);
        this.ligneList.classList.remove('hidden');
        this.aideCheckbox.classList.remove('hidden');
      } else{
        this.ligneList.classList.add('hidden');
        this.aideCheckbox.classList.add('hidden');
        globe.supprSouris();

      }

    });

    this.csurfaceCheckbox.addEventListener('change', (e) => {
      var choice = 'polygon';
      var choice2 = 'construction';

      if(e.target.checked){
        globe.formulaireSurface(choice, choice2);
        this.surfaceList.classList.remove('hidden');
        this.aideCheckbox.classList.remove('hidden');
      } else{
        this.surfaceList.classList.add('hidden');
        this.aideCheckbox.classList.add('hidden');
        globe.supprSouris();

      }

    });

    this.volumeCheckbox.addEventListener('change', (e) => {
      var choice = 'volume';
      var choice2 = 'construction';

      if(e.target.checked){
        globe.formulaireVolume(choice, choice2);
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
        this.planList.classList.remove('hidden');
        globe.formulairePlan();
      } else{
        this.planList.classList.add('hidden');
        globe.supprEntities();
      }


    });

    this.monumentCheckbox.addEventListener('change', (e) => {
      let colors = {
        'classé': '#D1D716',
        'inscrit': '#F07200'
      }

      if(e.target.checked){
        this.legendManager.addLegend('monuments_historiques', colors);
      } else{
        this.legendManager.removeLegend('monuments_historiques');
      }

      this.show('monuments_historiques', '../Cesium/data/geojson/monumentsS.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
        classification: true,
        classificationField: 'type_entite',
        colors: colors,
        alpha: 0.4
      });

    });


    this.supprCheckbox.addEventListener('click', function() {
      globe.supprEntities();
    });

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
        showLoader();
        loader(link, options).then((data) => {
          this.dataSources[name] = data;
          hideLoader();
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




}
