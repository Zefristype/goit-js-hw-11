import '../css/styles.css';
import { fetchImages } from './fetchImages.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');

let searchValue = null;
let page = null;

const guardOptions = {
  root: null,
  rootMargin: '500px',
  threshold: 0,
};

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 150,
});

const observer = new IntersectionObserver(onScroll, guardOptions);

form.addEventListener('submit', onSearch);

async function onSearch(e) {
  e.preventDefault();
  cleanGallery();
  autoScrollUp();
  observer.observe(guard);
  page = 1;
  searchValue = e.currentTarget.elements.searchQuery.value;
  if (!searchValue) {
    return;
  }
  try {
    const data = await fetchImages(searchValue, page);
    const { totalHits, hits } = data;

    if (totalHits === 0) {
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    Notify.success(`Hooray! We found ${totalHits} images.`);

    makeMarkup(hits);
    lightbox.refresh();
  } catch (error) {
    console.log(error);
  }
}

async function onScroll(entries, observer) {
  const entry = entries[0];
  if (!entry.isIntersecting) {
    return;
  }
  if (!gallery.childNodes.length > 0) {
    return;
  }

  page += 1;
  try {
    const { totalHits, hits } = await fetchImages(searchValue, page);
    if (totalHits <= 40) {
      observer.unobserve(guard);
      return;
    }
    makeMarkup(hits);
    lightbox.refresh();

    if (totalHits <= page * 40) {
      observer.unobserve(guard);
      Notify.info("We're sorry, but you've reached the end of search results.");
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

function cleanGallery() {
  gallery.innerHTML = '';
}

function autoScrollUp() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
