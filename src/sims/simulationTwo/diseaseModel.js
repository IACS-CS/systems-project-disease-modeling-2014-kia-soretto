import { shufflePopulation } from "../../lib/shufflePopulation";

export const defaultSimulationParameters = {
  incubationPeriod: 2,
  recoveryPeriod: 5,
};

export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize,
      y: (100 * Math.floor(i / sideSize)) / sideSize,
      infected: false,
      incubationCountdown: 0,
      recoveryCountdown: 0,
    });
  }

  // Infect patient zero...
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  patientZero.incubationCountdown = defaultSimulationParameters.incubationPeriod;
  return population;
};

const maybeInfectPerson = (person, params) => {
  person.infected = true;
  // Start incubation period for the newly infected person.
  person.incubationCountdown = params.incubationPeriod;
};



export const updatePopulation = (population, params) => { // took this from handshake game
  const shuffledPopulation = shufflePopulation(population);

  // Iterate through the shuffled population in pairs
  for (let i = 0; i < shuffledPopulation.length - 1; i += 2) {
    let personA = shuffledPopulation[i];
    let personB = shuffledPopulation[i + 1];

    // Let them meet at person A's spot and adjust positions:
    if (personA.x < 1) {
      personA.x += Math.ceil(Math.random() * 5);
    }
    if (personA.x > 99) {
      personA.x -= Math.ceil(Math.random() * 5);
    }

    // Adjust positions for meeting
    personA.x -= 1; // Person A moves slightly
    personB.x = personA.x + 2; // Person B stands next to Person A
    personB.y = personA.y;

    // Keep track of partners
    personA.partner = personB;
    personB.partner = personA;

    // Infection logic:   AI helped with this logic
    // Only someone who has finished their incubation (i.e. incubationCountdown === 0) is infectious.
    if (personA.infected && personA.incubationCountdown === 0 && !personB.infected) {
      maybeInfectPerson(personB, params);
    }
    if (personB.infected && personB.incubationCountdown === 0 && !personA.infected) {
      maybeInfectPerson(personA, params);
    }
  }

  // Update timers for incubation and recovery periods
  for (const person of population) {
    if (person.infected) {
      if (person.incubationCountdown > 0) {
        // Countdown incubation phase. Not yet infectious.
        person.incubationCountdown -= 1;
      } else if (person.recoveryCountdown === 0) {
        // Initiate recovery period once incubation has finished.
        person.recoveryCountdown = params.recoveryPeriod;
      } else if (person.recoveryCountdown > 0) {
        person.recoveryCountdown -= 1;
        if (person.recoveryCountdown === 0) {
          // Person recovers when recovery timer reaches 0
          person.infected = false;
        }
      }
    }
  }

  return population;
};

export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "Infectious", value: "infectious" },
];

export const computeStatistics = (population, round) => {
  let infected = 0;
  let infectious = 0;
  for (let p of population) {
    if (p.infected) {
      infected += 1;
      // consider if a person is infectious only when they have finished incubating.
      if (p.incubationCountdown === 0) {
        infectious += 1;
      }
    }
  }
  return { round, infected, infectious };
};

