import { MinPriorityQueue } from "@datastructures-js/priority-queue";

export function dijkstra(graph, startNode, nodes) {
    // store the shortest distance form the start node
    let distances = {};

    // track the shortest path
    let previous = {};

    // min priority queue for fast search of minimal element O(logV)
    let pq = new MinPriorityQueue((entry) => entry.priority);

    // initialize distances with infinity except the fitst one
    Object.keys(graph).forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    pq.enqueue({ node: startNode, priority: 0 })
    distances[startNode] = 0;

    while (!pq.isEmpty()) {
        // extract minimum node
        let { node: currentNode } = pq.dequeue();

        // stop the loop if no other path from the current node
        if (!currentNode || distances[currentNode] === Infinity) break;

        // update neighbors
        for (let neighbor of graph[currentNode]) {
            let newDist = distances[currentNode] + neighbor.weight;

            if (newDist < distances[neighbor.to]) {
                distances[neighbor.to] = newDist;
                previous[neighbor.to] = currentNode;
                pq.enqueue({ node: neighbor.to, priority: newDist });
            }
        }
    }

    // find the nearest hospital in distances
    let targetNode;
    let min = Infinity;
    Object.keys(nodes).forEach((node) => {
        if (nodes[node].type == 'hospital') {
            if (distances[node] < min) {
                min = distances[node];
                targetNode = node;
            }
        }
    })
    return { distances, previous, targetNode };
}
