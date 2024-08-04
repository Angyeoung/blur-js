import { InspectorWindow } from "../src/inspector.js";

const i = new InspectorWindow("Wasd");
i.group("Hi");
i.slider("wasd", 0, 10, () => 5, () => {});

const j = new InspectorWindow("Sdaw");
j.group("Yo");
j.slider("Hey", 0, 10, () => 5, () => {});