import * as THREE from "three";

export function loadMovieTexture(path) {

  const video = document.createElement("video");

  video.src = path;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  // 🎬 HIER
  video.playbackRate = 0.5;

  const texture = new THREE.VideoTexture(video);

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;

  window.addEventListener("click", () => {
    video.play().catch(e => console.warn("video play failed", e));
  });

  return texture;
}