export class MorphSystem{

constructor(N){

this.from = new Float32Array(N*3)
this.to = new Float32Array(N*3)

this.progress = 1

}

start(fromBuf,toBuf){

this.from.set(fromBuf)
this.to.set(toBuf)

this.progress = 0

}

update(positions,speed){

if(this.progress>=1) return

this.progress += speed

const p = this.progress

for(let i=0;i<positions.length;i++){

positions[i] =
this.from[i] +
(this.to[i]-this.from[i])*p

}

}

}