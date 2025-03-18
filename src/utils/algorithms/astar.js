import { MinPriorityQueue } from "@datastructures-js/priority-queue";

export function aStar(graph, startNode, nodes) {
    // store the shortest distance form the start node
    let gScore = {};

    // estimated total cost (g + h)
    let fScore = {};

    // track the shortest path
    let previous = {};

    // priority queue
    let openSet = new MinPriorityQueue((entry) => entry.priority);

    // initialize distances with infinity except the fitst one
    Object.keys(graph).forEach(node => {
        gScore[node] = Infinity;
        fScore[node] = Infinity;
        previous[node] = null;
    });

    gScore[startNode] = 0;
    fScore[startNode] = 0;
    openSet.enqueue({ node: startNode, priority: fScore[startNode] });

    // update neighbors
    while (!openSet.isEmpty()) {
        // extract minimum based on f
        let { node: currentNode } = openSet.dequeue();

        // found the nearest hospital
        if (nodes[currentNode].type === "hospital") {
            return { gScore, previous, targetNode: currentNode };
        }

        for (let neighbor of graph[currentNode] || []) {
            let tentativeG = gScore[currentNode] + neighbor.weight;

            if (tentativeG < gScore[neighbor.to]) {
                gScore[neighbor.to] = tentativeG;

                // heuristic value calculated for the nearest hospital
                let hScore = Math.min(
                    ...Object.keys(nodes)
                        .filter(node => nodes[node].type === "hospital")
                        .map(node => heuristic(nodes[neighbor.to].coordinates, nodes[node].coordinates))
                );
                fScore[neighbor.to] = tentativeG + hScore
                previous[neighbor.to] = currentNode;
                openSet.enqueue({ node: neighbor.to, priority: fScore[neighbor.to] });
            }
        }
    }
    return { gScore, previous, targetNode: null };
}

// calcutate Euclidean distance
function heuristic(coord1, coord2) {
    return Math.sqrt(
        (coord1[0] - coord2[0]) ** 2 +
        (coord1[1] - coord1[1]) ** 2
    );
}