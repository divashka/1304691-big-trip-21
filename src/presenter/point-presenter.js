import { render, replace, remove } from '../framework/render';
import PointView from '../view/point-view';
import FormEditView from '../view/form-edit-view';
import { OFFER_EMPTY } from '../const';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING'
};

export default class PointPresenter {
  #containerPoints = null;
  #pointComponent = null;
  #formEditComponent = null;
  #handlePointChange = null;
  #handleModeChange = null;
  #point = null;
  #mode = Mode.DEFAULT;
  #offersModel = null;
  #destinationsModel = null;
  #pointsModel = null;
  #allTypesPoints = new Set();

  constructor({ containerPoints, offersModel, destinationsModel, onPointChange, pointsModel, onModeChange }) {
    this.#containerPoints = containerPoints;
    this.#handlePointChange = onPointChange;
    this.#handleModeChange = onModeChange;
    this.#offersModel = offersModel;
    this.#pointsModel = pointsModel;
    this.#destinationsModel = destinationsModel;
  }

  init(point) {

    this.#point = point;

    const prevPointComponent = this.#pointComponent;
    const prevFormEditComponent = this.#formEditComponent;

    this.#pointComponent = new PointView(
      {
        point: this.#point,
        offers: this.#offersModel.getByType(point.type) ?? OFFER_EMPTY,
        destination: this.#destinationsModel.getById(point.destination),
        onEditButtonClick: this.#editButtonClickHandler,
        onFavoriteButtonClick: this.#favoriteButtonClickHandler
      }
    );

    this.#formEditComponent = new FormEditView(
      {
        point: this.#point,
        offers: this.#offersModel.offers,
        destinations: this.#destinationsModel.destinations,
        allTypesPoints: this.#getTypesOfAllPoints(),
        onSaveButtonClick: this.#saveButtonClickHandler,
        onResetButtonClick: this.#resetButtonClickHandler
      }
    );

    if (prevPointComponent === null || prevFormEditComponent === null) {
      render(this.#pointComponent, this.#containerPoints);
      return;
    }

    if (this.#mode === 'DEFAULT') {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === 'EDITING') {
      replace(this.#formEditComponent, prevFormEditComponent);
    }

    remove(prevPointComponent);
    remove(prevFormEditComponent);

  }

  get points() {
    return this.#pointsModel.points;
  }

  #getTypesOfAllPoints() {
    this.#pointsModel.points.forEach((points) => this.#allTypesPoints.add(points.type));
    return this.#allTypesPoints;
  }

  resetView() {
    if (this.#mode !== 'DEFAULT') {
      this.#formEditComponent.reset(this.#point);
      this.#replaceFormEditToPoint();
    }
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#formEditComponent);
  }

  #replacePointToFormEdit() {
    replace(this.#formEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escapeKeyDownHandler);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  }

  #replaceFormEditToPoint() {
    replace(this.#pointComponent, this.#formEditComponent);
    document.removeEventListener('keydown', this.#escapeKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #editButtonClickHandler = () => {
    this.#replacePointToFormEdit();
  };

  #saveButtonClickHandler = (updatedPoint) => {
    this.#handlePointChange({ ...this.point, ...updatedPoint });
    this.#replaceFormEditToPoint();
  };

  #resetButtonClickHandler = () => {
    this.#formEditComponent.reset(this.#point);
    this.#replaceFormEditToPoint();
  };

  #favoriteButtonClickHandler = () => {
    this.#handlePointChange({ ...this.#point, isFavorite: !this.#point.isFavorite });
  };

  #escapeKeyDownHandler = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      this.#formEditComponent.reset(this.#point);
      this.#replaceFormEditToPoint();
    }
  };

}
