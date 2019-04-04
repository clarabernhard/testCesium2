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

    this.raf09 = undefined;
    new Raf09('../Cesium/data/RAF09.mnt', (raf090) => {
      this.raf09 = raf090;
    });

    // Récuperer les éléments du menu
    this.leftPane = document.querySelector('#left-pane');
    this.menu = document.querySelector('#menu');
    this.dropdown = document.getElementsByClassName("panel-title");
    this.outil = document.getElementById("outil-contenu");

    // Créer un gestionnaire pour les légendes
    this.legendManager = new LegendManager(this.leftPane);

    // Récuperer les checkboxes
    this.photoMaillageCheckbox = document.querySelector('#photoMaillage');
    this.shadowCheckbox = document.querySelector('#shadows');
    this.coordsCheckbox = document.querySelector('#coords');

    // show coords
    this.coordsList = document.querySelector('#coordsList');

    // Mouse over the globe to see the cartographic position
    this.longitude = document.querySelector('#longitude');
    this.latitude = document.querySelector('#latitude');
    this.height = document.querySelector('#height');
    this.coordX = document.querySelector('#coordX');
    this.coordY = document.querySelector('#coordY');
    this.coordZ = document.querySelector('#coordZ');

    // Créer le datepicker
    this.datepicker = $("#date")
    this.datepicker.datepicker();
    this.datepicker.datepicker("option", "dateFormat", "dd/mm/yy");

    // Créer la liste des dataSource sous forme d'un object clé / valeur
    // Avec le nom de la source comme clé et la dataSource comme valeur
    this.dataSources = {};

    this.registerMenuEvent();
    this.menuDeroulant();
    this.outilDeroulant();
    this.outilDeroulant2();
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

  // Menu déroulant de la boite à outils
  outilDeroulant(){
    document.getElementById('outil-contenu').addEventListener('click', function() {
      this.outil.classList.toggle('outil-open');
    });
  }

    /*outilDeroulant2(){
    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
      if (!event.target.matches('outil-bouton')) {
        var dropdowns = document.getElementById('outil-contenu');
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('outil-open')) {
            openDropdown.classList.remove('outil-open');
          }
        }
      }
    }
  }*/


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
      this.showCoords(e.target.checked);
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


  // Fonction qui permet d'afficher ou de masquer les coordonnées au survol de la souris

  showCoords(show){
    if(show){
      this.globe.setCoordsCallback((longitude, latitude, hauteur) => { // Fonction éxécuté a chaque mouvement de souris qui recoit les coordonnées
        this.longitude.innerHTML = longitude;
        this.latitude.innerHTML = latitude;
        this.height.innerHTML = hauteur;

        var coords = proj4('EPSG:4326', 'EPSG:3948', [longitude, latitude]);
        this.coordX.innerHTML = coords[0];
        this.coordY.innerHTML = coords[1];
        this.coordZ.innerHTML = (Number(hauteur) - Number(this.raf09.getGeoide(latitude, longitude))).toFixed(4);
      });
      this.coordsList.classList.remove('hidden');
    } else{
      this.coordsList.classList.add('hidden');
      this.globe.setCoordsCallback(undefined);
    }
  }

}
