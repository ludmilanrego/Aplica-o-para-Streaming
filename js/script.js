let moviesData = [];
let modalData = [];
let pageOfItems = '';

const divMovies = document.querySelector('.movies');

const imgModal__close = document.querySelector('.modal__close');
const modal = document.querySelector('.modal');
const modal__title = document.querySelector('.modal__title');
const modal__img = document.querySelector('.modal__img');
const modal__description = document.querySelector('.modal__description');
const modal__average = document.querySelector('.modal__average');
const divModalGenres = document.querySelector('.modal__genres');

const btnPrev = document.querySelector('.btn-prev');
const btnNext = document.querySelector('.btn-next');

const MAX_DEFAULT_PAGE = 3;
const CARDS_PER_PAGE = 6;
let MAX_PAGE = MAX_DEFAULT_PAGE;
let MIN_PAGE = 1;

const searchInput = document.querySelector('.input');

const highlight_video = document.querySelector('.highlight__video');
const highlight__title = document.querySelector('.highlight__title');
const highlight__rating = document.querySelector('.highlight__rating');
const highlight__genres = document.querySelector('.highlight__genres');
const highlight__launch = document.querySelector('.highlight__launch');
const highlight__description = document.querySelector('.highlight__description');
const highlight__videoLink = document.querySelector('.highlight__video-link');

modal.addEventListener('click', (event) => {
    addEventListenerCloseModal(event)
});


imgModal__close.addEventListener('click', (event) => {
    addEventListenerCloseModal(event)
});

function addEventListenerCloseModal(event) {
    event.preventDefault();
    modal.classList.add('hidden');
}

function fillModalGenres() {
    divModalGenres.innerHTML = '';

    for (i = 0; i < modalData.genres.length; i++) {
        const spanModalGenre = document.createElement('span');
        spanModalGenre.classList.add('modal__genre');
        spanModalGenre.textContent = modalData.genres[i].name;
        divModalGenres.appendChild(spanModalGenre);
    }
}

function fillModal() {
    modal__title.textContent = modalData.title;
    modal__img.src = modalData.backdrop_path;
    modal__description.textContent = modalData.overview;
    modal__average.textContent = modalData.vote_average;
}

async function modalDataLoad(id) {
    try {
        const responseModal = await api.get(`/movie/${id}?language=pt-BR`);
        modalData = responseModal.data;
        fillModal();
        fillModalGenres();
    } catch (error) {
        console.log(error.response)
    }
}

function createAndFillMovieCard(i) {
    const divMovie = document.createElement('div');
    divMovie.classList.add('movie');
    divMovie.style.backgroundImage = `url(${moviesData[i].poster_path})`;
    divMovies.appendChild(divMovie);

    const divMovieInfo = document.createElement('div');
    divMovieInfo.classList.add('movie__info');
    divMovie.appendChild(divMovieInfo);

    const spanMovieTitle = document.createElement('span');
    spanMovieTitle.classList.add('movie__title');
    spanMovieTitle.textContent = moviesData[i].title;

    const spanMovieRating = document.createElement('span');
    spanMovieRating.classList.add('movie__rating');
    spanMovieRating.textContent = moviesData[i].vote_average;
    divMovieInfo.append(spanMovieTitle, spanMovieRating);

    const starIcon = document.createElement('img');
    starIcon.src = "assets/estrela.svg";
    starIcon.alt = "estrela";
    spanMovieRating.appendChild(starIcon);

    function addEventListenerOpenModal(id) {

        divMovie.addEventListener('click', (event) => {
            event.preventDefault();
            modal.classList.remove('hidden');
            modalDataLoad(id);
        });
    }
    addEventListenerOpenModal(moviesData[i].id);
}

function fillMoviesData(page) {
    divMovies.innerHTML = '';

    const itemsCountEnd = 6 * page;
    const itemsCountStart = 6 * (page - 1);

    for (i = itemsCountStart; i < itemsCountEnd; i++) {
        if (moviesData.length > i) {
            createAndFillMovieCard(i)
        }
    }
}

async function loadMovies() {
    try {
        const response = await api.get('/discover/movie?language=pt-BR&include_adult=false');
        moviesData = response.data.results;

        pageOfItems = 1;

        fillMoviesData(pageOfItems);

    } catch (error) {
        console.log(error.response)
    }
}

loadMovies();

btnNext.addEventListener('click', (event) => {
    event.stopPropagation();
    if (MAX_PAGE !== 1) {
        pageOfItems++
        if (pageOfItems > MAX_PAGE) {
            pageOfItems = 1;
        }
        fillMoviesData(pageOfItems);
    }
});

btnPrev.addEventListener('click', (event) => {
    event.stopPropagation();
    if (MAX_PAGE !== 1) {
        pageOfItems--
        if (pageOfItems < MIN_PAGE) {
            pageOfItems = MAX_PAGE - 1;
        }
        fillMoviesData(pageOfItems);
    }
})

function caculeteRequiredNumberOfPages(moviesData) {
    return MAX_PAGE_required = Math.ceil(moviesData.length / CARDS_PER_PAGE);
}

async function requestSearchedMovieData(seachedMovieTitle) {
    try {
        const response = await api.get(`/search/movie?language=pt-BR&include_adult=false&query=${seachedMovieTitle}`);
        moviesData = response.data.results;
        MAX_PAGE = caculeteRequiredNumberOfPages(moviesData);
        fillMoviesData(1);
    } catch (error) {
        console.log(error.response)
    }
}

function searchMovie() {
    const seachedMovieTitle = searchInput.value;
    searchInput.value = "";
    if (!seachedMovieTitle) {
        MAX_PAGE = MAX_DEFAULT_PAGE;
        loadMovies();
        return;
    }
    requestSearchedMovieData(seachedMovieTitle);
}

searchInput.addEventListener('keyup', (event) => {
    event.preventDefault();
    if (event.key !== "Enter") {
        return;
    }
    searchMovie();
});

function formatDate(date) {
    const formattedDate = new Date(date).toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
    return formattedDate;
}

function turnGenreArrayToString(genresArray) {
    let genresArrayName = [];
    for (i = 0; i < genresArray.length; i++) {
        genresArrayName.push(genresArray[i].name);
    }
    return genresArrayName.join(", ");
}

function fillDailyMovie(dailyMovieData, dailyMovieDataVideos) {
    highlight_video.style.background = `no-repeat center/100% url(${dailyMovieData.backdrop_path})`;
    highlight__title.textContent = dailyMovieData.title;
    highlight__rating.textContent = dailyMovieData.vote_average;
    highlight__genres.textContent = turnGenreArrayToString(dailyMovieData.genres);
    highlight__description.textContent = dailyMovieData.overview;
    highlight__launch.textContent = formatDate(dailyMovieData.release_date);
    highlight__videoLink.href = `https://www.youtube.com/watch?v=${dailyMovieDataVideos[0].key}`
}

async function loadDailyMovieVideos() {
    try {
        const response = await api.get(`/movie/436969/videos?language=pt-BR`);
        const dailyMovieDataVideos = response.data.results;
        return dailyMovieDataVideos;
    } catch (error) {
        console.log(error.response);
    }
}

async function loadDailyMovieData() {
    try {
        const response = await api.get(`/movie/436969?language=pt-BR`);
        const dailyMovieData = response.data;

        const dailyMovieDataVideos = await loadDailyMovieVideos();
        fillDailyMovie(dailyMovieData, dailyMovieDataVideos);

    } catch (error) {
        console.log(error.response);
    }
}

loadDailyMovieData();

const root = document.querySelector(":root");
const btnTheme = document.querySelector(".btn-theme");
const logoImg = document.querySelector(".logo-img");

let currentTheme = localStorage.getItem("theme");

function applyLightTheme() {
    btnTheme.src = "./assets/light-mode.svg";
    logoImg.src = "./assets/logo-dark.png";
    btnPrev.src = "./assets/arrow-left-dark.svg";
    btnNext.src = "./assets/arrow-right-dark.svg";
    imgModal__close.src = "./assets/close-dark.svg";
    root.style.setProperty("--background", "#fff");
    root.style.setProperty("--input-color", "#979797");
    root.style.setProperty("--text-color", "#1b2028");
    root.style.setProperty("--bg-secondary", "#ededed");
    root.style.setProperty("--rating-color", "#f1c40f");
    root.style.setProperty("--bg-modal", "#ededed");
}

function applyDarkTheme() {
    btnTheme.src = "./assets/dark-mode.svg";
    logoImg.src = "./assets/logo.svg";
    btnPrev.src = "./assets/arrow-left-light.svg";
    btnNext.src = "./assets/arrow-right-light.svg";
    imgModal__close.src = "./assets/close.svg";
    root.style.setProperty("--background", "#1B2028");
    root.style.setProperty("--input-color", "#979797");
    root.style.setProperty("--text-color", "#FFFFFF");
    root.style.setProperty("--bg-secondary", "#2D3440");
    root.style.setProperty("--rating-color", "#f1c40f");
    root.style.setProperty("--bg-modal", "#2D3440");
}

function applyCurrentTheme() {
    currentTheme = localStorage.getItem("theme");
    if (!currentTheme || currentTheme === "light") {
        btnTheme.src = "assets/sun.svg";
        applyLightTheme();
        return;
    }
    applyDarkTheme();
}

applyCurrentTheme();

btnTheme.addEventListener("click", () => {
    if (!currentTheme || currentTheme === "light") {
        localStorage.setItem("theme", "dark");
        applyCurrentTheme();
        return;
    }
    localStorage.setItem("theme", "light");
    applyCurrentTheme();
});