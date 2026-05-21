export function generateSphere(N,R){

const GOLDEN = Math.PI*(3-Math.sqrt(5))

const buf = new Float32Array(N*3)

for(let i=0;i<N;i++){

const t = i/(N-1)

const phi = Math.acos(1-2*t)
const theta = GOLDEN*i

buf[i*3]   = R*Math.sin(phi)*Math.cos(theta)
buf[i*3+1] = R*Math.sin(phi)*Math.sin(theta)
buf[i*3+2] = R*Math.cos(phi)

}

return buf

}