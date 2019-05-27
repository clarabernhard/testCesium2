"use strict";

/* Classe permettant de gérer les légendes
 * Prend un paramètre : l'élément HTML dans lequel mettre les légendes */
class LegendManager {

    constructor(legendContainer){
        this.legendContainer = legendContainer;
    }

    addLegend(id, values, choice){
        let legend = document.createElement('div');
        legend.id = id;
        legend.classList.add('legend');
        legend.classList.add('backdrop');

        Object.keys(values).forEach((key) => {
            legend.appendChild(this.makeLegendItem(key, values[key], choice));
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

    makeLegendItem(label, color, choice){
        let legendColor = document.createElement('span');
        if(choice === 'line'){
          legendColor.classList.add('legend-line');
        } else if(choice === 'polygon') {
          legendColor.classList.add('legend-color');
        }
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
