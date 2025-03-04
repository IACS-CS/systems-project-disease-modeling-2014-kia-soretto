import React, { useEffect, useState } from "react";
import {
  createPopulation,
  updatePopulation,
  computeStatistics,
  trackedStats,
  defaultSimulationParameters,
} from "./diseaseModel";
import { renderChart } from "../../lib/renderChart";
import { renderTable } from "../../lib/renderTable";

let boxSize = 500;
let maxSize = 1000;

const renderPatients = (population) => {
  let amRenderingSubset = population.length > maxSize;
  const popSize = population.length;
  if (popSize > maxSize) {
    population = population.slice(0, maxSize);
  }

  function renderEmoji(p) {
    if (p.incubationCountdown > 0) {
      return "😷"; // Mask Face during incubation
    } else if (p.recoveryCountdown > 0) {
      return "🤢"; // Vomiting Face when contagious
    } else if (p.infected) {
      return "🤧"; // Sneezing Face
    } else {
      return "😀"; // Healthy person
    }
  }

  function renderSubsetWarning() {
    if (amRenderingSubset) {
      return (
        <div className="subset-warning">
          Only showing {maxSize} ({((maxSize * 100) / popSize).toFixed(2)}%) of{" "}
          {popSize} patients...
        </div>
      );
    }
  }

  return (
    <>
      {renderSubsetWarning()}
      {population.map((p) => (
        <div
          key={p.id}
          data-patient-id={p.id}
          data-patient-x={p.x}
          data-patient-y={p.y}
          className="patient"
          style={{
            transform: `translate(${(p.x / 100) * boxSize}px, ${
              (p.y / 100) * boxSize
            }px)`,
          }}
        >
          {renderEmoji(p)}
        </div>
      ))}
    </>
  );
};

const Simulation = () => {
  const [popSize, setPopSize] = useState(20);
  const [population, setPopulation] = useState(
    createPopulation(popSize * popSize)
  );
  const [diseaseData, setDiseaseData] = useState([]);
  const [lineToGraph, setLineToGraph] = useState("infected");
  const [autoMode, setAutoMode] = useState(false);
  const [simulationParameters, setSimulationParameters] = useState(
    defaultSimulationParameters
  );

  const runTurn = () => {
    let newPopulation = updatePopulation([...population], simulationParameters);
    setPopulation(newPopulation);
    let newStats = computeStatistics(newPopulation, diseaseData.length);
    setDiseaseData([...diseaseData, newStats]);
  };

  const resetSimulation = () => {
    setPopulation(createPopulation(popSize * popSize));
    setDiseaseData([]);
  };

  useEffect(() => {
    if (autoMode) {
      setTimeout(runTurn, 500);
    }
  }, [autoMode, population]);

  return (
    <div>
      <section className="top">
        <h1>Influenza Simulation</h1>
        <p>
          Simulating the spread of influenza with incubation and recovery
          periods!
        </p>

        <p>
          Population: {population.length}. Infected:{" "}
          {population.filter((p) => p.infected).length}
        </p>

        <button onClick={runTurn}>Next Turn</button>
        <button onClick={() => setAutoMode(true)}>AutoRun</button>
        <button onClick={() => setAutoMode(false)}>Stop</button>
        <button onClick={resetSimulation}>Reset Simulation</button>

        <div>
          <label>
            Incubation Period:
            <input
              type="number"
              value={simulationParameters.incubationPeriod}
              onChange={(e) =>
                setSimulationParameters({
                  ...simulationParameters,
                  incubationPeriod: parseInt(e.target.value),
                })
              }
            />
          </label>

          <label>
            Recovery Period:
            <input
              type="number"
              value={simulationParameters.recoveryPeriod}
              onChange={(e) =>
                setSimulationParameters({
                  ...simulationParameters,
                  recoveryPeriod: parseInt(e.target.value),
                })
              }
            />
          </label>

          <label>
            Population Size:
            <input
              type="number"
              value={Math.round(popSize * popSize)}
              onChange={(e) => setPopSize(Math.sqrt(parseInt(e.target.value)))}
            />
          </label>
        </div>
      </section>

      <section className="side-by-side">
        {renderChart(diseaseData, lineToGraph, setLineToGraph, trackedStats)}
        <div className="world">
          <div
            className="population-box"
            style={{ width: boxSize, height: boxSize }}
          >
            {renderPatients(population)}
          </div>
        </div>
        {renderTable(diseaseData, trackedStats)}
      </section>
    </div>
  );
};

export default Simulation;
