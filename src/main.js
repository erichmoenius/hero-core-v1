import { App } from "./core/App.js";

// Movie files for Theme 3
export const movieFiles = [
  "/assets/mov/test.mp4"
  // "/assets/mov/electric.webm",
  //"/assets/mov/mov1.webm",
  //"/assets/mov/mov2.webm",
  //"/assets/mov/mov3.webm",
  //"/assets/mov/mov4.webm"
];

// Return random movie file
export function getRandomMovie() {
  const i = Math.floor(Math.random() * movieFiles.length);
  return movieFiles[i];
}

window.addEventListener("DOMContentLoaded", () => {
  new App();
});