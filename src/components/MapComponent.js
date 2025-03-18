import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Pane, Tooltip } from "react-leaflet";
import leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { dijkstra } from "../utils/algorithms/dijkstra";
import { findClosestNode } from "../utils/findClosestNode";
import { reconstructPath } from "../utils/reconstructPath";
import { useMapEvent } from "react-leaflet";
import { aStar } from "../utils/algorithms/astar";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const ClickHandler = ({ onClick }) => {
    useMapEvent("click", onClick);
    return null;
};

// icon for the user click marker
const userClickIcon = new leaflet.Icon({
    iconUrl: markerIconPng,
    shadowUrl: markerShadowPng,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// icon for the hospital marker
const hospitalIcon = leaflet.icon({
    iconUrl: require("../assets/hospital.png"),
    iconSize: [25, 25],
});

// icon for the intersection marker
const intersectionIcon = leaflet.icon({
    iconUrl: require("../assets/degree.png"),
    iconSize: [15, 15],
});

const MapComponent = ({ showGraph, selectedAlgorithm }) => {
    const [graph, setGraph] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shortestPath, setShortestPath] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [totalDistance, setTotalDistance] = useState(null);
    const [totalTime, setTotalTime] = useState(null);
    const [midpoint, setMidpoint] = useState(null);

    useEffect(() => {
        // fetch data from JSON file
        fetch(`${process.env.PUBLIC_URL}/heidelberg_graph.json`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                setGraph(data);
                setLoading(false);
            })
    }, []);

    if (loading) {
        return (
            <div className="spinner-container">
                <div className="spinner"></div>
            </div>
        );
    }

    const handleMapClick = (event) => {
        if (!graph) return;

        // user click's coordinates 
        const { lat, lng } = event.latlng;
        setSelectedPoint([lat, lng]);

        // find the closest intersection to the user click
        const startNode = findClosestNode(lat, lng, graph.nodes);

        // nearest hospital, path, all nodes distances from start node
        let targetNode, previous, distances;

        // perform selected algorithm
        if (selectedAlgorithm === "astar") {
            ({ gScore: distances, previous, targetNode } =
                aStar(graph.edges, startNode, graph.nodes));

        } else {
            ({ distances, previous, targetNode } =
                dijkstra(graph.edges, startNode, graph.nodes));
        }

        // reconstruct shortest path
        const path = reconstructPath(previous, targetNode);
        setShortestPath(path);

        // calculate location of ToolTip to display total distance and approximate time
        if (path.length == 0) {
            setMidpoint(null)
        }
        else if (path.length >= 2) {
            const midIndex = Math.floor(path.length / 2);
            setMidpoint(graph.nodes[path[midIndex]].coordinates);
        }
        else {
            setMidpoint(graph.nodes[path[0]].coordinates)
        }

        // calculate total distance of the shortest path 
        setTotalDistance(Math.round(distances[targetNode]));

        // calculate approximate time needed to get to the nearest hospital 
        setTotalTime(Math.round((distances[targetNode] / 13.9) / 60))
    }



    return (
        <MapContainer center={[49.411, 8.634]} zoom={14}
            style={{ height: '100vh', width: "100%", }} >
            <ClickHandler onClick={handleMapClick} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />
            {/* User Click Marker */}
            {selectedPoint && (
                <Marker position={selectedPoint} icon={userClickIcon}>
                    <Popup>Start Point</Popup>
                </Marker>
            )}
            {/* Hospitals */}
            {graph &&
                Object.entries(graph.nodes)
                    .filter(([_, node]) => node.type === "hospital")
                    .map(([id, node]) => (
                        <Marker key={id} position={node.coordinates} icon={hospitalIcon}>
                            <Popup>{node.name}</Popup>
                        </Marker>
                    ))}

            {showGraph && graph && (
                <>
                    {/* Intersections */}
                    {Object.entries(graph.nodes)
                        .filter(([_, node]) => node.type === "intersection")
                        .map(([id, node]) => (
                            <Marker key={id} position={node.coordinates} icon={intersectionIcon} />
                        ))}

                    {/* Roads (Edges) */}
                    {Object.entries(graph.edges).flatMap(([fromId, connections]) =>
                        connections.map((edge, index) => {
                            const fromNode = graph.nodes[fromId];
                            const toNode = graph.nodes[edge.to];

                            if (!fromNode || !toNode) return null;

                            return (
                                <Polyline
                                    key={`${fromId}-${index}`}
                                    positions={[fromNode.coordinates, toNode.coordinates]}
                                    color="gray"
                                    opacity={0.7}
                                />
                            );
                        })
                    )}
                </>
            )}
            {/* Shortest Path */}
            {shortestPath.length >= 1 && (
                <Pane name="shortest-path" style={{ zIndex: 500 }}>
                    <Polyline
                        positions={shortestPath.map(nodeId => graph.nodes[nodeId].coordinates)}
                        color="red"
                        weight={5}
                    />


                </Pane>
            )}
            {/* Total distance and approximate time */}
            {midpoint && (
                <Pane name="shortest-distance" style={{ zIndex: 600 }}>
                    <Marker position={midpoint}
                        icon={leaflet.divIcon({ className: "invisible-icon" })}>
                        <Tooltip
                            permanent direction="top"
                            offset={[0, -10]} o
                            pacity={1}
                            className="distance-tooltip">
                            <span style={{
                                backgroundColor: "white",
                                padding: "5px",
                                borderRadius: "5px",
                                fontWeight: "bold",
                                fontSize: "14px",
                                border: "2px solid black"

                            }}>

                                <text>
                                    {totalDistance} meters,
                                </text>
                                <text style={{ marginLeft: 10 }}>
                                    ~{totalTime} min
                                </text>

                            </span>
                        </Tooltip>
                    </Marker>
                </Pane>

            )}
        </MapContainer>
    );
};

export default MapComponent;
