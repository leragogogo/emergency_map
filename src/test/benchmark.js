import { dijkstra } from "../utils/algorithms/dijkstra";
import { aStar } from "../utils/algorithms/astar";
import { findClosestNode } from "../utils/findClosestNode";
import { reconstructPath } from "../utils/reconstructPath";

// test scenarios
const testScenarios = [
    { id: 1, start: [49.405, 8.680] },
    { id: 2, start: [49.420, 8.670] },
    { id: 3, start: [49.435, 8.675] },
    { id: 4, start: [49.410, 8.655] },
    { id: 5, start: [49.430, 8.685] }
];

// measure time and memory
export async function runBenchmark(graph, nodes) {
    console.log("Running Pathfinding Benchmark...\n");

    for (let scenario of testScenarios) {
        console.log(`Scenario ${scenario.id}: Start Point ${scenario.start}`);

        // find the nearest node in the graph
        const startNode = findClosestNode(scenario.start[0], scenario.start[1], nodes);

        // run Dijkstra
        const memoryBeforeDijkstra = window.performance.memory.usedJSHeapSize;
        let dijkstraStart = performance.now();
        let { distances, previous, targetNode: dijkstraTargetNode } = dijkstra(graph, startNode, nodes);
        let dijkstraEnd = performance.now();
        let dijkstraTime = dijkstraEnd - dijkstraStart;

        let dijkstraHospital = findClosestHospitalFromDistances(distances, nodes);
        let dijkstraPath = reconstructPath(previous, dijkstraHospital);

        // measure memory after Dijkstra
        const memoryAfterDijkstra = window.performance.memory.usedJSHeapSize;
        // convert to MB
        let dijkstraMemoryUsage = (memoryAfterDijkstra - memoryBeforeDijkstra) / (1024 * 1024);

        // run A*
        const memoryBeforeAStar = window.performance.memory.usedJSHeapSize;
        let aStarStart = performance.now();
        let { gScore, previous: aStarPrevious, targetNode } = aStar(graph, startNode, nodes);
        let aStarEnd = performance.now();
        let aStarTime = aStarEnd - aStarStart;

        // measure memory after A*
        const memoryAfterAStar = window.performance.memory.usedJSHeapSize;
        // convert to MB
        let aStarMemoryUsage = (memoryAfterAStar - memoryBeforeAStar) / (1024 * 1024);

        let aStarPath = reconstructPath(aStarPrevious, targetNode);

        // compare paths
        let samePath = JSON.stringify(dijkstraPath) === JSON.stringify(aStarPath);

        console.log(`Nearest Hospital (Dijkstra): ${dijkstraHospital}`);
        console.log(`Nearest Hospital (A*): ${targetNode}`);
        console.log(`Paths Match? ${samePath ? "Yes" : "No"}`);
        console.log(`Dijkstra Time: ${dijkstraTime.toFixed(3)} ms`);
        console.log(`A* Time: ${aStarTime.toFixed(3)} ms`);
        console.log(`Dijkstra Memory: ${dijkstraMemoryUsage.toFixed(3)} MB`);
        console.log(`A* Memory: ${aStarMemoryUsage.toFixed(3)} MB`);
        console.log(`A* was ${(dijkstraTime / aStarTime).toFixed(2)}x faster than Dijkstra\n`);
    }
}

// find the closest hospital from Dijkstra results
function findClosestHospitalFromDistances(distances, nodes) {
    let minDistance = Infinity;
    let closestHospital = null;

    Object.keys(nodes).forEach(node => {
        if (nodes[node].type === "hospital" && distances[node] < minDistance) {
            minDistance = distances[node];
            closestHospital = node;
        }
    });

    return closestHospital;
}
