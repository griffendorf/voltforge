import { CircuitGraph } from './graph';
import { SimLoop } from './simloop';
import { Store, HistoryMgr } from './persistence';

// Singletons shared across the app
export const G     = new CircuitGraph();
export const SIM   = new SimLoop(G);
export const STORE = new Store();
export const HIST  = new HistoryMgr();