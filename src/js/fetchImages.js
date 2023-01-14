import axios from 'axios';
const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '32700249-946444406968560521eecb27d';

export async function fetchImages(searchValue, page) {
  const response = await axios.get(`${BASE_URL}?key=${API_KEY}&q=${searchValue}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`);
  return response.data;
}
