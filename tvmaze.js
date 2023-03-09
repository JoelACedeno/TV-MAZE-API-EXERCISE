"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

// THIS RUNS SECOND -- RETURN DATA FROM API, LOG TO CONSOLE & CREATE OBJECT OF DESIRED DATA
async function getShowsByTerm(term) {
  const res = await axios.get("http://api.tvmaze.com/search/shows", {
    params: {
      q: term
    }
  });
   
  console.log("logging shows by term from API:", res.data);

  return res.data.map(res => {
    const show = res.show

    return {
    id: show.id,
    name: show.name,
    summary: show.summary,
    image: show.image ? show.image.medium : "https://tinyurl.com/tv-missing"
    }
  });
}


/** Given list of shows, create markup for each and to DOM */

//THIS RUNS THIRD -- USING OBJECTS CREATED FROM getShowsByTerm TO CREATE DOM
function populateShows(shows) {
  $showsList.empty();
  console.log("logging specific shows data:", shows);
  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image} alt=${show.id} class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn" id="show-episodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
// THIS RUNS FIRST -- AFTER SUBMITTING FORM
async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (event) {
  event.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

//  DURING displayEpisodes(), THIS FUNCTION RETRIEVES ID, NAME, SEASON AND NUMBER EPISODE DATA FROM THE API
async function getEpisodesOfShow(id) {
  const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`)
  return res.data.map(ep => ({
    id: ep.id,
    name: ep.name,
    season: ep.season,
    number: ep.number
  }));
}


//  AFTER displayEpisodes(), THIS FUNCTION CREATES ELEMENTS FOR THE DOM
function populateEpisodes(episodes) {
  //create <ul> where <li's> are episodes
  //for every episode create an li with the episode information
  for(let episode of episodes){
    const $ep = $(
      `<li>
        ${episode.name}
        (season ${episode.season}, episode ${episode.number})
      </li>`
      );
    $episodesList.append($ep);
  }
  $episodesArea.show();
}


//  THIS FUNCTION FINDS THE SHOW'S ID USING JQUERY, PASSES THAT VALUE TO getEpisodesOfShow() AND SAVES THE RETURNED VALUE TO A VARIABLE. THE VARIABLE SET IS THEN PASSED TO populateEpisodes(). 
async function displayEpisodes(event){
  const showId = $(event.target).closest(".Show").data("show-id");
  console.log("selected show ID is:", showId);

  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
  console.log(episodes);
}


//  IF EPISODES BUTTON IS CLICKED RUN displayEpisodes()
$showsList.on("click", "#show-episodes", displayEpisodes);