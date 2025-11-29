const TMDB_API_KEY = '61167bb8f939b55724390c6e71df0753';
const OMDB_API_KEY = 'e6e8ba26';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const OMDB_BASE_URL = 'https://www.omdbapi.com';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

const heroSection = document.getElementById('hero-section');
const movieGrid = document.getElementById('movie-grid');
const sectionTitle = document.getElementById('section-title');
const searchInput = document.getElementById('search-input');
const categoryPills = document.querySelectorAll('.category-pill');


const modal = document.getElementById('movie-modal');
const closeModalBtn = document.querySelector('.close-modal');
const modalPoster = document.getElementById('modal-poster-img');
const modalTitle = document.getElementById('modal-title');
const modalYear = document.getElementById('modal-year');
const modalRating = document.getElementById('modal-rating');
const modalRuntime = document.getElementById('modal-runtime');
const modalGenres = document.getElementById('modal-genres');
const modalPlot = document.getElementById('modal-plot');
const modalActors = document.getElementById('modal-actors');

const videoOverlay = document.getElementById('video-overlay');
const closeVideoBtn = document.querySelector('.close-video');
const videoFrameContainer = document.getElementById('video-frame-container');
let currentCategory = 'trending';

document.addEventListener('DOMContentLoaded', () => {
    fetchTrendingMovies();

    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const type = pill.dataset.type;
            const id = pill.dataset.id;
            const label = pill.innerText;

            sectionTitle.innerText = `${label} Movies`;
            currentCategory = type;

            if (type === 'trending') {
                fetchTrendingMovies();
            } else if (type === 'genre') {
                fetchMoviesByGenre(id);
            } else if (type === 'top_rated') {
                fetchTopRated();
            } else if (type === 'korean') {
                fetchKoreanMovies();
            }
        });
    });

    let timeout = null;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        const query = e.target.value.trim();

        if (query.length > 2) {
            timeout = setTimeout(() => {
                searchMovies(query);
            }, 500);
        } else if (query.length === 0) {
            fetchTrendingMovies();
        }
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
        }
    });

    if (closeVideoBtn) {
        closeVideoBtn.addEventListener('click', closeVideoPlayer);
    }

    videoOverlay.addEventListener('click', (e) => {
        if (e.target === videoOverlay) {
            closeVideoPlayer();
        }
    });
});

async function fetchTrendingMovies() {
    showLoading();
    try {
        const response = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        renderHero(data.results.slice(0, 2));
        renderGrid(data.results.slice(2));
    } catch (error) {
        console.error('Error fetching trending:', error);
        showError('Failed to load trending movies. Please check your API key.');
    }
}

async function fetchMoviesByGenre(genreId) {
    showLoading();
    try {
        const response = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`);
        const data = await response.json();
        renderGrid(data.results);
    } catch (error) {
        showError('Failed to load movies.');
    }
}

async function fetchTopRated() {
    showLoading();
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        renderGrid(data.results);
    } catch (error) {
        showError('Failed to load top rated movies.');
    }
}

async function fetchKoreanMovies() {
    showLoading();
    try {
        const response = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=ko&sort_by=popularity.desc`);
        const data = await response.json();
        renderGrid(data.results);
    } catch (error) {
        showError('Failed to load Korean movies.');
    }
}

async function searchMovies(query) {
    showLoading();
    sectionTitle.innerText = `Search Results for "${query}"`;

    try {
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        renderGrid(data.results);
    } catch (error) {
        showError('Failed to search movies.');
    }
}

function renderHero(movies) {
    heroSection.innerHTML = '';
    movies.forEach((movie, index) => {
        const colClass = index === 0 ? 'col-md-6' : 'col-md-6';
        const wrapper = document.createElement('div');
        wrapper.className = colClass;

        const card = document.createElement('div');
        card.className = 'hero-card  d-flex align-items-end p-4 rounded-4 position-relative overflow-hidden shadow-lg';
        card.style.transition = 'transform 0.3s ease';

        // Add hover effect via JS or keep in CSS. Let's keep specific hover in CSS or add inline
        card.onmouseover = () => card.style.transform = 'translateY(-5px)';
        card.onmouseout = () => card.style.transform = 'translateY(0)';

        if (movie.backdrop_path) {
            card.style.backgroundImage = `url('${BACKDROP_BASE_URL}${movie.backdrop_path}')`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
        }

        // Gradient overlay
        const overlay = document.createElement('div');
        overlay.className = 'position-absolute top-0 start-0 w-100 h-100';
        overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)';
        card.appendChild(overlay);

        const content = document.createElement('div');
        content.className = 'hero-content position-relative z-1 w-100';
        content.innerHTML = `
            <h2 class="display-6 fw-bold mb-3 text-white" style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${movie.title}</h2>
            <button class="play-btn btn btn-light rounded-pill px-4 py-2 d-flex align-items-center gap-2 border-0" onclick="showMovieDetails(${movie.id})">
                <div class="play-icon-circle bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 24px; height: 24px;"><i class="ri-play-fill"></i></div>
                More Info
            </button>
        `;

        card.appendChild(content);
        wrapper.appendChild(card);
        heroSection.appendChild(wrapper);
    });
}

function renderGrid(movies) {
    movieGrid.innerHTML = '';

    if (movies.length === 0) {
        movieGrid.innerHTML = '<div class="col-12"><p class="error-message text-center text-danger p-4 bg-danger bg-opacity-10 rounded-3">No movies found.</p></div>';
        return;
    }

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        const col = document.createElement('div');
        col.className = 'col';

        const card = document.createElement('div');
        card.className = 'movie-card h-100 d-flex flex-column gap-2 cursor-pointer';
        card.style.transition = 'transform 0.3s ease';
        card.onmouseover = () => card.style.transform = 'translateY(-5px)';
        card.onmouseout = () => card.style.transform = 'translateY(0)';

        card.onclick = () => showMovieDetails(movie.id);

        card.innerHTML = `
            <div class="poster-wrapper w-100 rounded-4 overflow-hidden position-relative shadow-sm" style="aspect-ratio: 1/1.1;">
                <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}" loading="lazy" class="w-100 h-100 object-fit-cover" style="transition: transform 0.5s ease;">
            </div>
            <div class="movie-info">
                <h4 class="h6 fw-medium mb-1 text-truncate text-white">${movie.title}</h4>
                <div class="meta d-flex align-items-center gap-3 small text-white-50">
                    <span class="rating d-flex align-items-center gap-1 text-warning"><i class="ri-star-fill"></i> ${movie.vote_average.toFixed(1)}</span>
                    <span class="year">${new Date(movie.release_date).getFullYear() || 'N/A'}</span>
                </div>
            </div>
        `;

        const img = card.querySelector('img');
        card.addEventListener('mouseenter', () => img.style.transform = 'scale(1.05)');
        card.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');

        col.appendChild(card);
        movieGrid.appendChild(col);
    });
}

function showLoading() {
    movieGrid.innerHTML = `
        <div class="col-12 d-flex justify-content-center align-items-center" style="height: 200px;">
            <div class="spinner-border text-light" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>`;
}

function showError(message) {
    movieGrid.innerHTML = `<div class="col-12"><div class="error-message text-center text-danger p-4 bg-danger bg-opacity-10 rounded-3">${message}</div></div>`;
}

async function showMovieDetails(tmdbId) {
    try {
        const externalResponse = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`);
        const externalData = await externalResponse.json();
        const imdbId = externalData.imdb_id;

        if (imdbId) {
            const omdbResponse = await fetch(`${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`);
            const omdbData = await omdbResponse.json();

            if (omdbData.Response === "True") {
                populateModal(omdbData, tmdbId);
                modal.classList.add('active');
                modal.style.opacity = '1';
                modal.style.pointerEvents = 'all';
            } else {
                fetchTmdbDetails(tmdbId);
            }
        } else {
            fetchTmdbDetails(tmdbId);
        }
    } catch (error) {
        console.error('Error fetching details:', error);    
        fetchTmdbDetails(tmdbId);
    }
}

async function fetchTmdbDetails(tmdbId) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`);
        const data = await response.json();

        const mappedData = {
            Title: data.title,
            Year: data.release_date ? data.release_date.split('-')[0] : 'N/A',
            imdbRating: data.vote_average.toFixed(1),
            Runtime: `${data.runtime} min`,
            Genre: data.genres.map(g => g.name).join(', '),
            Plot: data.overview,
            Actors: 'N/A',
            Poster: data.poster_path ? `${IMAGE_BASE_URL}${data.poster_path}` : 'N/A'
        };

        populateModal(mappedData, tmdbId);
        modal.classList.add('active');
        modal.style.opacity = '1';
        modal.style.pointerEvents = 'all';
    } catch (error) {
        console.error('Error fetching TMDb details:', error);
        alert('Failed to load movie details.');
    }
}

function populateModal(data, tmdbId = null) {
    modalTitle.innerText = data.Title;
    modalYear.innerText = data.Year;
    modalRating.innerHTML = `<i class="ri-star-fill text-warning"></i> ${data.imdbRating}`;
    modalRuntime.innerText = data.Runtime;
    modalPlot.innerText = data.Plot;
    modalActors.innerText = data.Actors;

    if (data.Poster && data.Poster !== 'N/A') {
        modalPoster.src = data.Poster;
    } else {
        modalPoster.src = 'assets/images/poster1.png';
    }

    modalGenres.innerHTML = '';
    const genres = data.Genre.split(', ');
    genres.forEach(genre => {
        const span = document.createElement('span');
        span.className = 'badge bg-white bg-opacity-10 text-white fw-normal rounded-pill px-3 py-2 border border-light border-opacity-10';
        span.innerText = genre;
        modalGenres.appendChild(span);
    });

    const watchBtn = document.querySelector('.modal-actions .play-btn');
    if (watchBtn) {
        const newBtn = watchBtn.cloneNode(true);
        watchBtn.parentNode.replaceChild(newBtn, watchBtn);

        newBtn.addEventListener('click', () => {
            if (tmdbId) {
                playMovie(tmdbId);
            } else {
                alert('Cannot play video without TMDb ID');
            }
        });
    }
}

function closeVideoPlayer() {
    videoOverlay.classList.remove('active');
    videoOverlay.style.opacity = '0';
    videoOverlay.style.pointerEvents = 'none';
    videoFrameContainer.innerHTML = '';
}

async function playMovie(tmdbId) {
    if (typeof tmdbId === 'string') {
        console.log('Searching for trailer by title not implemented, pass ID');
        return;
    }

    try {
        const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbId}/videos?api_key=${TMDB_API_KEY}`);
        const data = await response.json();

        const trailer = data.results.find(vid => vid.site === 'YouTube' && vid.type === 'Trailer') ||
            data.results.find(vid => vid.site === 'YouTube');

        if (trailer) {
            openVideoPlayer(trailer.key);
        } else {
            alert('Sorry, no trailer available for this movie.');
        }
    } catch (error) {
        console.error('Error fetching trailer:', error);
        alert('Failed to load trailer.');
    }
}

function openVideoPlayer(videoKey) {
    videoFrameContainer.innerHTML = `
        <iframe 
            src="https://www.youtube.com/embed/${videoKey}?autoplay=1" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            class="w-100 h-100 border-0 rounded-4">
        </iframe>
    `;
    videoOverlay.classList.add('active');
    videoOverlay.style.opacity = '1';
    videoOverlay.style.pointerEvents = 'all';
}
