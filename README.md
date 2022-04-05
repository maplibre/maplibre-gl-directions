# Maplibre Gl Directions plugin

__❗ Please, note that the plugin is still work in progress. Don't use it in production util it reaches its stable state! ❗__

A routing-plugin for the [maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) powered maps. Supports any [OSRM](http://project-osrm.org/) or [Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/) compatible Routing-provider.

![1st Demo Screenshot](demo/src/assets/screenshots/1.png)
![2nd Demo Screenshot](demo/src/assets/screenshots/2.png)
![3rd Demo Screenshot](demo/src/assets/screenshots/3.png)


## Features

### Different Routing-providers

The plugin Supports any OSRM- or Mapbox Directions API-compatible Routing-provider out of the box!

### User interaction

Add and remove waypoints by clicking them, add waypoints in-between existing ones by simply dragging the selected route line, change the selected route by clicking an alternative route line. Everything is touch-friendly!

You can also completely disable the user interaction anytime you want.

### Congestions

Support for Mapbox Directions API congestions (both plain and numeric!)

### Customization

The powerful customization interface allows to customize everything starting from visual aspects all the way up to request logic.


### TypeScript support

The plugin is written 100% in TypeScript and therefore ships with built-in types support.


## Installation

__❗ The plugin is awaiting to become included under the @maplibre scope. Until that there's no option to install it as an NPM package ❗__

```shell
$ npm i @maplibre/maplibre-gl-directions
```

## Usage

```typescript
// Import the plugin
import MaplibreGlDirections from "@maplibre/maplibre-gl-directions";

// Create an instance
const directions = new MaplibreGlDirections(map, {
  // optional settings
});

// Enable interactivity (if needed)
directions.interactive = true;

// Set the waypoints programmatically
directions.setWaypoints([[-73.8271025, 40.8032906], [-73.8671258, 40.82234996]])

// Remove waypoints
directions.removeWaypoint(0);

// Add waypoints
directions.addWaypoint([-73.8671258, 40.82234996], 0);

// Remove everything plugin-related from the map
directions.clear();
```

Refer to the API docs (_here goes a link to deployed API docs_) for more!

## Future plans

* Emit events
* Implement default control
* Write tests