# Pokémon Explorer

A lightweight, client-side Pokédex built with **HTML, CSS, and vanilla JavaScript**.

The application uses [PokéAPI](https://pokeapi.co/) to fetch Pokémon data and presents it through a searchable, tab-based explorer.

The project is intentionally framework-free: there is no frontend framework, backend server, build system, or API key.

---

## Live Demo

**GitHub Pages:**  
<https://mdrasb.github.io/pokedex/>

---

## Features

### Pokémon Search

- Search for a Pokémon by name.
- Search using the National Pokédex ID.
- Input is trimmed and normalized before searching.
- Displays a loading state while data is being fetched.
- Displays an error state when the Pokémon cannot be found.
- Includes quick-search buttons for commonly used Pokémon.
- Loads Pikachu automatically when the application starts.

### Basic Information

The **Basic Info** tab displays:

- Pokémon name
- National Pokédex ID
- Pokémon types
- Height
- Weight
- Generation
- Base experience
- Shiny artwork

The main Pokémon header also displays the Pokémon's primary type, type badges, and artwork.

### Moves

The **Moves** tab displays the moves available to the selected Pokémon.

Each move can display:

- Move name
- Move type
- Damage category
- Power
- Accuracy
- PP
- Learn method
- Lowest applicable level
- Effect description

Moves are loaded progressively in batches of **10**.

The **Load More Moves** button loads the next 10 moves until all available moves have been displayed.

This prevents the application from requesting every move simultaneously for Pokémon with a large move list.

### Base Stats

The **Stats** tab displays the Pokémon's six base statistics:

- HP
- Attack
- Defense
- Special Attack
- Special Defense
- Speed

Each stat is represented using a progress bar with a maximum value of `255`.

The total of all six base stats is also calculated and displayed.

### Interactive Sprites

The **Sprites** tab allows different Pokémon image variations to be explored.

Available controls include:

#### Gender

- Male
- Female, when available

#### Variant

- Default
- Shiny

#### Image Source

- Standard Sprite
- Official Artwork
- Official Shiny Artwork
- Dream World

Unavailable combinations are automatically disabled.

For example, if a Pokémon does not have a female sprite, the female option will not be available.

Selecting a valid combination immediately updates the displayed sprite.

### Responsive Design

The application is designed to work on:

- Desktop
- Laptop
- Tablet
- Mobile devices

The layout adapts for smaller screens so that the search area, Pokémon card, tabs, information sections, moves, stats, and sprite controls remain usable.

---

## Technology Stack

| Technology | Purpose |
| --- | --- |
| HTML5 | Semantic page structure |
| CSS3 | Layout, styling and responsive design |
| JavaScript | Application logic, API requests and DOM manipulation |
| PokéAPI | Pokémon data and image references |

No frontend framework or external JavaScript library is required.

There is also no backend server or database.

---

## Project Structure

```text
pokedex/
├── index.html      # Main HTML structure
├── style.css       # Application styling
├── script.js       # Application logic and API integration
├── favicon.svg     # Browser favicon
└── README.md       # Project documentation
