import React from "react";
import ScratchPad from "./components/ScratchPad";
import Button from "./common/Button";
import "./App.css";

function App() {
  const [showPad, setShowPad] = React.useState(false);
  console.log("Scratch Pad", showPad);
  return (
    <div className="App py-4">
      <Button label="Scratch Pad" onClick={() => setShowPad(true)} />
      <ScratchPad visible={showPad} onClose={() => setShowPad(false)} />
    </div>
  );
}

export default App;
