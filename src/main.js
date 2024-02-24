import BoardPresenter from './presenter/board-presenter';
import HeaderPresenter from './presenter/header-presenter';
import TripInfoPresenter from './presenter/trip-info-presenter.js';

import PointsModel from './model/points-model';
import OffersModel from './model/offers-model';
import DestinationsModel from './model/destinations-model';
import FilterModel from './model/filter-model.js';

import newPointButtonView from './view/new-point-button-view';

import ApiService from './api-service';

import { render, RenderPosition } from './framework/render.js';

const AUTHORIZATION = 'Basic er883jdzbdw';
const END_POINT = 'https://21.objects.htmlacademy.pro/big-trip';

const tripMainEventsContainer = document.querySelector('.trip-main');
const tripEventsContainer = document.querySelector('.trip-events');

const service = new ApiService(END_POINT, AUTHORIZATION);
const offersModel = new OffersModel(service);
const destinationsModel = new DestinationsModel(service);
const pointsModel = new PointsModel({ service, offersModel, destinationsModel });
const filterModel = new FilterModel();

const boardPresenter = new BoardPresenter({ pointsModel, offersModel, destinationsModel, filterModel, blockNewPointButton, unBlockNewPointButton, tripEventsContainer });

const newPointButtonComponent = new newPointButtonView({
  onClick: newPointButtonClickHandler
});

new TripInfoPresenter({
  tripMainEventsContainer: tripMainEventsContainer,
  offersModel,
  destinationsModel,
  pointsModel
});

const headerPresenter = new HeaderPresenter({ pointsModel, filterModel, tripMainEventsContainer });

function newPointButtonClickHandler() {
  newPointButtonComponent.element.disabled = true;
  boardPresenter.createPoint();
}

function blockNewPointButton() {
  newPointButtonComponent.element.disabled = true;
}

function unBlockNewPointButton() {
  newPointButtonComponent.element.disabled = false;
}

boardPresenter.init();
headerPresenter.init();
render(newPointButtonComponent, tripMainEventsContainer, RenderPosition.BEFOREEND);
pointsModel.init();


