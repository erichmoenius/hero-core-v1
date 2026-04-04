export const videoLibrary = {

  base: [
    { name: "Cloud Soft", path: "/mov/base.mp4" },
    { name: "Cloud Dense", path: "/mov/base.mp4" },
    { name: "Ink Flow", path: "/mov/base.mp4" }
  ],

  mid: [
    { name: "Eye Close", path: "/mov/mid.mp4" },
    { name: "Eye Wide", path: "/mov/mid.mp4" }
  ],

  energy: [
    { name: "Energy Pulse", path: "/mov/energy.mp4" },
    { name: "Fire Flow", path: "/mov/energy.mp4" }
  ]

};


// ------------------------------------------------
// HELPERS
// ------------------------------------------------

export function getNames(layer){
  return videoLibrary[layer]?.map(v => v.name) || [];
}

export function getVideo(layer, name){
  return videoLibrary[layer]?.find(v => v.name === name);
}