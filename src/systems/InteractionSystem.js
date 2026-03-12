export class InteractionSystem{

constructor(camera){

this.camera = camera

this.mouse = {x:0,y:0}
this.smooth = {x:0,y:0}

window.addEventListener("mousemove",e=>{

this.mouse.x=(e.clientX/window.innerWidth-0.5)*2
this.mouse.y=-(e.clientY/window.innerHeight-0.5)*2

})

}

update(){

this.smooth.x+=(this.mouse.x-this.smooth.x)*0.06
this.smooth.y+=(this.mouse.y-this.smooth.y)*0.06

this.camera.position.x += (this.smooth.x*1.2-this.camera.position.x)*0.04
this.camera.position.y += (this.smooth.y*0.8-this.camera.position.y)*0.04

}

}