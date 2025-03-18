export function findClosestNode(lat, lng, nodes) {
    let minDist = Infinity;
    let closestNode = null;

    // search for the closest intersection for the point(lat,lng)
    Object.entries(nodes).forEach(([id, node]) => {
        if (node.type === "intersection") {
            const dist = Math.sqrt(
                (lat - node.coordinates[0]) ** 2 + (lng - node.coordinates[1]) ** 2
            );

            if (dist < minDist) {
                minDist = dist;
                closestNode = id;
            }
        }
    });

    return closestNode;
};