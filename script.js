// API
const PokeAPI = "https://pokeapi.co/api/v2/pokemon";
const pokemonCount = 1025;
const quickSearchPool = [
    ["pikachu", 25, "electric"], ["arcanine", 59, "fire"], ["bulbasaur", 1, "grass"], ["charizard", 6, "fire"],
    ["blastoise", 9, "water"], ["gengar", 94, "ghost"], ["dragonite", 149, "dragon"], ["mewtwo", 150, "psychic"],
    ["umbreon", 197, "dark"], ["espeon", 196, "psychic"], ["tyranitar", 248, "rock"], ["lucario", 448, "fighting"],
    ["greninja", 658, "water"], ["sylveon", 700, "fairy"], ["gardevoir", 282, "psychic"], ["metagross", 376, "steel"],
    ["rayquaza", 384, "dragon"], ["kyogre", 382, "water"], ["groudon", 383, "ground"], ["garchomp", 445, "dragon"],
    ["reshiram", 643, "dragon"], ["zekrom", 644, "dragon"], ["decidueye", 724, "grass"], ["lycanroc", 745, "rock"],
    ["corviknight", 823, "flying"], ["dragapult", 887, "dragon"], ["ceruledge", 937, "fire"], ["iron-valiant", 1006, "fairy"],
    ["koraidon", 1007, "fighting"], ["miraidon", 1008, "electric"], ["wooper", 194, "water"], ["spheal", 363, "ice"],
    ["psyduck", 54, "water"], ["snorlax", 143, "normal"], ["ditto", 132, "normal"], ["jigglypuff", 39, "normal"],
    ["scizor", 212, "bug"], ["ampharos", 181, "electric"], ["milotic", 350, "water"], ["absol", 359, "dark"],
    ["zoroark", 571, "dark"], ["mimikyu", 778, "ghost"], ["rockruff", 744, "rock"], ["sprigatito", 906, "grass"],
    ["fuecoco", 909, "fire"], ["quaxly", 912, "water"], ["pawmi", 921, "electric"], ["tinkaton", 957, "fairy"]
].map(function([name, id, type]){ return {name, id, type}; });

// DOM Elements
const searchForm = document.getElementById("searchForm");
const pokemonInput = document.getElementById("pokemonInput");
const searchBtn = document.getElementById("searchBtn");
const searchBtnLabel = document.getElementById("searchBtnLabel");
const chipButtons = document.querySelectorAll(".chip-btn");

const statusMsg = document.getElementById("statusMsg");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");

const pokemonCard = document.getElementById("pokemonCard");
const cardId = document.getElementById("cardId");
const cardName = document.getElementById("cardName");
const cardTypes = document.getElementById("cardTypes");
const cardImage = document.getElementById("cardImage");

const cardHeight = document.getElementById("cardHeight");
const cardWeight = document.getElementById("cardWeight");
const cardGeneration = document.getElementById("cardGeneration");
const cardBaseExperience = document.getElementById("cardBaseExperience");
const basicTypes = document.getElementById("basicTypes");
const basicShinyImage = document.getElementById("basicShinyImage");

const movesList = document.getElementById("movesList");
const movesStatus = document.getElementById("movesStatus");
const loadMoreMovesBtn = document.getElementById("loadMoreMovesBtn");

const statsList = document.getElementById("statsList");
const statsTotal = document.getElementById("statsTotal");

const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

const spriteGenderButtons = document.getElementById("spriteGenderButtons");
const spriteVariantButtons = document.getElementById("spriteVariantButtons");
const spriteFormGroup = document.getElementById("spriteFormGroup");
const spriteFormButtons = document.getElementById("spriteFormButtons");
const spriteSourceButtons = document.getElementById("spriteSourceButtons");

const selectedSpriteImage = document.getElementById("selectedSpriteImage");
const selectedSpriteLabel = document.getElementById("selectedSpriteLabel");


// App state
let currentPokemon = null;
let currentSpritePokemon = null;
let currentSpecies = null;
let activeSearchToken = 0;
let spriteFormToken = 0;

let moveIndex = 0;
const movesPerPage = 10;
let moveLoadToken = 0;

let spriteState = {
    gender: "male",
    variant: "default",
    form: "",
    source: "normal"
};


// Format names
function formatName(text){
    if(!text){
        return "";
    }

    const words = text.split("-");

    for(let i = 0; i < words.length; i++){
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(" ");
}

function normalizePokemonQuery(value){
    const input = String(value).trim().toLowerCase();
    if(!input){
        return "";
    }

    if(input === "nidoran♀" || input === "nidoran female") return "nidoran-f";
    if(input === "nidoran♂" || input === "nidoran male") return "nidoran-m";

    return input.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.'’]/g, "")
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-|-$/g, "");
}

function shuffle(items){
    const result = items.slice();
    for(let i = result.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function populateRandomPicks(){
    const picks = shuffle(quickSearchPool).slice(0, chipButtons.length);

    chipButtons.forEach(function(button, index){
        const pick = picks[index];
        const name = pick.name;
        const arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "↗";
        button.dataset.name = name;
        button.dataset.searchId = String(pick.id);
        button.dataset.type = pick.type;
        button.replaceChildren(document.createTextNode(formatName(name) + " "), arrow);
    });
}


// Status
function showStatus(message,isError = false){
    statusMsg.hidden = false;
    loadingState.hidden = true;
    errorState.hidden = true;

    statusMsg.textContent = message;
    statusMsg.classList.toggle("error",isError);
}

function showLoading(){
    statusMsg.hidden = true;
    loadingState.hidden = false;
    errorState.hidden = true;
}

function showError(message){
    statusMsg.hidden = true;
    loadingState.hidden = true;
    errorState.hidden = false;
    errorMessage.textContent = message;
}

function hideStatus(){
    statusMsg.hidden = true;
    loadingState.hidden = true;
    errorState.hidden = true;
}
// Tabs
function showTab(tabName){
    tabButtons.forEach(function(button){
        const active = button.dataset.tab === tabName;
        button.classList.toggle("active",active);
        button.setAttribute( "aria-selected", active ? "true" : "false");
    });

    tabPanels.forEach(function(panel){
        const active = panel.dataset.panel === tabName;
        panel.hidden = !active;
        panel.classList.toggle("active",active);
    });
}

tabButtons.forEach(function(button){
    button.addEventListener("click",function(){
        showTab(button.dataset.tab);
    });
});

// Type badges
function renderTypes(container,types){
    container.innerHTML = "";

    for(let i = 0; i < types.length; i++){
        const typeName = types[i].type.name;
        const badge = document.createElement("span");

        badge.className = "type-badge";
        badge.dataset.type = typeName;
        badge.textContent = formatName(typeName);
        container.appendChild(badge);
    }
}

// Pokemon header
function renderPokemonHeader(data){
    const primaryType = data.types[0].type.name;

    pokemonCard.dataset.type = primaryType;
    pokemonCard.hidden = false;

    cardId.textContent = "#" + String(data.id).padStart(3,"0");
    cardName.textContent = formatName(data.name);

    renderTypes(cardTypes,data.types);

    const imageUrl = data.sprites.other?.["official-artwork"]?.front_default || data.sprites.front_default;
    if(imageUrl){
        cardImage.src = imageUrl;
        cardImage.alt = "Artwork of " + formatName(data.name);
    }else{
        cardImage.removeAttribute("src");
        cardImage.alt = "No artwork available";
    }
}
// Basic information
function renderBasicInfo(data,speciesData){
    cardHeight.textContent = (data.height / 10).toFixed(1) + " m";
    cardWeight.textContent = (data.weight / 10).toFixed(1) + " kg";
    cardBaseExperience.textContent = data.base_experience !== null ? data.base_experience : "N/A";

    cardGeneration.textContent = speciesData?.generation ? formatName(speciesData.generation.name) : "Unknown";

    renderTypes(basicTypes,data.types);
    const shinyImage = data.sprites.other?.["official-artwork"]?.front_shiny || data.sprites.front_shiny;

    if(shinyImage){
        basicShinyImage.src = shinyImage;
        basicShinyImage.alt = "Shiny artwork of " + formatName(data.name);
        basicShinyImage.hidden = false;
    }else{
        basicShinyImage.removeAttribute("src");
        basicShinyImage.alt = "";
        basicShinyImage.hidden = true;
    }
}
// Move helpers
function getMoveEffect(data){
    if(!data?.effect_entries){
        return "No effect information available.";
    }

    for(let i = 0; i < data.effect_entries.length; i++){
        if(data.effect_entries[i].language.name === "en"){
            return ( data.effect_entries[i].short_effect || data.effect_entries[i].effect || "No effect information available.");
        }
    }

    return "No effect information available.";
}

function getMoveDamageClass(data){
    if(!data?.damage_class?.name){
        return "Unknown";
    }

    return formatName(data.damage_class.name);
}

function getMoveLearnInfo(entry){
    if(!entry.version_group_details){
        return "Unknown";
    }

    const methods = [];
    const levels = [];

    for( let i = 0; i < entry.version_group_details.length; i++){
        const detail = entry.version_group_details[i];
        const method = detail.move_learn_method?.name;

        if(method){
            const methodName = formatName(method);
            if(!methods.includes(methodName)){
                methods.push(methodName);
            }
        }
        if( detail.level_learned_at !== null && detail.level_learned_at > 0){
            if(!levels.includes(detail.level_learned_at)){
                levels.push(detail.level_learned_at);
            }
        }
    }

    let result = methods.length > 0 ? methods.join(", ") : "Unknown";

    if(levels.length > 0){
        levels.sort(function(a,b){
            return a - b;
        });

        result += " • Lv. " + levels[0];
    }

    return result;
}
// Fetch move details
async function fetchMove(url){
    try{
        const response = await fetch(url);

        if(!response.ok){
            return null;
        }
        return await response.json();
    }catch(error){
        return null;
    }
}

// Render one move
function renderMove(entry,data){
    const item = document.createElement("article");
    item.className = "move-item";
    if(data?.type?.name){
        item.dataset.type = data.type.name;
    }


    const top = document.createElement("div");
    top.className = "move-top";


    const name = document.createElement("h4");
    name.textContent =
        formatName(entry.move.name);

    const moveType = document.createElement("span");
    moveType.className = "move-type";

    if(data?.type?.name){
        moveType.dataset.type =
            data.type.name;

        moveType.textContent =
            formatName(data.type.name);
    }else{
        moveType.textContent =
            "Unknown Type";
    }

    top.appendChild(name);
    top.appendChild(moveType);

    const details = document.createElement("div");
    details.className = "move-details";

    const category = document.createElement("span");
    category.textContent = "Category: " + getMoveDamageClass(data);

    const power = document.createElement("span");
    power.textContent = "Power: " + (data?.power ?? "—");

    const accuracy = document.createElement("span");
    accuracy.textContent = "Accuracy: " + (data?.accuracy ?? "—");

    const pp = document.createElement("span");
    pp.textContent = "PP: " + (data?.pp ?? "—");

    const learn = document.createElement("span");
    learn.textContent = "Learn: " + getMoveLearnInfo(entry);

    details.appendChild(category);
    details.appendChild(power);
    details.appendChild(accuracy);
    details.appendChild(pp);
    details.appendChild(learn);

    const effect = document.createElement("p");
    effect.className = "move-effect";
    effect.textContent = getMoveEffect(data);

    item.appendChild(top);
    item.appendChild(details);
    item.appendChild(effect);

    movesList.appendChild(item);
}

// Load next 10 moves
async function loadMoreMoves(){
    if( !currentPokemon || !currentPokemon.moves || moveIndex >= currentPokemon.moves.length){
        loadMoreMovesBtn.hidden = true;
        return;
    }
    const token = moveLoadToken;
    loadMoreMovesBtn.disabled = true;
    movesStatus.textContent = "Loading moves...";
    const batch = currentPokemon.moves.slice( moveIndex, moveIndex + movesPerPage);

    const results = await Promise.all(
        batch.map(function(entry){
            return fetchMove(entry.move.url);
        })
    );

    if(token !== moveLoadToken){
        return;
    }

    for(let i = 0; i < batch.length; i++){
        renderMove( batch[i], results[i]);
    }

    moveIndex += batch.length;
    movesStatus.textContent = "Showing " + moveIndex + " of " + currentPokemon.moves.length + " moves";

    if(moveIndex < currentPokemon.moves.length){
        loadMoreMovesBtn.hidden = false;
        loadMoreMovesBtn.disabled = false;
    }else{
        loadMoreMovesBtn.hidden = true;
        loadMoreMovesBtn.disabled = false;
    }
}
// Render moves
function renderMoves(data){
    moveLoadToken++;

    movesList.innerHTML = "";
    moveIndex = 0;

    movesStatus.textContent = "Loading moves...";
    loadMoreMovesBtn.hidden = true;
    loadMoreMovesBtn.disabled = true;

    loadMoreMoves();
}

loadMoreMovesBtn.addEventListener(
    "click",
    function(){
        loadMoreMoves();
    }
);

// Stats
function renderStats(data){
    statsList.innerHTML = "";

    if(!data.stats || data.stats.length === 0){
        statsTotal.textContent = "N/A";
        return;
    }

    const statNames = {
        hp: "HP",
        attack: "Attack",
        defense: "Defense",
        "special-attack": "Special Attack",
        "special-defense": "Special Defense",
        speed: "Speed"
    };

    let total = 0;

    for(let i = 0; i < data.stats.length; i++){
        const stat = data.stats[i];
        const value = stat.base_stat;

        const name = statNames[stat.stat.name] || formatName(stat.stat.name);

        total += value;
        const row = document.createElement("div");
        row.className = "stat-row";

        const label = document.createElement("span");
        label.className = "stat-name";
        label.textContent = name;

        const bar = document.createElement("progress");
        bar.className = "stat-bar";
        bar.max = 255;
        bar.value = value;

        const number = document.createElement("span");
        number.className = "stat-value";
        number.textContent = value;

        row.appendChild(label);
        row.appendChild(bar);
        row.appendChild(number);

        statsList.appendChild(row);
    }

    statsTotal.textContent = total;
}
// Sprite helpers
function hasFemaleSprites(data){
    return Boolean( data.sprites.front_female || data.sprites.front_shiny_female || data.sprites.other?.dream_world?.front_female);
}

function getNormalSprite(data,gender,variant){
    if(gender === "female"){
        return variant === "shiny" ? data.sprites.front_shiny_female : data.sprites.front_female;
    }

    return variant === "shiny" ? data.sprites.front_shiny : data.sprites.front_default;
}

function getOfficialArtwork(data,variant){
    const artwork = data.sprites.other?.["official-artwork"];

    if(!artwork){
        return null;
    }

    return variant === "shiny" ? artwork.front_shiny : artwork.front_default;
}

function getDreamWorldSprite(data,gender){
    const dream = data.sprites.other?.dream_world;
    if(!dream){
        return null;
    }

    return gender === "female" ? dream.front_female : dream.front_default;
}


// Sprite buttons
function createSpriteButton(container,label,value,group){
    const button = document.createElement("button");

    button.type = "button";
    button.className = "sprite-btn";
    button.textContent = label;
    button.dataset.value = value;

    button.addEventListener("click",function(){
        if(button.disabled){
            return;
        }

        if(group === "form"){
            selectSpriteForm(value);
            return;
        }

        spriteState[group] = value;

        updateSpriteAvailability();
        updateSelectedSprite();
    });

    container.appendChild(button);
}

function updateSpriteButtons(group){
    let container = null;

    if(group === "gender"){
        container = spriteGenderButtons;
    }else if(group === "variant"){
        container = spriteVariantButtons;
    }else if(group === "form"){
        container = spriteFormButtons;
    }else{
        container = spriteSourceButtons;
    }

    if(!container){
        return;
    }

    const buttons =
        container.querySelectorAll(".sprite-btn");

    buttons.forEach(function(button){
        const active = button.dataset.value === spriteState[group] && !button.disabled;

        button.classList.toggle( "active", active);
    });
}

function updateSpriteAvailability(){
    if(!currentPokemon){
        return;
    }

    const data = currentSpritePokemon || currentPokemon;

    const genderButtons =
        spriteGenderButtons.querySelectorAll(".sprite-btn");

    const variantButtons =
        spriteVariantButtons.querySelectorAll(".sprite-btn");

    genderButtons.forEach(function(button){
        let available = true;

        if(button.dataset.value === "female"){
            if(spriteState.source === "normal"){
                available = spriteState.variant === "shiny" ? Boolean(data.sprites.front_shiny_female) : Boolean(data.sprites.front_female);
            }else if(spriteState.source === "dream"){
                available = Boolean( data.sprites.other?.dream_world?.front_female);
            }else{
                available = false;
            }
        }

        button.disabled = !available;
    });

    variantButtons.forEach(function(button){
        let available = true;

        if(button.dataset.value === "shiny"){
            if(spriteState.source === "normal"){
                available = spriteState.gender === "female" ? Boolean(data.sprites.front_shiny_female) : Boolean(data.sprites.front_shiny);
            }else if(
                spriteState.source === "official" || spriteState.source === "officialShiny"
            ){
                available = Boolean( data.sprites.other?.["official-artwork"]?.front_shiny);
            }else if(spriteState.source === "dream"){
                available = false;
            }
        }

        button.disabled = !available;
    });

    const currentGender = spriteGenderButtons.querySelector( `[data-value="${spriteState.gender}"]`);

    if(currentGender?.disabled){
        spriteState.gender = "male";
    }

    const currentVariant = spriteVariantButtons.querySelector( `[data-value="${spriteState.variant}"]`);

    if(currentVariant?.disabled){
        spriteState.variant = "default";
    }

    updateSpriteButtons("gender");
    updateSpriteButtons("variant");
    updateSpriteButtons("form");
    updateSpriteButtons("source");
}


// Selected sprite
function getSelectedSprite(){
    if(!currentPokemon){
        return null;
    }

    const data = currentSpritePokemon || currentPokemon;

    if(spriteState.source === "normal"){
        return getNormalSprite( data, spriteState.gender, spriteState.variant);
    }

    if(spriteState.source === "official"){
        return getOfficialArtwork( data, spriteState.variant);
    }

    if(spriteState.source === "officialShiny"){
        return getOfficialArtwork( data, "shiny");
    }

    if(spriteState.source === "dream"){
        return getDreamWorldSprite( data, spriteState.gender);
    }

    return null;
}

function getSpriteDescription(){
    const gender = spriteState.gender === "female" ? "Female" : "Male";

    const variant = spriteState.variant === "shiny" ? "Shiny" : "Default";

    let source = "Standard Sprite";

    if(spriteState.source === "official"){
        source = "Official Artwork";
    }else if(spriteState.source === "officialShiny"){
        source = "Official Shiny";
    }else if(spriteState.source === "dream"){
        source = "Dream World";
    }

    return ( gender + " - " + variant + " - " + source);
}

function updateSelectedSprite(){
    const imageUrl = getSelectedSprite();
    const data = currentSpritePokemon || currentPokemon;

    if(!imageUrl){
        selectedSpriteImage.removeAttribute("src");
        selectedSpriteImage.alt = "";

        selectedSpriteLabel.textContent =
            "This image variation is not available.";

        return;
    }

    const name = formatName(data.name);

    selectedSpriteImage.src = imageUrl;
    selectedSpriteImage.alt = name + " sprite";

    selectedSpriteLabel.textContent =
        name + " - " +
        getSpriteDescription();
}

async function selectSpriteForm(name){
    const token = ++spriteFormToken;
    selectedSpriteLabel.textContent = "Loading " + formatName(name) + " form…";

    try{
        const formData = await fetchPokemon(name);
        if(token !== spriteFormToken) return;
        currentSpritePokemon = formData;
        spriteState.form = name;
        updateSpriteAvailability();
        updateSelectedSprite();
    }catch(error){
        if(token === spriteFormToken){
            selectedSpriteLabel.textContent = "This form image could not be loaded.";
        }
    }
}

// Render sprite controls
function renderSprites(data,speciesData){
    spriteGenderButtons.innerHTML = "";
    spriteVariantButtons.innerHTML = "";
    spriteFormButtons.innerHTML = "";
    spriteSourceButtons.innerHTML = "";

    spriteFormToken++;
    currentSpritePokemon = data;
    spriteState = { gender: "male", variant: "default", form: data.name, source: "normal" };

    const forms = (speciesData?.varieties || []).map(function(variety){
        return variety.pokemon;
    }).filter(function(pokemon, index, all){
        return pokemon?.name && all.findIndex(function(candidate){ return candidate.name === pokemon.name; }) === index;
    });

    spriteFormGroup.hidden = forms.length < 2;
    if(forms.length > 1){
        const defaultVariety = speciesData.varieties.find(function(variety){ return variety.is_default; });
        if(defaultVariety?.pokemon?.name){
            spriteState.form = defaultVariety.pokemon.name;
        }
        forms.forEach(function(form){
            createSpriteButton(spriteFormButtons, formatName(form.name), form.name, "form");
        });
    }

    createSpriteButton( spriteGenderButtons, "Male", "male", "gender");

    if(hasFemaleSprites(data)){
        createSpriteButton( spriteGenderButtons, "Female", "female", "gender");
    }

    createSpriteButton( spriteVariantButtons, "Default", "default", "variant");

    createSpriteButton( spriteVariantButtons, "Shiny", "shiny", "variant");

    createSpriteButton( spriteSourceButtons, "Standard Sprite", "normal", "source");

    if( data.sprites.other?.["official-artwork"]?.front_default){
        createSpriteButton( spriteSourceButtons, "Official Artwork", "official", "source");
    }
    if( data.sprites.other?.["official-artwork"]?.front_shiny){
        createSpriteButton( spriteSourceButtons, "Official Shiny", "officialShiny", "source");
    }
    if( data.sprites.other?.dream_world?.front_default){
        createSpriteButton( spriteSourceButtons, "Dream World", "dream", "source");
    }

    updateSpriteAvailability();
    updateSpriteButtons("form");
    updateSelectedSprite();
}

// Fetch Pokemon
async function fetchPokemon(name){
    const response = await fetch(PokeAPI + "/" + name);

    if(!response.ok){
        throw new Error( "Pokemon not found. Check the spelling and try again.");
    }

    return await response.json();
}

// Fetch species
async function fetchSpecies(url){
    const response = await fetch(url);

    if(!response.ok){
        throw new Error( "Pokemon species information could not be loaded.");
    }
    return await response.json();
}
// Render Pokemon
function renderPokemon(pokemonData,speciesData){
    currentPokemon = pokemonData;
    currentSpecies = speciesData;

    renderPokemonHeader(pokemonData);
    renderBasicInfo(pokemonData,speciesData);
    renderMoves(pokemonData);
    renderStats(pokemonData);
    renderSprites(pokemonData,speciesData);

    showTab("basic");
}
// Search
async function searchPokemon(name){
    const query = normalizePokemonQuery(name);

    if(query === ""){
        activeSearchToken++;
        searchBtn.disabled = false;
        searchBtnLabel.textContent = "Search";
        showError( "Please enter a Pokemon name or number.");
        return;
    }

    const searchToken = ++activeSearchToken;
    searchBtn.disabled = true;
    searchBtnLabel.textContent = "Searching...";
    showLoading();

    try{
        const pokemonData = await fetchPokemon(query);
        let speciesData = null;

        try{
            speciesData = await fetchSpecies( pokemonData.species.url);
        }catch(error){
            speciesData = null;
        }

        if(searchToken !== activeSearchToken) return;
        renderPokemon( pokemonData, speciesData);
        hideStatus();

    }catch(error){
        if(searchToken !== activeSearchToken) return;
        pokemonCard.hidden = true;

        currentPokemon = null;
        currentSpecies = null;

        moveLoadToken++;

        showError(error.message);

    }finally{
        if(searchToken === activeSearchToken){
            searchBtn.disabled = false;
            searchBtnLabel.textContent = "Search";
        }
    }
}
// Form
searchForm.addEventListener("submit",function(event){
    event.preventDefault();

    searchPokemon( pokemonInput.value);
});

// Quick search
chipButtons.forEach(function(button){
    button.addEventListener("click",function(){
        const name = button.dataset.name;
        const searchId = button.dataset.searchId;

        pokemonInput.value = name;

        searchPokemon(searchId || name);
    });
});

pokemonCard.hidden = true;
showStatus( "Search for a Pokemon to see its information.", false);

// Start with a different Pokédex entry and set of type-colored picks on each visit.
populateRandomPicks();
searchPokemon(String(1 + Math.floor(Math.random() * pokemonCount)));
