"use strict";

// Definition des systèmes de projection dans Proj4
proj4.defs([
  [
    "EPSG:4326",
    "+proj=longlat +datum=WGS84 +no_defs"
  ],
  [
    "EPSG:3948",
    "+proj=lcc +lat_1=47.25 +lat_2=48.75 +lat_0=48 +lon_0=3 +x_0=1700000 +y_0=7200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
  ]
]);


// Créer le globe --> appele le constucteur globe créé dans la classe correspondante
let globe = new Globe('cesiumContainer', new Geocoder("http://adict.strasbourg.eu/addok/search"));

// Charger le photo mailage --> appelle la fonction créée dans la classe globe
let tileset = globe.loadPhotomaillage('data/Photomaillage/Cesium_1.json');
var terrain = globe.addPhotomaillage(tileset);


// Zoomer sur le photo mailage et configurer le bouton "home" pour qu'il vole au même endroit
globe.setHome(terrain);

// Créer le menu de gauche et definir tous les évènements
let cesiumEvent = new Menu(globe);
cesiumEvent.evenementsCouches();


// Une fois le photo maillage chargé, l'enregister dans la liste des dataSource pour pouvoir interagir avec lui dans les évènements
terrain.then(function(dataSource){
  cesiumEvent.addDataSource("photoMaillage", dataSource)
});
