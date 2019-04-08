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
