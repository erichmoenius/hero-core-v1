import * as THREE from "three";

export function loadMovieTexture(path){

  const video = document.createElement("video");

  video.src = path;

  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.crossOrigin = "anonymous";

  video.autoplay = true;
  video.preload = "auto";

  // 🔥 zuverlässiger Start
  const playVideo = () => {
    video.currentTime = 0;
    video.play().catch(()=>{});
  };

  video.addEventListener("loadeddata", playVideo);

  // fallback (wichtig für Browser)
  window.addEventListener("click", playVideo, { once: true });

  const texture = new THREE.VideoTexture(video);

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;

  return texture;
}