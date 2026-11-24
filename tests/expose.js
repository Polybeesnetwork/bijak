// Expose the app's internal engine for direct unit testing (getters avoid TDZ issues).
window.__BM__ = {
  get genQuestion() { return genQuestion; },
  get solveSteps() { return solveSteps; },
  get nextDifficulty() { return nextDifficulty; },
  get weakSkills() { return weakSkills; },
  get allSkills() { return allSkills; },
  get MODULES() { return MODULES; },
  get skillAcc() { return skillAcc; },
  get frac() { return frac; },
};
