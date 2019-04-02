"use strict";

class Raf09 {

    constructor(file, ready){
        $.get(file).done((fileContent) => {
            let data = fileContent.split('\n');

            this.header = this.parseHeader(data[0]);
            this.values = this.parseValues(data[1]);

            ready(this);
        });
    }

    parseHeader(headerStr){
        let values = headerStr.split(' ');

        return {
            minLong: Number(values[0]),
            maxLong: Number(values[1]),
            minLat: Number(values[2]),
            maxLat: Number(values[3]),
            stepLong: Number(values[4]),
            stepLat: Number(values[5])
        }
    }

    parseValues(valuesStr){

        let nbRow = Math.floor((this.header.maxLat - this.header.minLat) / this.header.stepLat) + 1;
        let nbCol = Math.floor((this.header.maxLong - this.header.minLong) / this.header.stepLong) + 1;
    
        let values = valuesStr.trim().split(' ');
        let grid = [];
    
        for(let i = 0; i < values.length; i+=2){
            let row = Math.floor((i/2) / nbCol);
            let col = Math.floor((i/2) % nbCol);
    
            if(col == 0){
                grid.push([]);
            }
    
            grid[row].push(Number(values[i]))
        }
    
        return grid;
    }

    getLatLongFromRowCol(row, col){
        return {
            lat: -this.header.stepLat * row + this.header.maxLat,
            long: this.header.stepLong * Math.floor(col) + this.header.minLong,
            img: this.values[row][col]
        }
    }

    boundingPoints(lat, long){

        let row = - (lat - this.header.maxLat) / this.header.stepLat;
        let col = (long - this.header.minLong) / this.header.stepLong;
    
        return [
            // Point haut gauche
            this.getLatLongFromRowCol(Math.floor(row), Math.floor(col)),
    
            // Point haut droit
            this.getLatLongFromRowCol(Math.floor(row), Math.ceil(col)),
    
            // Point bas droit
            this.getLatLongFromRowCol(Math.ceil(row), Math.ceil(col)),
    
            // Point bas gauche
            this.getLatLongFromRowCol(Math.ceil(row), Math.floor(col)),
        ];
    }

    getGeoide(lat, long){

        let val = this.boundingPoints(lat, long);
        let Q11 = val[3];
        let Q12 = val[0];
        let Q22 = val[1];
        let Q21 = val[2];
    
        let x2x1 = (Q21.long - Q12.long);
        let y2y1 = (Q12.lat - Q21.lat);
    
        let xy1 = (Q21.long - long) / x2x1 * Q11.img + 
                    (long - Q12.long) / x2x1 * Q21.img;
    
        let xy2 = (Q21.long - long) / x2x1 * Q12.img + 
                    (long - Q12.long) / x2x1 * Q22.img;
    
        return (Q12.lat - lat) / y2y1 * xy1 + (lat - Q21.lat) / y2y1 * xy2;
    }

}
