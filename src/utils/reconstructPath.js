export function reconstructPath(previous, target) {
    let path = [];
    var current = target;
    while (current != null) {
        path.push(current)
        current = previous[current]
    }

    return path.reverse();
}