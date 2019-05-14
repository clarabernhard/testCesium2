// PLU
this.pluDiv = document.querySelector('#pluDiv');
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
this.ppriDiv = document.querySelector('#ppriDiv');
this.tnuDiv = document.querySelector('#tnuDiv');

//Reglementaire
this.monumentDiv = document.querySelector('#monumentDiv');

//Divers
this.batipublicDiv = document.querySelector('#batipublicDiv');

function hideElements() {
  // cacher les éléments ligne par ligne
  // PLU
  this.pluDiv.classList.add('hidden');
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
  this.ppriDiv.classList.add('hidden');
  this.tnuDiv.classList.add('hidden');

  //Reglementaire
  this.monumentDiv.classList.add('hidden');

  //Divers
  this.batipublicDiv.classList.add('hidden');

}

function showElements() {
  // PLU
  this.pluDiv.classList.remove('hidden');
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
  this.ppriDiv.classList.remove('hidden');
  this.tnuDiv.classList.remove('hidden');

  //Reglementaire
  this.monumentDiv.classList.remove('hidden');

  //Divers
  this.batipublicDiv.classList.remove('hidden');

}

function initPLU() {
    // PLU
    this.pluDiv.classList.remove('hidden');
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
    this.ppriDiv.classList.add('hidden');
    this.tnuDiv.classList.add('hidden');
    //Reglementaire
    this.monumentDiv.classList.remove('hidden');
    //Divers
    this.batipublicDiv.classList.add('hidden');

  }


function initEco() {
  // PLU
  this.pluDiv.classList.add('hidden');
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
  this.ppriDiv.classList.remove('hidden');
  this.tnuDiv.classList.remove('hidden');
  //Reglementaire
  this.monumentDiv.classList.add('hidden');
  //Divers
  this.batipublicDiv.classList.remove('hidden');

}
