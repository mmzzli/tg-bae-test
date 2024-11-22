import { StateCreator } from 'zustand'
export interface TGSlice {
  expand:boolean;
  setExpand:(expand:boolean)=>void;
}


export const createTGSlice: StateCreator<TGSlice> = (set) => ({
  expand:false,
  setExpand:(expand)=>set({expand})
})


