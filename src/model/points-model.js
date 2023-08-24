export default class PointsModel {
  constructor(service) {
    this.service = service;
    this.points = service.getPoints();
  }

  get() {
    return this.points;
  }
}
