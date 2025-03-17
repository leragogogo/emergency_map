import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import leaflet from "leaflet";
import "leaflet/dist/leaflet.css";

const hospitalIcon = leaflet.icon({
    iconUrl: require("../assets/hospital.png"),
    iconSize: [25, 25],
});

const intersectionIcon = leaflet.icon({
    iconUrl: require("../assets/degree.png"),
    iconSize: [20, 20],
});

const MapComponent = () => {
    const [graph, setGraph] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/data/heidelberg_graph.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setGraph(data);
                setLoading(false);
            })
    }, []);

    if (loading) return <p>Loading graph...</p>;

    return (
        <MapContainer center={[49.411, 8.634]} zoom={14} style={{ height: "100vh", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            />

            {/* Render Nodes (Intersections & Hospitals) */}
            {graph &&
                Object.entries(graph.nodes)
                    .map(([id, node]) => {
                        return (
                            <Marker
                                key={id}
                                position={node.coordinates}
                                icon={node.type === "hospital" ? hospitalIcon : intersectionIcon}
                            >
                                <Popup>
                                    {node.type === "hospital" ? `🏥 ${node.name}` : `Intersection ${id}`}
                                </Popup>
                            </Marker>
                        );
                    })}

            {/* Render Edges (Roads) */}
            {graph &&
                Object.entries(graph.edges)
                    .flatMap(([fromId, connections]) =>
                        connections.map((edge, index) => {

                            const fromNode = graph.nodes[fromId];
                            const toNode = graph.nodes[edge.to];

                            return (
                                <Polyline
                                    key={`${fromId}-${index}`}
                                    positions={[fromNode.coordinates, toNode.coordinates]}
                                    color="blue"
                                />
                            );
                        })
                    )}
        </MapContainer>
    );
};

export default MapComponent;
