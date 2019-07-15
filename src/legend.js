"use strict";

/*
* Classe permettant de gérer les légendes
* Prend un paramètre : l'élément HTML dans lequel mettre les légendes, ici le left-pane
*/
class LegendManager {

  constructor(legendContainer){
    this.legendContainer = legendContainer;
  }

/*
* Permet d'ajouter une légende
*/
  addLegend(id, values, choice, symbol){
    let legend = document.createElement('div');
    legend.id = id;
    legend.classList.add('legend');
    legend.classList.add('backdrop');

    Object.keys(values).forEach((key) => {
      legend.appendChild(this.makeLegendItem(key, values[key], choice, symbol));
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

  makeLegendItem(label, color, choice, symbol){
    let legendColor = document.createElement('span');
    if(choice === 'line'){
      legendColor.classList.add('legend-line');
      legendColor.style = "background-color: " + color + ";";
    } else if(choice === 'polygon') {
      legendColor.classList.add('legend-color');
      legendColor.style = "background-color: " + color + ";";
    } else if(choice === 'point') {
      legendColor.innerHTML = symbol;
    }


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
