import { getEpisodes, getShows } from './app.js'

let showArrFav = []

async function setup() {
  const loading = document.getElementById('loading')
  const errorBox = document.getElementById('error')
  loading.style.display = 'block'
  const shows = await getShows()
  const showSelect = document.querySelector('#show-selector')
  showSelect.addEventListener('change', async (event) => {
    for (let i = 0; i < shows.length; i++) {
      if (event.target.value === shows[i].name) {
        allEpisodes = await getEpisodes(shows[i].id)
        makePageForEpisodes(allEpisodes)
        setupSearch(allEpisodes)
        episodeSelector(allEpisodes)
      } else if (event.target.value === 'all-shows') {
        displayShows(shows)
      }
    }
  })

  displayShows(shows)
  const sort_fav_btn = document.querySelector('#sort_fav')
  sort_fav_btn.addEventListener('click', () => renderFav(shows))
  // makePageForEpisodes(allEpisodes);
  // setupSearch(allEpisodes);
  // episodeSelector(allEpisodes);
}

function renderFav(shows) {
  const favShows = JSON.parse(localStorage.getItem('show'))
  const arrayfavshows = []
  favShows.forEach((favShow) => {
    shows.forEach((element) => {
      if (element.name == favShow.showTitle) {
        arrayfavshows.push(element)
      }
    })
  })

  displayShows(arrayfavshows)
}

function makePageForEpisodes(episodeList) {
  const component = displayMovies(episodeList, rootElem)
  for (const element of component) {
    rootElem.append(element)
  }
}

function setupSearch(allEpisodes) {
  const searchInput = document.getElementById('search-input')
  searchInput.addEventListener('keyup', (event) => {
    const filteredEpisodes = filterEpisodes(allEpisodes, event.target.value)
    const rootElem = document.getElementById('root')
    rootElem.innerHTML = ''
    const component = displayMovies(filteredEpisodes, rootElem)
    for (const element of component) {
      rootElem.append(element)
    }
    const resultCount = document.getElementById('result-count')
    if (resultCount) {
      resultCount.innerText = `Displaying ${filteredEpisodes.length} / ${allEpisodes.length} episodes`
    }
  })
}
function filterEpisodes(allEpisodes, searchText) {
  return allEpisodes.filter((episode) => {
    const { name, summary } = episode
    const episodeName = name.toLowerCase()
    const episodeSummary = summary.toLowerCase()
    const searchTextLower = searchText.toLowerCase()
    return episodeName.includes(searchTextLower) || episodeSummary.includes(searchTextLower)
  })
}
function episodeSelector(allEpisodes) {
  const select = document.getElementById('episode-selector')
  for (const episode of allEpisodes) {
    const opt = document.createElement('option')
    opt.value = episode.name
    opt.text = episode.name
    select.add(opt, null)
  }
  select.addEventListener('change', (event) => {
    if (event.target.value == 'all-episodes') {
      cleanDisplay()
      makePageForEpisodes(allEpisodes)
    } else {
      const matchedEpisodes = filterEpisodes(allEpisodes, event.target.value)
      cleanDisplay()
      const component = displayMovies(matchedEpisodes)
      const rootElem = document.getElementById('root')
      for (const element of component) {
        rootElem.append(element)
      }
    }
  })
}
function cleanDisplay() {
  const rootElem = document.getElementById('root')
  rootElem.innerHTML = ''
}
function displayMovies(Episodes) {
  const useOriginalImage = Episodes.length === 1
  return Episodes.map((episode) => {
    const { name, season, number, summary, image } = episode
    const img = useOriginalImage ? image.original : image.medium
    return movieComponent(name, season, number, summary, img)
  })
}
function displayShows(Shows) {
  cleanDisplay()
  const showCard = Shows.map((show) => {
    renderShowCard(show, showArrFav)
  })
}

function addFav(name, showArrFav, showFavbtn) {
  if (showFavbtn.className == 'fav-btn') {
    showFavbtn.className = 'fav-btn-active'
  } else {
    showFavbtn.className = 'fav-btn'
  }

  const showFav = {
    showTitle: name,
    Fav: true,
  }

  if (!localStorage.getItem('show')) {
    localStorage.setItem('show', JSON.stringify([showFav]))
  } else {
    const savedfavShows = JSON.parse(localStorage.getItem('show'))
    savedfavShows.push(showFav)
    localStorage.setItem('show', JSON.stringify(savedfavShows))
  }
}
function renderShowCard(show, showArrFav) {
  const rootElem = document.getElementById('root')
  const { name, image, summary, averageRuntime, genres, rating, url } = show

  const showFav = document.createElement('button')
  showFav.className = 'fav-btn'
  const showElement = document.createElement('article')
  const title = document.createElement('h3')
  const ratingElement = document.createElement('p')
  const detailsElement = document.createElement('div')
  const genresElement = document.createElement('p')
  const runTimeElement = document.createElement('p')
  const linkElement = document.createElement('a')
  detailsElement.append(genresElement, runTimeElement, ratingElement)

  showFav.textContent = 'Add To favourite'

  showFav.addEventListener('click', () => addFav(name, showArrFav, showFav))

  genresElement.innerText = `Genres: ${genres.join(', ')}`
  runTimeElement.innerText = `Run Time: ${averageRuntime} minutes`

  linkElement.href = url
  linkElement.innerText = 'View Details'
  ratingElement.innerText = `Rating: ${rating.average || 'N/A'}`
  const showSummary = document.createElement('p')
  const showImage = document.createElement('img')
  title.innerText = name
  showSummary.innerHTML = summary
  showImage.src = image.medium
  showImage.setAttribute('alt', name)
  showElement.append(showFav, title, showImage, showSummary, detailsElement, linkElement)
  rootElem.append(showElement)
}

function movieComponent(name, season, number, summary, img) {
  const movie = document.createElement('article')
  const title = document.createElement('h3')
  const movieSummary = document.createElement('p')
  const movieImage = document.createElement('img')

  title.innerText = `${formatEpisodeName(name)} - ${formatEpisodeNumber(season, number)}`
  movieSummary.innerHTML = summary
  movieImage.src = img
  movieImage.setAttribute('alt', title.innerText)
  movie.append(title, movieImage, movieSummary)
  return movie
}
function formatEpisodeName(name) {
  const maxLength = 25
  return name.length < maxLength ? name : `${name.substring(0, maxLength - 3)}...`
}
function formatEpisodeNumber(season, number) {
  return `\nS${season < 10 ? '0' : ''}${season}E${number < 10 ? '0' : ''}${number}`
}

window.onload = setup
