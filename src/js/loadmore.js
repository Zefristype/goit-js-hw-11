import '../css/styles.css';
import { fetchImages } from '../js/fetchImages.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 150,
});

let searchValue = null;
let page = 1;

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();
  loadMoreBtn.classList.add('visually-hidden');
  cleanGallery();
  autoScrollUp();
  page = 1;
  searchValue = e.currentTarget.elements.searchQuery.value;
  if (!searchValue) {
    return;
  }
  try {
    const data = await fetchImages(searchValue, page);
    const { totalHits, hits } = data;

    if (totalHits === 0) {
      loadMoreBtn.classList.add('visually-hidden');
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    Notify.success(`Hooray! We found ${totalHits} images.`);

    makeMarkup(hits);
    lightbox.refresh();
    loadMoreBtn.classList.remove('visually-hidden');
    if (totalHits <= 40) {
      loadMoreBtn.classList.add('visually-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMore() {
  try {
    page += 1;
    const data = await fetchImages(searchValue, page);
    const { totalHits, hits } = data;

    makeMarkup(hits);
    lightbox.refresh();
    scrollOnLoadMore();

    if (totalHits <= page * 40) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      loadMoreBtn.classList.add('visually-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}

function makeMarkup(array) {
  const markup = array
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<a class="gallery__item" href=${largeImageURL}>
        <div class="photo-card">
      <img src=${webformatURL} alt="${tags}" loading="lazy" />
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          <span>${likes}</span>
        </p>
        <p class="info-item">
          <b>Views</b>
          <span>${views}</span>
        </p>
        <p class="info-item">
          <b>Comments</b>
          <span>${comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads</b>
          <span>${downloads}</span>
        </p>
      </div>
    </div></a>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}

function scrollOnLoadMore() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function cleanGallery() {
  gallery.innerHTML = '';
}

function autoScrollUp() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
