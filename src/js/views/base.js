export const elements = {
    searchForm: document.querySelector('.search'),        
    searchInput: document.querySelector('.search__field'),
    searchRes: document.querySelector('.results'),
    searchResult: document.querySelector('.results__list')
};
export const elementStrings = {
    loader: 'loader'
};

export const renderLoader = parent => {
    const loader = '<div class="loader"><svg><use href = "img.icons/svg#icon-cw"></use></svg></div>';
    parent.insertAdjacentHTML('afterbegin', loader);
};

export conts clearLoader = () => {
    const loader = docment.querySelector('.${elements.loader}');
    if(loader) loader,parentElement.removeChild(loader);
};