import { shufflePopulation } from "../../lib/shufflePopulation";

// Update this code to simulate a simple disease model!

// For this simulation, let's consider a simple disease that spreads through contact.
// You can implement a simple model which does one of the following:
// ...

export const defaultSimulationParameters = {
  infectionChance: 50,
  incubationPeriod: 3, // Number of days for incubation period
  // Add any new parameters you want here with their initial values
  // -- you will also have to add inputs into your jsx file if you want
  // your user to be able to change these parameters.
};

/* Creates your initial population. By default, we only track whether people
are infected. Any other attributes you want to track would have to be added
as properties on your initial individual. 

For example, if you want to track a disease which lasts for a certain number
of rounds (e.g., an incubation period or an infectious period), you would need
to add a property such as daysInfected which tracks how long they've been infected.

Similarly, if you wanted to track immunity, you would need a property that shows
whether people are susceptible or immune (i.e., susceptibility or immunity). */

export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize, // X-coordinate within 100 units
      y: (100 * Math.floor(i / sideSize)) / sideSize, // Y-coordinate scaled similarly
      infected: false,
      daysInfected: 0,
    });
  }
  // Infect patient zero...
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  return population;
};

// Example: Maybe infect a person (students should customize this)
const updateIndividual = (person, contact, params) => {
  // Add some logic to update the individual!
  // For example...
  if (person.infected) {
    person.daysInfected += 1;
    if (person.daysInfected >= params.incubationPeriod) {
      person.newlyInfected = false;
    }
  } else {
    if (contact.infected && contact.daysInfected >= params.incubationPeriod) {
      if (Math.random() * 100 < params.infectionChance) {
        person.newlyInfected = true;
        person.infected = true;
      }
    }
  }
};

// Example: Update population (students decide what happens each turn)
export const updatePopulation = (population, params) => {
  // Include shufflePopulation if you want to shuffle...
  // population = shufflePopulation(population);
  // Example logic... each person is in contact with the person next to them...
  for (let i = 0; i < population.length; i++) {
    let p = population[i];
    // This logic just grabs the next person in line -- you will want to 
    // change this to fit your model! 
    let contact = population[(i + 1) % population.length];
    // Update the individual based on the contact...
    updateIndividual(p, contact, params);
  }
  return population;
};

// Stats to track (students can add more)
// Any stats you add here should be computed
// by Compute Stats below
export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "Newly Infected", value: "newlyInfected" },
];

// Example: Compute stats (students customize)
export const computeStatistics = (population, round) => {
  let infected = 0;
  let newlyInfected = 0;
  for (let p of population) {
    if (p.infected) {
      infected += 1; // Count the infected
    }
    if (p.newlyInfected) {
      newlyInfected += 1; // Count the newly infected
    }
  }
  return { round, infected, newlyInfected };
};
