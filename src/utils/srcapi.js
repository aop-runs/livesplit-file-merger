//Imports and constants
import axios from "axios"
const cacheExpiration = 86400000

//Fuzzy search all availble games matching a name thorugh Speedrun.com
export function fuzzySearchGames(game){
    const cache = gatherCache("Game", game);
    if(cache != null){
        return Promise.resolve(cache);
    }
    return axios.get(encodeURI(`https://www.speedrun.com/api/v1/games?name=${game}`));
}

//Fuzzy search all availble games matching a name thorugh Speedrun.com
export function searchCategoriesFromGame(id){
    const cache = gatherCache("Category", id);
    if(cache != null){
        return Promise.resolve(cache);
    }
    return axios.get(encodeURI(`https://www.speedrun.com/api/v1/games/${id}?embed=categories.variables`));
}

//Retrieves cache from local storage if one exists
function gatherCache(label, title){
    const cache = JSON.parse(localStorage.getItem(label + ": " + title));
    if(cache != null){
        if(Date.now() - cache.epoch < cacheExpiration){
            return {data: cache.data};
        }
    }
    return null;
}

//Caches newly fetched data to local storage
export function cacheNewData(label, title, data){
    localStorage.setItem(
        label + ": " + title,
        JSON.stringify({
            epoch: Date.now(),
            data
        })
    );
}