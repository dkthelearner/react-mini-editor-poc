import React from "react";
import "./scratch-pad.css";
import Button from "../common/Button";
import classNames from "classnames";

// Initial state of the component
const initialState = {
  past: [],
  present: null,
  future: [],
};

// Component Reducer
const undoableReducer = (state, { type, payload }) => {
  const { past, present, future } = state;

  switch (type) {
    case "CLEAR":
      return {
        past: [],
        present: null,
        future: [],
      };
    case "ADD":
      return {
        past: [...past, payload],
        present: payload,
        future: [],
      };
    case "UNDO":
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: newPast.length ? previous : null,
        future: [present, ...future],
      };
    case "REDO":
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: present ? [...past, present] : [...past],
        present: next,
        future: newFuture,
      };
    default:
      return state;
  }
};

const ScratchPad = ({ onClose, visible, ...props }) => {
  const refTextArea = React.useRef();
  const [state, dispatch] = React.useReducer(undoableReducer, initialState);
  const canUndo = React.useMemo(() => !state.past.length, [state]);
  const canRedo = React.useMemo(() => !state.future.length, [state]);

  // Templates of the components
  const ctnClass = classNames({ "scratch-pad": true, open: visible });

  // Side effects of the components
  React.useEffect(() => {
    const el = refTextArea.current;
    el.focus();
    el.addEventListener("copy", onCopy);
    el.addEventListener("paste", onPaste);
    el.addEventListener("cut", onCut);
    return () => {
      el.removeEventListener("copy", onCopy);
      el.removeEventListener("paste", onPaste);
      el.removeEventListener("cut", onCut);
    };
  }, []);

  // Methods of the components
  const onChange = (e) => dispatch({ type: "ADD", payload: e.target.value });
  const onRedo = () => dispatch({ type: "REDO" });
  const onUndo = () => dispatch({ type: "UNDO" });
  const onClear = () => dispatch({ type: "CLEAR" });
  const onCopy = () => {
    try {
      const { selectionStart, selectionEnd } = refTextArea.current;
      const content = state.present.substring(
        selectionStart === selectionEnd ? 0 : selectionStart,
        selectionEnd
      );
      if (!navigator.clipboard) {
        console.error("Does not support  navigator.clipboard API");
        return;
      }
      navigator.clipboard.writeText(content).then(() => console.log("Copied!"));
    } catch (err) {
      console.error("Failed to write clipboard contents: ", err);
    }
  };

  const onPaste = () => {
    try {
      if (!navigator.clipboard) {
        console.error("Does not support  navigator.clipboard API");
        return;
      }
      navigator.clipboard.readText().then((txt) => {
        if (txt) dispatch({ type: "ADD", payload: state.present.concat(txt) });
      });
    } catch (err) {
      console.error("Failed to read operation clipboard contents: ", err);
    }
  };

  const onCut = () => {
    const { selectionStart, selectionEnd } = refTextArea.current;
    if (selectionStart === selectionEnd) {
      return;
    }
    const content = state.present.substring(selectionStart, selectionEnd);
    dispatch({ type: "ADD", payload: content });
  };

  return (
    <div className={ctnClass}>
      <div className="inline-flex my-4 justify-center">
        <Button label="Copy" onClick={onCopy} />
        <Button label="Paste" onClick={onPaste} />
        <Button label="Cut" onClick={onCut} />
        <Button label="Undo" onClick={onUndo} disabled={canUndo} />
        <Button label="Redo" onClick={onRedo} disabled={canRedo} />
        <Button label="Clear" onClick={onClear} />
        <Button label="X" onClick={() => onClose()} />
      </div>
      <textarea
        ref={refTextArea}
        rows="10"
        className="w-full px-4 py-2 text-gray-700 border rounded-l focus:outline-none"
        value={state.present || ""}
        onChange={onChange}
      ></textarea>
    </div>
  );
};

export default ScratchPad;
