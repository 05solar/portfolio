import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./data.js";
import "./tweaks-panel.jsx";
import "./world.jsx";
import "./hud.jsx";
import "./modals.jsx";
import "./interior.jsx";
import App from "./app.jsx";

window.React = React;

createRoot(document.getElementById("root")).render(<App />);
