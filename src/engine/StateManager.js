import { STATES } from "../config/states.config.js";

export class StateManager {

  constructor(){
    this.current = "state1";
    this.next = "state2";
    this.blend = 0;
  }

  update(progress){

    for(let i=0;i<STATES.length;i++){

      const s = STATES[i];

      if(progress >= s.start && progress < s.end){

        this.current = s.id;

        const nextState = STATES[i+1];
        this.next = nextState ? nextState.id : s.id;

        const range = s.end - s.start;
        this.blend = (progress - s.start) / range;

        break;

      }

    }

  }

  get(){

    return {
      current: this.current,
      next: this.next,
      blend: this.blend
    };

  }

}