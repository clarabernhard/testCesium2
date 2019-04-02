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
		    this.menuDeroulant = document.getElementById('.panel-title');

        // Créer un gestionnaire pour les légendes
        this.legendManager = new LegendManager(this.leftPane);

        // Récuperer les checkboxes
        this.photoMaillageCheckbox = document.querySelector('#photoMaillage');
        this.shadowCheckbox = document.querySelector('#shadows');
        this.coordsCheckbox = document.querySelector('#coords');
        this.terrainCheckbox = document.querySelector('#terrain');



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
    }

    registerMenuEvent(){
        // Crée l'évènement qui permet d'ouvrir le menu
        document.querySelector("#left-pane #toggle-menu").addEventListener('click', (e) => {
            this.leftPane.classList.toggle('menu-open');
            this.menu.classList.toggle('menu-open');
        });

		// Crée l'évènement du menu déroulant

console.log("coucou");
    for (var i = 0; i < menuDeroulant.length; i++) {
      console.log("coucou1");
      menuDeroulant.addEventListener('click', (e) => {
        this.classList.toggle('active');
        var dropdownContent = this.nextElementSibling;
        if (dropdownContent.style.display === 'block') {
          dropdownContent.style.display = 'none';
        } else {
          dropdownContent.style.display = 'block';
        }
      });
    }

    // Ajouter une source de données a la liste en donnant son nom "name" et la datasource "value"
    addDataSource(name, value){
        this.dataSources[name] = value;
    }


    // Créer tous les évènements
    registerEvents(){
        this.photoMaillageCheckbox.addEventListener('change', (e) => {
            this.show('photoMaillage', '../Cesium/data/photoMaillage/EXPORT_Cesium_130.json', Globe.prototype.load3DTiles.bind(this.globe), e.target.checked);
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

		this.terrainCheckbox.addEventListener('change', (e) => {
            this.show('terrain', '../Cesium/data/maq3d/terrain/tileset.json', Globe.prototype.load3DTiles.bind(this.globe), e.target.checked);
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

	/*
    * Fonction qui permet de gerer les styles des batiments
    * Paramètres :
    *      - $batimentColor : La checkbox qui definit si on veut afficher les couleurs en fonction de la hauteur
    *      - $batimentShow : La checkbox qui definit si on masquer les batiment de moins de 25m
    */
    batimentStyle($batimentColor, $batimentShow){
        if(this.dataSources.batiments === undefined || this.dataSources.batiments.show == false){
            alert("Vous devez afficher les batiments pour utiliser cette fonction");
            $batimentColor.checked = false;
            $batimentShow.checked = false;
            return;
        }

        if(!this.legendManager.hasLegend('batimentStyle')){
            this.legendManager.addLegend('batimentStyle', {
                '>= 80m': '#FF1307',
                '>= 60m': '#FF0A21',
                '>= 40m': '#E8650F',
                '>= 20m': '#FFC61E',
                '>= 10m': '#CAE80F',
                '>= 1m': '#1FFF3A',
                'autre': '#808080',
            });
        }


        // Créer le style de couleur en fonction de la valeur de la checkbox "Style des batiments (hauteur)"
        let color = undefined;
        if($batimentColor.checked){
            color = {
                conditions: [
                    ["(Number(${hauteur}) >= 80.0)", "color('#FF1307')"],
                    ["(Number(${hauteur}) >= 60.0)", "color('#FF0A21')"],
                    ["(Number(${hauteur}) >= 40.0)", "color('#E8650F')"],
                    ["(Number(${hauteur}) >= 20.0)", "color('#FFC61E')"],
                    ["(Number(${hauteur}) >= 10.0)", "color('#CAE80F')"],
                    ["(Number(${hauteur}) >= 1.0)", "color('#1FFF3A')"],
                    ["true", "rgb(128, 128, 128)"]
                ]
            };
        } else{
            this.legendManager.removeLegend('batimentStyle');
            color = {
                conditions: [
                    ["true", "rgb(128, 128, 128)"]
                ]
            };
        }

        // Créer la condition d'affichage des batiments en fonction de la checkbox "Afficher les batiment de plus de 50m"
        let show = undefined;
        if($batimentShow.checked){
            show = "(Number(${hauteur}) > 25.0)";
        } else{
            show = "true"; // On affiche tout
        }

        // Construire et appliquer le style au tileset
        this.dataSources.batiments.style = new Cesium.Cesium3DTileStyle({
            show: show,
            color: color
        });
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
