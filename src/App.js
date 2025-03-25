import MapComponent from './components/MapComponent';
import React, { useState } from "react";

function App() {
  const [showGraph, setShowGraph] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('dijkstra');

  const handleAlgorithmChange = (event) => {
    setSelectedAlgorithm(event.target.value);
  };
  return (
    <div style={{
      height: '100vh',
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }}>
      {/* Header */}
      <header style={{
        display: "flex", justifyContent: "center", padding: "10px",
        background: "white",
      }}>
        <div>
          <label style={{ display: "flex", alignItems: "center", fontSize: "16px", cursor: "pointer", }}>
            <h2 style={{ textAlign: "center", marginRight: 10 }}>
              Emergency Services Map - Heidelberg
            </h2>
            <input
              type="checkbox"
              checked={showGraph}
              onChange={() => setShowGraph(prev => !prev)}
              style={{ marginRight: "8px", }}
            />
            Show Graph
          </label>
          {/* Algorithm Selection Dropdown */}
          <div style={{
            marginBottom: "10px", padding: "10px", background: "#f0f0f0", textAlign: "center"
          }}>
            <label htmlFor="algorithm-select" style={{ marginRight: "10px" }}>
              Choose Algorithm:
            </label>
            <select id="algorithm-select" value={selectedAlgorithm}
              onChange={handleAlgorithmChange}>

              <option value="dijkstra">Dijkstra's Algorithm</option>
              <option value="astar">A* Algorithm</option>
            </select>
          </div>
        </div>
      </header>
      <div style={{ flexGrow: 1, overflow: "hidden" }}>
        <MapComponent showGraph={showGraph} />
      </div>

    </div>
  );
}

export default App;
