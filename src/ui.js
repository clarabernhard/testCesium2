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

    // PLU
    this.pluCheckbox = document.querySelector('#plu');
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

    //Habitat
    this.monumentCheckbox = document.querySelector('#monument');
    this.batiPublicCheckbox = document.querySelector('#batipublic');

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
    this.openMenu();

  }

  openMenu(){
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

      if(e.target.checked){
        globe.updateShape(choice, choice2, 3, '#FF0000', 1, hauteurVol);
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

      if(e.target.checked){
        globe.updateShape(choice, choice2, 3, '#1ABFD0', 0.4, hauteurVol);
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
      }
    });

    this.supprCheckbox.addEventListener('click', function() {
      globe.supprEntities();
    });


    // Couches en surbrillance
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

      this.show('monuments_historiques', 'data/geojson/monument_histo.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
        classification: true,
        classificationField: 'type_entite',
        colors: colors,
        alpha: 0.4
      });

    });

    this.pluCheckbox.addEventListener('change', (e) => {
      this.showPlu(e.target.checked);
    });

    this.planteCheckbox.addEventListener('change', (e) => {
      let color = {
        'Espace planté': '#8ACC6C',
      }

      if(e.target.checked){
        this.legendManager.addLegend('plante', color);
      } else{
        this.legendManager.removeLegend('plante');
      }

      this.show('espaces_plantes', 'data/geojson/esp_plante.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
        classification: true,
        classificationField: 'sous_type',
        colors: color,
        alpha: 0.4
      });
    });

    this.batiInteressantCheckbox.addEventListener('change', (e) => {
      let colors = {
        'Intéressant': '#8D28B3'
      }

      if(e.target.checked){
        this.legendManager.addLegend('batimentsInteressant', colors); // Création de la légende qui a l'ID 'batiments' avec ces couleurs
      } else{
        this.legendManager.removeLegend('batimentsInteressant'); // Suppression de la légende qui a l'ID 'batiments'
      }

      this.show('bati_interessant', 'data/geojson/bati_interessant.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
        classification: true,
        classificationField: 'sous_type',
        colors: colors,
        alpha: 0.4
      });

    });

    this.batiExceptionnelCheckbox.addEventListener('change', (e) => {
      let colors = {
        'Exceptionnel': '#E02466'
      }

      if(e.target.checked){
        this.legendManager.addLegend('batimentsExceptionnel', colors);
      } else{
        this.legendManager.removeLegend('batimentsExceptionnel');
      }

      this.show('bati_exceptionnel', 'data/geojson/bati_exceptionnel.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
        classification: true,
        classificationField: 'sous_type',
        colors: colors,
        alpha: 0.4
      });

    });

    this.ensPaysagerCheckbox.addEventListener('change', (e) => {
      let colors = {
        'Ensemble paysager': '#E0F4AA'
      }

      if(e.target.checked){
        this.legendManager.addLegend('ensPaysager', colors);
      } else{
        this.legendManager.removeLegend('ensPaysager');
      }

      this.show('ens_paysager', 'data/geojson/ens_paysager.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
        classification: true,
        classificationField: 'sous_type',
        colors: colors,
        alpha: 0.4
      });

    });

    this.trameCheckbox.addEventListener('change', (e) => {
      let color = {
        'TVB': '#24B9E0'
      }

      if(e.target.checked){
        this.legendManager.addLegend('trame', color);
      } else{
        this.legendManager.removeLegend('trame');
      }

      this.show('trame_verte_bleue', 'data/geojson/tvb.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
        classification: true,
        classificationField: 'type',
        colors: color,
        alpha: 0.4
      });
    });

    /*this.continuiteCheckbox.addEventListener('change', (e) => {
      let color = {
        'TVB': '#24B9E0'
      }

      if(e.target.checked){
        this.legendManager.addLegend('trame', colors);
      } else{
        this.legendManager.removeLegend('trame');
      }

      this.show('continuite_eco', 'data/geojson/cont_ecologique.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
        classification: true,
        classificationField: 'sous_type',
        colors: color,
        alpha: 0.4
      });
    });*/

    this.zhAvereesCheckbox.addEventListener('change', (e) => {
      let color = {
        'Zone humide avérée': '#AAA9E0'
      }

      if(e.target.checked){
        this.legendManager.addLegend('zh_averees', color);
      } else{
        this.legendManager.removeLegend('zh_averees');
      }

      this.show('zones_humides', 'data/geojson/zh_averees.json', Globe.prototype.loadGeoJson.bind(this.globe), e.target.checked, {
        classification: true,
        classificationField: 'type',
        colors: color,
        alpha: 0.4
      });
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

  showPlu(show){
      this.show('plu', '../Cesium/data/geojson/contours_PLUI.geojson', Globe.prototype.loadGeoJson.bind(this.globe), show, {
          classification: true,
          classificationField: 'type_entite',
          colors: {
              "A1": "#ffdc00",
              "A2": "#ffdc00",
              "A3": "#ffdc00",
              "A4": "#ffdc00",
              "A5": "#ffdc00",
              "A6": "#ffdc00",
              "A7": "#ffdc00",
              "IAUA1": "#ff6500",
              "IAUA2": "#ff6500",
              "IAUA3": "#ff6500",
              "IAUA4": "#ff6500",
              "IAUA5": "#ff6500",
              "IAUA6": "#ff6500",
              "IAUA7": "#ff6500",
              "IAUA8": "#ff6500",
              "IAUB": "#ff6500",
              "IAUB1": "#ff6500",
              "IAUB2": "#ff6500",
              "IAUB3": "#ff6500",
              "IAUB4": "#ff6500",
              "IAUE1": "#f105ff",
              "IAUE2": "#f105ff",
              "IAUXa": "#1f97e1",
              "IAUXb1": "#1f97e1",
              "IAUXb2": "#1f97e1",
              "IAUXc": "#1f97e1",
              "IAUXd": "#1f97e1",
              "IAUXd1": "#1f97e1",
              "IAUXe": "#1f97e1",
              "IAUZ": "#1f97e1",
              "IIAU": "#f1b39b",
              "IIAUE": "#7400fb",
              "IIAUX": "#21ffee",
              "N1": "#f1b39b",
              "N2": "#f1b39b",
              "N3": "#f1b39b",
              "N3Z1": "#f1b39b",
              "N4": "#f1b39b",
              "N5": "#f1b39b",
              "N6": "#f1b39b",
              "N7": "#f1b39b",
              "N8": "#f1b39b",
              "PSMV": "#f1b39b",
              "UAA1": "#f1b39b",
              "UAA2": "#f1b39b",
              "UAA3": "#f1b39b",
              "UAB1": "#f1b39b",
              "UAB2": "#f1b39b",
              "UB1": "#f1b39b",
              "UB2": "#f1b39b",
              "UB2a": "#f1b39b",
              "UB3": "#f1b39b",
              "UB4": "#f1b39b",
              "UB5": "#f1b39b",
              "UCA1": "#f1b39b",
              "UCA2": "#f1b39b",
              "UCA3": "#f1b39b",
              "UCA4": "#f1b39b",
              "UCA5": "#f1b39b",
              "UCA6": "#f1b39b",
              "UCB": "#f1b39b",
              "UCB1": "#f1b39b",
              "UCB2": "#f1b39b",
              "UD1": "#f1b39b",
              "UD2": "#f1b39b",
              "UD2a": "#f1b39b",
              "UDZ1": "#f1b39b",
              "UDZ2": "#f1b39b",
              "UDZ3": "#f1b39b",
              "UDZ4": "#f1b39b",
              "UDZ5": "#f1b39b",
              "UE1": "#ff6500",
              "UE2": "#ff6500",
              "UE3": "#ff6500",
              "UF": "#001b92",
              "UG": "#001b92",
              "UXa1": "#001b92",
              "UXa2": "#001b92",
              "UXb1": "#001b92",
              "UXb2": "#001b92",
              "UXb3": "#001b92",
              "UXb4": "#001b92",
              "UXb5": "#001b92",
              "UXc": "#001b92",
              "UXcZ1": "#001b92",
              "UXcZ2": "#001b92",
              "UXcZ3": "#001b92",
              "UXd1": "#001b92",
              "UXd2": "#001b92",
              "UXd3": "#001b92",
              "UXd4": "#001b92",
              "UXe": "#001b92",
              "UXe1": "#001b92",
              "UXe2": "#001b92",
              "UXf": "#001b92",
              "UXg": "#001b92",
              "UYa": "#001b92",
              "UYb": "#001b92",
              "UZ1": "#001b92",
              "UZ2": "#001b92"
          }
      });

      if(show){
          this.legendManager.addLegend('plu', {
              "A": "#ffdc00",
              "IAUA": "#ff6500",
              "IAUB": "#ff6500",
              "IAUE": "#f105ff",
              "IAUX": "#1f97e1",
              "IAUZ": "#1f97e1",
              "IIAU": "#f1b39b",
              "IIAUE": "#7400fb",
              "IIAUX": "#21ffee",
              "N": "#f1b39b",
              "PSMV": "#f1b39b",
              "UAA": "#f1b39b",
              "UAB": "#f1b39b",
              "UB": "#f1b39b",
              "UCA": "#f1b39b",
              "UCB": "#f1b39b",
              "UD": "#f1b39b",
              "UE": "#ff6500",
              "UF": "#001b92",
              "UG": "#001b92",
              "UX": "#001b92",
              "UY": "#001b92",
              "UZ": "#001b92"
          });
      } else{
          this.legendManager.removeLegend('plu');
      }
  }




}
