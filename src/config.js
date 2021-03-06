/**
 * Endroit où déclarer les nouvelles fonctions qui correspondent aux fichiers de configurations
 * Créer ensuite un nouveau bouton dans la div des config qui va appeler cette fonction au clic
 * Principe: jouer sur l'attribut 'hidden' des couches qu'on veut voir ou ne pas voir en fonction de la configuration
 */

//Déclaration de toutes les div contenant les checkbox
// PLU
this.ERDiv = document.querySelector('#ERDiv');
this.margeDiv = document.querySelector('#margeDiv');
this.ensPaysagerDiv = document.querySelector('#ensPaysagerDiv');
this.batiInteressantDiv = document.querySelector('#batiInteressantDiv');
this.batiExceptionnelDiv = document.querySelector('#batiExceptionnelDiv');
this.planteDiv = document.querySelector('#planteDiv');
this.continuiteDiv = document.querySelector('#continuiteDiv');
this.jardinDiv = document.querySelector('#jardinDiv');
this.alignementDiv = document.querySelector('#alignementDiv');
this.arbreDiv = document.querySelector('#arbreDiv');
// Ecologie
this.trameDiv = document.querySelector('#tvbDiv');
this.zhAvereesDiv = document.querySelector('#zhavereesDiv');
this.solPollueDiv = document.querySelector('#pollueDiv');
this.risqueTechnoDiv = document.querySelector('#risquetechnoDiv');
this.arbresRemDiv = document.querySelector('#arbresRemDiv');
this.ppriDiv = document.querySelector('#ppriDiv');
this.tnuDiv = document.querySelector('#tnuDiv');
//Reglementaire
this.monumentDiv = document.querySelector('#monumentDiv');
//Divers
this.danubeDiv = document.querySelector('#danubeDiv');
this.SIRENEDiv = document.querySelector('#SIREN_AdientDiv');
this.velumDiv = document.querySelector('#velumDiv');
this.batipublicDiv = document.querySelector('#batipublicDiv');

/*
*
* Fonctions de configuration
*
*/

// Bouton configuration par défaut
function showElements() {
  // PLU
  this.ERDiv.classList.remove('hidden');
  this.margeDiv.classList.remove('hidden');
  this.ensPaysagerDiv.classList.remove('hidden');
  this.batiInteressantDiv.classList.remove('hidden');
  this.batiExceptionnelDiv.classList.remove('hidden');
  this.planteDiv.classList.remove('hidden');
  this.continuiteDiv.classList.remove('hidden');
  this.jardinDiv.classList.remove('hidden');
  this.alignementDiv.classList.remove('hidden');
  this.arbreDiv.classList.remove('hidden');
  // Ecologie
  this.trameDiv.classList.remove('hidden');
  this.zhAvereesDiv.classList.remove('hidden');
  this.solPollueDiv.classList.remove('hidden');
  this.risqueTechnoDiv.classList.remove('hidden');
  this.arbresRemDiv.classList.remove('hidden');
  this.ppriDiv.classList.remove('hidden');
  this.tnuDiv.classList.remove('hidden');
  //Reglementaire
  this.monumentDiv.classList.remove('hidden');
  //Divers
  this.danubeDiv.classList.remove('hidden');
  this.velumDiv.classList.remove('hidden');
  this.batipublicDiv.classList.remove('hidden');
  this.SIRENEDiv.classList.remove('hidden');
}


// cacher les éléments ligne par ligne
// Fonction appelée lors du clic sur le bouton réinitialisation
function hideElements() {
  // PLU
  this.ERDiv.classList.add('hidden');
  this.margeDiv.classList.add('hidden');
  this.ensPaysagerDiv.classList.add('hidden');
  this.batiInteressantDiv.classList.add('hidden');
  this.batiExceptionnelDiv.classList.add('hidden');
  this.planteDiv.classList.add('hidden');
  this.continuiteDiv.classList.add('hidden');
  this.jardinDiv.classList.add('hidden');
  this.alignementDiv.classList.add('hidden');
  this.arbreDiv.classList.add('hidden');

  // Ecologie
  this.trameDiv.classList.add('hidden');
  this.zhAvereesDiv.classList.add('hidden');
  this.solPollueDiv.classList.add('hidden');
  this.risqueTechnoDiv.classList.add('hidden');
  this.arbresRemDiv.classList.add('hidden');
  this.ppriDiv.classList.add('hidden');
  this.tnuDiv.classList.add('hidden');

  //Reglementaire
  this.monumentDiv.classList.add('hidden');

  //Divers
  this.danubeDiv.classList.add('hidden');
  this.velumDiv.classList.add('hidden');
  this.batipublicDiv.classList.add('hidden');
  this.SIRENEDiv.classList.add('hidden');
}

// Configuration PLU
function initPLU() {
  // PLU
  this.ERDiv.classList.remove('hidden');
  this.margeDiv.classList.remove('hidden');
  this.ensPaysagerDiv.classList.remove('hidden');
  this.batiInteressantDiv.classList.remove('hidden');
  this.batiExceptionnelDiv.classList.remove('hidden');
  this.planteDiv.classList.remove('hidden');
  this.continuiteDiv.classList.remove('hidden');
  this.jardinDiv.classList.remove('hidden');
  this.alignementDiv.classList.remove('hidden');
  this.arbreDiv.classList.remove('hidden');
  // Ecologie
  this.trameDiv.classList.add('hidden');
  this.zhAvereesDiv.classList.add('hidden');
  this.solPollueDiv.classList.add('hidden');
  this.risqueTechnoDiv.classList.add('hidden');
  this.arbresRemDiv.classList.add('hidden');
  this.ppriDiv.classList.add('hidden');
  this.tnuDiv.classList.add('hidden');
  //Reglementaire
  this.monumentDiv.classList.remove('hidden');
  //Divers
  this.danubeDiv.classList.add('hidden');
  this.velumDiv.classList.add('hidden');
  this.batipublicDiv.classList.add('hidden');
  this.SIRENEDiv.classList.add('hidden');
}

// Configuration Ecologie du territoire
function initEco() {
  // PLU
  this.ERDiv.classList.add('hidden');
  this.margeDiv.classList.remove('hidden');
  this.ensPaysagerDiv.classList.add('hidden');
  this.batiInteressantDiv.classList.add('hidden');
  this.batiExceptionnelDiv.classList.add('hidden');
  this.planteDiv.classList.remove('hidden');
  this.continuiteDiv.classList.remove('hidden');
  this.jardinDiv.classList.remove('hidden');
  this.alignementDiv.classList.remove('hidden');
  this.arbreDiv.classList.remove('hidden');
  // Ecologie
  this.trameDiv.classList.remove('hidden');
  this.zhAvereesDiv.classList.remove('hidden');
  this.solPollueDiv.classList.remove('hidden');
  this.risqueTechnoDiv.classList.remove('hidden');
  this.arbresRemDiv.classList.remove('hidden');
  this.ppriDiv.classList.remove('hidden');
  this.tnuDiv.classList.remove('hidden');
  //Reglementaire
  this.monumentDiv.classList.add('hidden');
  //Divers
  this.danubeDiv.classList.add('hidden');
  this.velumDiv.classList.add('hidden');
  this.batipublicDiv.classList.remove('hidden');
  this.SIRENEDiv.classList.add('hidden');
}

// Configuration SIRENE
function initSIRENE() {
  // PLU
  this.ERDiv.classList.add('hidden');
  this.margeDiv.classList.add('hidden');
  this.ensPaysagerDiv.classList.add('hidden');
  this.batiInteressantDiv.classList.add('hidden');
  this.batiExceptionnelDiv.classList.add('hidden');
  this.planteDiv.classList.add('hidden');
  this.continuiteDiv.classList.add('hidden');
  this.jardinDiv.classList.add('hidden');
  this.alignementDiv.classList.add('hidden');
  this.arbreDiv.classList.add('hidden');
  // Ecologie
  this.trameDiv.classList.add('hidden');
  this.zhAvereesDiv.classList.add('hidden');
  this.solPollueDiv.classList.add('hidden');
  this.risqueTechnoDiv.classList.remove('hidden');
  this.arbresRemDiv.classList.add('hidden');
  this.ppriDiv.classList.add('hidden');
  this.tnuDiv.classList.add('hidden');
  //Reglementaire
  this.monumentDiv.classList.add('hidden');
  //Divers
  this.danubeDiv.classList.add('hidden');
  this.velumDiv.classList.add('hidden');
  this.batipublicDiv.classList.add('hidden');
  this.SIRENEDiv.classList.remove('hidden');
}
