import Observable from '../framework/observable.js';
export default class PointsModel extends Observable {
  #servise = null;
  #points = null;

  constructor(servise) {
    super();
    this.#servise = servise;
    this.#points = this.#servise.getPoints();
  }

  get points() {
    return this.#points;
  }
}
