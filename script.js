// API
const PokeAPI = "https://pokeapi.co/api/v2/pokemon";
const pokemonCount = 1026;
const pokemonNameIds = { mimikyu: 778, lycanroc: 745 };

// DOM Elements
const searchForm = document.getElementById("searchForm");
const pokemonInput = document.getElementById("pokemonInput");
const searchBtn = document.getElementById("searchBtn");
const searchBtnLabel = document.getElementById("searchBtnLabel");
const chipButtons = document.querySelectorAll(".chip-btn");
const ambientPokemon = document.querySelector(".ambient-pokemon");
const ambientSpriteCount = 40;
const ambientGenerationCache = new Map();
const typeSceneColors = {
    normal: "#b3aa91", fire: "#ee7443", water: "#438bd4", electric: "#d4ae27",
    grass: "#5eae56", ice: "#58b9c7", fighting: "#d65d4d", poison: "#a65fc7",
    ground: "#bd8440", flying: "#748fdf", psychic: "#df628c", bug: "#899b28",
    rock: "#a8894e", ghost: "#665097", dragon: "#5440c4", dark: "#514554",
    steel: "#66829a", fairy: "#dc75a7", stellar: "#47a99d", shadow: "#534778"
};
const speciesSceneColors = {
    black: "#343647", blue: "#438bd4", brown: "#ad7650", gray: "#8792a4",
    green: "#52a874", pink: "#dc8cae", purple: "#976ec3", red: "#cf5b4f",
    white: "#dce6ee", yellow: "#e7c54b"
};

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
const cardRegion = document.getElementById("cardRegion");
const basicTypes = document.getElementById("basicTypes");
const basicShinyImage = document.getElementById("basicShinyImage");
const evolutionSection = document.getElementById("evolutionSection");
const evolutionTree = document.getElementById("evolutionTree");

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
let evolutionToken = 0;
let ambientGenerationToken = 0;
let ambientSelectedIds = [];

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

function randomDexIds(count, excludedIds = []){
    const excluded = new Set(excludedIds.map(Number));
    const picks = [];
    const range = 0x100000000;
    const cutoff = range - (range % pokemonCount);

    while(picks.length < count){
        let offset;
        if(globalThis.crypto?.getRandomValues){
            const randomValue = new Uint32Array(1);
            do{
                globalThis.crypto.getRandomValues(randomValue);
            }while(randomValue[0] >= cutoff);
            offset = randomValue[0] % pokemonCount;
        }else{
            offset = Math.floor(Math.random() * pokemonCount);
        }
        const id = offset + 1;
        if(!excluded.has(id)){
            excluded.add(id);
            picks.push(id);
        }
    }

    return picks;
}

function initializeAmbientPokemon(){
    for(let index = 0; index < ambientSpriteCount; index++){
        const image = document.createElement("img");
        image.alt = "";
        image.decoding = "async";
        image.fetchPriority = "low";
        ambientPokemon.appendChild(image);
    }

    layoutAmbientPokemon();
}

function layoutAmbientPokemon(){
    const images = Array.from(ambientPokemon.querySelectorAll("img"));
    const halfWidth = ambientPokemon.clientWidth / 2;
    const areaHeight = ambientPokemon.clientHeight;
    const visibleCount = window.matchMedia("(max-width: 560px)").matches ? 2
        : window.matchMedia("(max-width: 1000px)").matches ? 32
        : images.length;
    const visiblePerSide = Math.ceil(visibleCount / 2);
    const placed = [[], []];

    images.forEach(function(image, index){
        const side = index % 2;
        const width = image.getBoundingClientRect().width || 160;
        const height = Math.min(image.getBoundingClientRect().height || 150, 170);
        const minX = side === 0 ? 0 : halfWidth;
        const maxX = Math.max(minX, (side === 0 ? halfWidth : ambientPokemon.clientWidth) - width);
        const maxY = Math.max(0, areaHeight - height);
        const sideIndex = Math.floor(index / 2);
        let point;

        if(index >= visibleCount){
            image.hidden = true;
            return;
        }

        image.hidden = false;
        // Anchor one sprite at each outer edge, then scatter the rest across
        // the whole side with a minimum distance to keep their artwork legible.
        if(sideIndex === 0){
            point = { x: side === 0 ? 0 : maxX, y: Math.random() * maxY };
        }else{
            const minDistance = Math.max(92, width * .62);
            for(let attempt = 0; attempt < 500; attempt++){
                const candidate = {
                    x: minX + Math.random() * Math.max(0, maxX - minX),
                    y: Math.random() * maxY
                };
                if(placed[side].every(function(other){
                    return Math.hypot(candidate.x - other.x, candidate.y - other.y) >= minDistance;
                })){
                    point = candidate;
                    break;
                }
            }
            if(!point) point = { x: minX + Math.random() * Math.max(0, maxX - minX), y: Math.random() * maxY };
        }

        placed[side].push(point);
        image.dataset.row = "scatter";
        image.style.top = point.y + "px";
        image.style.zIndex = String(1 + Math.floor(Math.random() * 6));
        image.style.right = "auto";
        image.style.left = point.x + "px";
        if(!image.dataset.scale){
            const scale = .9 + Math.random() * .14;
            const tilt = -3 + Math.random() * 6;
            image.dataset.scale = scale.toFixed(2);
            image.style.transform = "rotate(" + tilt.toFixed(1) + "deg) scale(" + image.dataset.scale + ")";
        }
    });
}

function shuffleItems(items){
    const shuffled = items.slice();
    for(let index = shuffled.length - 1; index > 0; index--){
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
}

async function updateAmbientPokemon(generationName){
    const token = ++ambientGenerationToken;
    if(!generationName || ambientPokemon.dataset.generation === generationName) return;

    try{
        let speciesIds = ambientGenerationCache.get(generationName);
        if(!speciesIds){
            const response = await fetch("https://pokeapi.co/api/v2/generation/" + encodeURIComponent(generationName));
            if(!response.ok) throw new Error("Generation sprites unavailable");
            const generationData = await response.json();
            const ids = generationData.pokemon_species
                .map(function(species){
                    const match = species.url.match(/\/pokemon-species\/(\d+)\/?$/);
                    return match ? Number(match[1]) : null;
                })
                .filter(function(id){ return Number.isInteger(id); });
            speciesIds = Array.from(new Set(ids));
            ambientGenerationCache.set(generationName, speciesIds);
        }

        if(token !== ambientGenerationToken || speciesIds.length === 0) return;
        ambientSelectedIds = shuffleItems(speciesIds).slice(0, ambientSpriteCount);
        renderAmbientPokemonSprites();
        ambientPokemon.dataset.generation = generationName;
    }catch(error){
        // Keep the current collage if the generation endpoint is temporarily unavailable.
    }
}

function renderAmbientPokemonSprites(){
    if(ambientSelectedIds.length === 0) return;
    const images = ambientPokemon.querySelectorAll("img");
    const visibleCount = window.matchMedia("(max-width: 560px)").matches
        ? 2
        : window.matchMedia("(max-width: 1000px)").matches ? 32
        : ambientSpriteCount;

    images.forEach(function(image, index){
        if(index >= visibleCount || index >= ambientSelectedIds.length){
            image.removeAttribute("src");
            image.hidden = true;
            return;
        }
        image.hidden = false;
        const pokemonId = ambientSelectedIds[index % ambientSelectedIds.length];
        image.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + pokemonId + ".png";
    });
}

let ambientResizeTimer;
window.addEventListener("resize", function(){
    clearTimeout(ambientResizeTimer);
    ambientResizeTimer = setTimeout(function(){
        layoutAmbientPokemon();
        renderAmbientPokemonSprites();
    }, 120);
});

async function populateRandomPicks(excludedIds = []){
    const picks = randomDexIds(chipButtons.length, excludedIds);

    await Promise.all(Array.from(chipButtons).map(async function(button, index){
        const id = picks[index];
        const arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "↗";
        button.dataset.name = "";
        button.dataset.searchId = String(id);
        button.dataset.type = "unknown";
        button.title = "Random Pokédex entry #" + id;
        button.replaceChildren(document.createTextNode("Pokémon #" + id + " "), arrow);

        try{
            const data = await fetchPokemon(String(id));
            const name = data.species?.name || data.name;
            button.dataset.name = name;
            button.dataset.type = data.types?.[0]?.type?.name || "unknown";
            button.title = "Search " + formatName(name) + " (Pokédex #" + id + ")";
            button.replaceChildren(document.createTextNode(formatName(name) + " "), arrow);
        }catch(error){
            button.dataset.name = "Pokémon #" + id;
        }
    }));
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
    cardName.textContent = formatName(data.species?.name || data.name);

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
function updatePagePalette(data,speciesData){
    const primaryType = data.types?.[0]?.type?.name;
    const speciesColor = speciesData?.color?.name;
    const rootStyle = document.documentElement.style;

    rootStyle.setProperty("--scene-type", typeSceneColors[primaryType] || "#6257e8");
    rootStyle.setProperty("--scene-body", speciesSceneColors[speciesColor] || "#b9b7cf");
}
// Basic information
function renderBasicInfo(data,speciesData){
    cardHeight.textContent = (data.height / 10).toFixed(1) + " m";
    cardWeight.textContent = (data.weight / 10).toFixed(1) + " kg";
    cardBaseExperience.textContent = data.base_experience !== null ? data.base_experience : "N/A";

    const generationName = speciesData?.generation?.name;
    const generationRoman = generationName?.split("-").pop().toUpperCase();
    const generationRegions = {
        "generation-i": "Kanto",
        "generation-ii": "Johto",
        "generation-iii": "Hoenn",
        "generation-iv": "Sinnoh",
        "generation-v": "Unova",
        "generation-vi": "Kalos",
        "generation-vii": "Alola",
        "generation-viii": "Galar",
        "generation-ix": "Paldea"
    };
    cardGeneration.textContent = generationRoman ? "Generation " + generationRoman : "Unknown";
    cardRegion.textContent = generationRegions[generationName] || "Unknown";

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
    const sourceButtons =
        spriteSourceButtons.querySelectorAll(".sprite-btn");

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

    sourceButtons.forEach(function(button){
        let available = true;
        if(button.dataset.value === "normal"){
            available = Boolean(getNormalSprite(data, spriteState.gender, spriteState.variant));
        }else if(button.dataset.value === "official"){
            available = Boolean(getOfficialArtwork(data, spriteState.variant));
        }else if(button.dataset.value === "officialShiny"){
            available = Boolean(getOfficialArtwork(data, "shiny"));
        }else if(button.dataset.value === "dream"){
            available = Boolean(getDreamWorldSprite(data, spriteState.gender)) && spriteState.variant !== "shiny";
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

    const currentSource = spriteSourceButtons.querySelector(`[data-value="${spriteState.source}"]`);
    if(currentSource?.disabled){
        spriteState.source = "normal";
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

    createSpriteButton(spriteSourceButtons, "Official Artwork", "official", "source");
    createSpriteButton(spriteSourceButtons, "Official Shiny", "officialShiny", "source");
    createSpriteButton(spriteSourceButtons, "Dream World", "dream", "source");

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

    updatePagePalette(pokemonData,speciesData);
    renderPokemonHeader(pokemonData);
    renderBasicInfo(pokemonData,speciesData);
    renderEvolutionTree(speciesData);
    renderMoves(pokemonData);
    renderStats(pokemonData);
    renderSprites(pokemonData,speciesData);

    showTab("basic");
}

function collectEvolutionStages(node, depth, stages){
    if(!stages[depth]) stages[depth] = [];
    stages[depth].push(node.species);
    (node.evolves_to || []).forEach(function(next){
        collectEvolutionStages(next, depth + 1, stages);
    });
}

async function renderEvolutionTree(speciesData){
    const token = ++evolutionToken;
    evolutionSection.hidden = true;
    evolutionTree.replaceChildren();

    const chainUrl = speciesData?.evolution_chain?.url;
    if(!chainUrl) return;

    try{
        const response = await fetch(chainUrl);
        if(!response.ok) throw new Error("Evolution data unavailable");
        const chainData = await response.json();
        const stages = [];
        collectEvolutionStages(chainData.chain, 0, stages);
        if(stages.flat().length < 2) return;

        const pokemonStages = await Promise.all(stages.map(async function(stage){
            return await Promise.all(stage.map(async function(species){
                const match = species.url.match(/\/(\d+)\/?$/);
                if(!match) return null;
                try{
                    const pokemon = await fetchPokemon(match[1]);
                    return {species, pokemon};
                }catch(error){
                    return null;
                }
            }));
        }));

        if(token !== evolutionToken) return;
        const visibleStages = pokemonStages.map(function(stage){
            return stage.filter(Boolean);
        }).filter(function(stage){ return stage.length > 0; });
        if(visibleStages.flat().length < 2) return;

        visibleStages.forEach(function(stage, index){
            const stageElement = document.createElement("div");
            stageElement.className = "evolution-stage" + (stage.length > 1 ? " branch-stage" : "");

            stage.forEach(function(entry){
                const button = document.createElement("button");
                const image = document.createElement("img");
                const name = document.createElement("strong");
                const number = document.createElement("span");
                const art = entry.pokemon.sprites.other?.["official-artwork"]?.front_default || entry.pokemon.sprites.front_default;

                button.type = "button";
                button.className = "evolution-card";
                button.dataset.searchId = String(entry.pokemon.id);
                button.title = "View " + formatName(entry.species.name);
                if(entry.pokemon.id === currentPokemon?.id){
                    button.classList.add("current-evolution");
                    button.setAttribute("aria-current", "true");
                }

                if(art){
                    image.src = art;
                    image.alt = "";
                    image.loading = "lazy";
                    button.appendChild(image);
                }
                name.textContent = formatName(entry.species.name);
                number.textContent = "#" + String(entry.pokemon.id).padStart(3, "0");
                button.append(name, number);
                button.addEventListener("click", function(){
                    pokemonInput.value = formatName(entry.species.name);
                    searchPokemon(String(entry.pokemon.id), true);
                });
                stageElement.appendChild(button);
            });

            evolutionTree.appendChild(stageElement);
            if(index < visibleStages.length - 1){
                const connector = document.createElement("span");
                connector.className = "evolution-connector";
                connector.setAttribute("aria-hidden", "true");
                connector.textContent = "→";
                evolutionTree.appendChild(connector);
            }
        });
        evolutionSection.hidden = false;
    }catch(error){
        if(token === evolutionToken){
            evolutionSection.hidden = true;
        }
    }
}

// Search
async function searchPokemon(name, updateSearchField = false){
    const query = normalizePokemonQuery(name);

    if(query === ""){
        activeSearchToken++;
        searchBtn.disabled = false;
        searchBtnLabel.textContent = "Search";
        showError( "Please enter a Pokemon name or number.");
        return;
    }

    const searchToken = ++activeSearchToken;
    evolutionToken++;
    const lookup = String(pokemonNameIds[query] || query);
    searchBtn.disabled = true;
    searchBtnLabel.textContent = "Searching...";
    showLoading();

    try{
        const pokemonData = await fetchPokemon(lookup);
        if(searchToken !== activeSearchToken) return;

        let speciesData = null;

        try{
            speciesData = await fetchSpecies( pokemonData.species.url);
        }catch(error){
            speciesData = null;
        }

        if(searchToken !== activeSearchToken) return;
        updateAmbientPokemon(speciesData?.generation?.name);
        if(updateSearchField){
            pokemonInput.value = formatName(pokemonData.species?.name || pokemonData.name);
        }
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

        searchPokemon(searchId || name, true);
    });
});

pokemonCard.hidden = true;
showStatus( "Search for a Pokemon to see its information.", false);
initializeAmbientPokemon();

// Pick one random entry for the page and keep it out of the five random quick picks.
const initialPokemonId = randomDexIds(1)[0];
populateRandomPicks([initialPokemonId]);
searchPokemon(String(initialPokemonId), true);
