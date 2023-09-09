import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { FULL_DATE_TIME_FORMAT } from '../const';
import { humanizePointDate, capitalizeFirstLetterToLower } from '../utils/common';
import { POINT_EMPTY } from '../const';

function createTypelist([...types]) {
  return types.map((type) => `<div class="event__type-item">
    <input id="event-type-${capitalizeFirstLetterToLower(type)}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${capitalizeFirstLetterToLower(type)}">
      <label class="event__type-label  event__type-label--${capitalizeFirstLetterToLower(type)}" for="event-type-${capitalizeFirstLetterToLower(type)}-1">${type}</label>
  </div>`).join('');
}

function createOfferItem(offersByType, offersId) {
  if (offersByType) {
    return offersByType.offers.map(({ title, price, id }) => `<div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-luggage-1" type="checkbox" name="event-offer-luggage" ${offersId.includes(id) ? 'checked' : ''}>
        <label class="event__offer-label" for="event-offer-luggage-1">
          <span class="event__offer-title">${title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${price}</span>
        </label>
    </div>`
    ).join('');
  }
}

function createDestinationImg(destination) {
  if (destination) {
    return destination.pictures.map(({ src, description }) => `<img class="event__photo" src="${src}" alt="${description}" />
  `).join('');
  }
}

function createFormTemplate(point, offers, destinations, allTypesPoints) {

  const { dateFrom, dateTo, offers: offersId, basePrice, isDestinationChanged, isTypeChanged } = point;

  if (point === POINT_EMPTY) {
    destinations = point.destination;
  }

  if (destinations) {
    destinations = destinations.find((item) => item.id === isDestinationChanged);
  }

  const destinationPictures = createDestinationImg(destinations);

  offers = offers.find((offer) => offer.type === isTypeChanged);

  const offersList = createOfferItem(offers, offersId);

  const dateStartFormat = humanizePointDate(dateFrom, FULL_DATE_TIME_FORMAT);
  const dateEndFormat = humanizePointDate(dateTo, FULL_DATE_TIME_FORMAT);

  const typeList = createTypelist(allTypesPoints);

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${isTypeChanged}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

              <div class="event__type-list">
                <fieldset class="event__type-group">
                  <legend class="visually-hidden">Event type</legend>
                  ${typeList}
                </fieldset>
              </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${isTypeChanged}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinations ? destinations.name : ''}" list="destination-list-1">
              <datalist id="destination-list-1">
                <option value="Amsterdam"></option>
                <option value="Geneva"></option>
                <option value="Chamonix"></option>
              </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateStartFormat}">
              &mdash;
              <label class="visually-hidden" for="event-end-time-1">To</label>
              <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateEndFormat}" />
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${basePrice}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          ${point === POINT_EMPTY ? '<button class="event__reset-btn" type="reset">Cancel</button>' : `
            <button class="event__reset-btn" type="reset">Delete</button>
            <button class="event__rollup-btn" type="button"><span class="visually-hidden" > Open event</span></button >
          ` }
        </header>
        <section class="event__details">
          ${offersList ? `
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            <div class="event__available-offers">
              ${offersList}
            </div>
          </section>
          ` : ''}

          ${destinations ? `
          <section class="event__section  event__section--destination">
            <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            <p class="event__destination-description">${destinations.description}</p>

            <div class="event__photos-container">
              <div class="event__photos-tape">
                ${destinationPictures ? destinationPictures : ''}
              </div>
            </div>
          </section>
          ` : ''}

        </section>

      </form>
    </li>`
  );
}
export default class FormEditView extends AbstractStatefulView {
  #point = null;
  #offers = null;
  #destinations = null;
  #handleFormSave = null;
  #allTypesPoints = null;

  constructor({ point = POINT_EMPTY, offers, destinations, allTypesPoints, onSaveButtonClick }) {
    super();
    this._setState(FormEditView.parseOffersToState(point));

    //this.#point = point;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#allTypesPoints = allTypesPoints;
    this.#handleFormSave = onSaveButtonClick;

    this.element.querySelector('form')
      .addEventListener('submit', this.#formSaveHandler);

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#formSaveHandler);

    this.element.querySelector('.event__type-list')
      .addEventListener('click', this.#onChangeType);

    this.element.querySelector('.event__input--destination')
      .addEventListener('click', this.#onChangeDestination);
  }

  get template() {
    return createFormTemplate(this._state, this.#offers, this.#destinations, this.#allTypesPoints);
  }

  #formSaveHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSave(FormEditView.parseStateToOffers(this._state));
  };

  #onChangeType = (evt) => {
    if (evt.target.tagName !== 'LABEL') {
      return;
    }
    evt.preventDefault();

    const currentTypeElement = evt.target;
    const currentTypeItemElement = currentTypeElement.closest('.event__type-item');
    const currentInput = currentTypeItemElement.querySelector('.event__type-input');

    console.log(currentInput.value)
    this.updateElement({
      isTypeChanged: currentInput.value,
    });
  };

  #onChangeDestination = (evt) => {
    evt.preventDefault();

    console.log(evt.target.value)
    this.updateElement({
      isDestinationChanged: evt.target.value,
    });
  };

  static parseOffersToState(point) {
    return {
      ...point,
      isTypeChanged: point.type,
      isDestinationChanged: point.destination
    };
  }

  static parseStateToOffers(state) {
    const point = { ...state };

    if (point.isTypeChanged !== point.type) {
      console.log('Данные типа поездки изменились');
    }

    if (point.isDestinationChanged !== point.destination) {
      console.log('Данные пункта назначения изменились');
    }

    delete point.isTypeChanged;
    delete point.isDestinationChanged;

    return point;
  }
}
