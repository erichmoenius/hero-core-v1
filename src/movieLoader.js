export function loadMovieTexture(path) {

  const video = document.createElement("video");

  video.src = path;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;

  video.play();

  const texture = new THREE.VideoTexture(video);

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBAFormat;

  return texture;
}