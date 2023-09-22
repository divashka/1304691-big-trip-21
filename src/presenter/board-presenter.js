import { RenderPosition, render } from '../framework/render';
import SortView from '../view/sort-view';
import ListView from '../view/list-view';
import NoPointsView from '../view/no-points-view';
import PointPresenter from './point-presenter';
import { SortType, enabledSortType } from '../const';
import { sortPointsByTime, sortPointsByPrice } from '../utils/common';

const tripEvents = document.querySelector('.trip-events');
export default class PointsPresenter {
  #pointsModel = null;
  #offersModel = null;
  #destinationsModel = null;
  #sortComponent = null;

  #pointsListComponent = new ListView();
  #noPointsComponent = new NoPointsView();

  #pointPresenters = new Map();
  #currentSortType = SortType.DEFAULT;

  constructor({pointsModel, offersModel, destinationsModel}) {
    this.#pointsModel = pointsModel;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
  }

  init() {
    this.#renderBoard();
  }

  get points() {

    switch (this.#currentSortType) {
      case SortType.TIME:
        return [...this.#pointsModel.points].sort(sortPointsByTime);
      case SortType.PRICE:
        return [...this.#pointsModel.points].sort(sortPointsByPrice);
    }

    return this.#pointsModel.points;
  }

  #pointChangeHandler = (updatedPoint) => {
    // Здесь будем вызывать обновление модели
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #modeChangeHandler = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #sortChangeHandler = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearPointsList();
    this.#renderPointsList();
  };

  #renderSort() {
    const sortItems = this.#generateSort();

    this.#sortComponent = new SortView({
      sortItems: sortItems,
      onSortChange: this.#sortChangeHandler
    });

    render(this.#sortComponent, this.#pointsListComponent.element, RenderPosition.AFTERBEGIN);
  }

  #generateSort() {
    return Object.values(SortType).map(
      (type) => ({
        type,
        isChecked: (type === this.#currentSortType),
        isDisabled: !enabledSortType[type]
      }),
    );
  }

  #renderPoints(points) {
    points.forEach((point) => {
      this.#renderPoint(point);
    });
  }

  #renderPoint(point) {

    const pointPresenter = new PointPresenter(
      {
        containerPoints: this.#pointsListComponent.element,
        offersModel: this.#offersModel,
        destinationsModel: this.#destinationsModel,
        pointsModel: this.#pointsModel,
        onPointChange: this.#pointChangeHandler,
        onModeChange: this.#modeChangeHandler,
      }
    );

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearPointsList() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #renderPointsList() {
    render(this.#pointsListComponent, tripEvents);
    this.#renderPoints(this.points);
  }

  #renderBoard() {
    if (this.points.length === 0) {
      this.#renderNoPoints();
      return;
    }

    this.#renderSort();
    this.#renderPointsList();
  }

  #renderNoPoints() {
    render(this.#noPointsComponent, this.#pointsListComponent.element);
  }

}

