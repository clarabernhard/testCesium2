"use strict";

/*
 *
 * Créer un object globe qui pertmet de manipuler cesium plus simplement
 *
 */
class Globe {

    constructor(elementId, geocoder, link){

        // Créer le globe dans la div HTML qui a l'id cesiumContainer
        this.viewer = new Cesium.Viewer(elementId, {
          geocoder: geocoder,
        });

        // insère les logos en bas
        this.viewer.bottomContainer.innerHTML = '<img src="src/img/logo/logo-strasbourg.png" alt="Logo strasbourg" />\
                                                <img src="src/img/logo/europe-sengage.jpg" alt="Logo strasbourg" />\
                                                <img src="src/img/logo/logo-ue.jpg" alt="Logo strasbourg" />';

        this.coordsMouseMoveEvent = undefined;

        this.hoverHandler = undefined;
        this.clickHandler = undefined;

        /*var elevation = new Cesium.CesiumTerrainProvider({
            url : 'https://www.geograndest.fr/geoserver/ems/wms?service=WMS&version=1.1.0&request=GetMap&layers=ems:2050000_7275000_LIDAR15-16_ELEVATION',
            layer : 'ems:2050000_7275000_LIDAR15-16_ELEVATION',
            parameters : {
              crossOrigin: '0'
            }
        });
        this.viewer.imageryLayers.addImageryProvider(elevation);
        // voir https://gis.stackexchange.com/questions/152310/unable-to-serve-cesium-terrain-files*/

        /*var elevation = new Cesium.WebMapServiceImageryProvider({
            url : 'http://wxs.ign.fr/pvwmk1wgxoei8orp7rd1re78/geoportail/r/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap',
            layer : 'ELEVATION.ELEVATIONGRIDCOVERAGE',
            parameters : {
              crossOrigin: '0'
            }
        });
        this.viewer.imageryLayers.addImageryProvider(elevation);*/
    }

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
            maximumNumberOfLoadedTiles : 1000 // Nombre maximum de dalle chargées simultanément
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

    shadow(enabled){
        this.viewer.shadows = enabled;
    }

    setCoordsCallback(callback){
        if(callback === undefined && this.coordsMouseMoveEvent !== undefined){
            this.coordsMouseMoveEvent.destroy();
            this.coordsMouseMoveEvent = undefined;

            return;
        }

        if(callback !== undefined && this.coordsMouseMoveEvent !== undefined){
            this.coordsMouseMoveEvent.destroy();
        }

        this.coordsMouseMoveEvent = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        this.coordsMouseMoveEvent.setInputAction((movement) => {
            let scene = this.viewer.scene;
            if (scene.mode !== Cesium.SceneMode.MORPHING) {
                let pickedObject = scene.pick(movement.endPosition);

                if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
                    let cartesian = this.viewer.scene.pickPosition(movement.endPosition);

                    if (Cesium.defined(cartesian)) {
                        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                        let longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5);
                        let latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5);
                        let heightString = cartographic.height.toFixed(2);

                        callback(longitudeString, latitudeString, heightString);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

}


/* Créé un geocoder pour cesium qui uilise adict.strasbourg.eu */
class Geocoder {

    constructor(url){
        this.url = url;
    }

    geocode(input){
        let resource = new Cesium.Resource({
            url: this.url,
            queryParameters: {
                q: input
            }
        });

        return resource.fetchJson()
            .then(function (results) {
                return results.features.map(function (resultObject) {
                    return {
                        displayName: resultObject.properties.label,
                        destination: Cesium.Cartesian3.fromDegrees(resultObject.geometry.coordinates[0], resultObject.geometry.coordinates[1], 500)
                    };
                });
            });
    }

}

/* Classe permettant de gérer les légendes
 * Prend un paramètre : l'élément HTML dans lequel mettre les légendes */
class LegendManager {

    constructor(legendContainer){
        this.legendContainer = legendContainer;
    }

    addLegend(id, values){
        let legend = document.createElement('div');
        legend.id = id;
        legend.classList.add('legend');
        legend.classList.add('backdrop');

        Object.keys(values).forEach((key) => {
            legend.appendChild(this.makeLegendItem(key, values[key]));
        });

        this.legendContainer.appendChild(legend);
    }

    removeLegend(id){
        let legend = this.legendContainer.querySelector('#' + id);
        legend.parentElement.removeChild(legend);
    }

    hasLegend(id){
        return this.legendContainer.querySelectorAll('#' + id).length != 0;
    }

    makeLegendItem(label, color){
        let legendColor = document.createElement('span');
        legendColor.classList.add('legend-color');
        legendColor.style = "background-color: " + color + ";";

        let legendText = document.createElement('span');
        legendText.classList.add('legend-text');
        legendText.innerHTML = label;

        let item = document.createElement('div');
        item.classList.add('legend-element');
        item.appendChild(legendColor);
        item.appendChild(legendText);

        return item;
    }
}
