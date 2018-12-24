import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

/*
Global State of the app
- Search object
- Current recipe object
- Shopping list object
- Linked recipes
*/

const state = {};

/*
**
**SEARCH CONTROLLER
**
*/

const Controlsearch = async () => {
    //1. get query from view
    const query = searchView.getResults();

    if(query){
        //2. new search object and add to state
        state.search = new Search(query);

        //3. Prep UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try{
            //4. Search for recipes
            await state.search.getResults();

            //5. render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err){
            alert('somethign went wrong');
        }

    }

}
document.querySelector('.search').addEventListener('submit', e => {
    e.preventDefault();
    Controlsearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closet('.btn-inline');
    
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        console.log(goToPage);
    }
});

/*
**
**RECIPE CONTROLLER
**
*/
const controlRecipe = async () => {
    //get id from url
    const id = window.location.hash.replace('#', '');

    if(id){
        //prepare ui fpr changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected search item
        if(state.search) searchView.hightlightSelected(id);

        //create new recipe object
        state.recipe = new Recipe(id);

        try{
            //get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //calculate servings and time 
            state.recipe.calcTime();
            state.recipe.calcServings();

            //render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );
        } catch (err) {
            alert('something went wrong');
        }
        

    }
};


['hashchange', 'load'].forEach(event => window.addEventListener(event,controlRecipe));

/*
**
**RECIPE CONTROLLER
**
*/
const controlList = () => {
    //create a new list if there is none yet
    if(!state.list) state.list = new List();

    //add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')){
        //delete from state
        state.list.deleteItem(id);

        //delete from UI
        listView.deleteItem(id);
    } else if (e.target.matches('.shopping__count--value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/*
**
**LIKE CONTROLLER
**
*/

const controlLike = () => {
    if(!state.likes) state,likes = new Likes();
    const currentID = state.recipe.id;

    //User has not liked current recipe
    if(!state.likes.isLiked(currentID)){
        //add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //toggle the like button
        likesView.toggleLikeBtn(true);

        //add like to UI list
        likesView.renderLike(newLike);

        //user has liked current recipe
    } else {
        //remove like fromthe state
        state.likes.deleteLike(currentID);

        //toggle the like button
        likesView.toggleLikeBtn(false);

        //remove like from UI list
        likesView.deleteLike(currentID);
    }
    listView.toggleLikeMenu(state.likes.getNumLikes());
};

//Resore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    //restore likes
    state.likes.readStorage();

    //toggle like menu button
    likesView.toggleLikeMenu(state.likes.getLikes());

    //render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});





//Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.mathces('.btn-decrease, .btn-decrease *')){
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.upadateServingsIngredients(state.recipe);
        }
        
        // button is clicked
    } else if (e.target.matchs('.btn-increase, .btn-increase *')){

        state.recipe.updateServings('inc');
        recipeView.upadateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        //add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')){
        //like controller
        controller();
    }
});

window.l = new List();

