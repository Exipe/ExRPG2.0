# ExRPG
A base for a browser based, online RPG.

### Technologies used
 * TypeScript
 * Node.js
 * MongoDB
 * WebGL
 * WebSocket
 * React
 * Docker

# Features
 * Map editor
   * Import/export (JSON format)
   * Place tiles and attributes
   * Resize, with an anchor point
 * Register / log in
 * Lighting system
   * Day / night cycle
   * Point lights
   * Shadows
 * Path finding
 * Inventory / equipment
 * Crafting and shops
 * Trading
 * NPC:s, with basic dialogues
 * PvP - / PvM combat
   * Ranged projectiles
   * Level up / attributes
   * Item drops
   * Heal
 * Interact with the world
   * Put down - / pick up items
   * Cut down trees
   * Mine rocks
 * Chat box
 * Command system

### In-game
![ingame-screenshot](https://github.com/user-attachments/assets/bfc9f5a2-5593-4ac5-8158-dc86bf72b395)


# Running

Start using docker: 

    docker compose up -d --build

### Services

Game: `http://localhost:52501/`

Editor: `http://localhost:52502/`

Mongo Express: `http://localhost:52503/`
