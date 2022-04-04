# Basic Usage

__❗ Please note that all the exposed API is a subject to change until the plugin reaches its stable state! ❗__

Start by importing the plugin. Then create an instance of the imported {@link default|`MaplibreGlDirections`} class passing to the constructor a map instance and optionally a {@link MaplibreGlDirectionsOptions|configuration object}.

```typescript
import MaplibreGlDirections from "@maplibre/maplibre-gl-directions";

const directions = new MaplibreGlDirections(map, {
  // optional configuration
})
```

If needed, enable the interactivity.

```typescript
directions.interactive = true;
```

Use the plugin's public interface to set, add and remove waypoints.

```typescript
// Set the waypoints programmatically
directions.setWaypoints([[-73.8271025, 40.8032906], [-73.8671258, 40.82234996]])

// Remove the first waypoint
directions.removeWaypoint(0);

// Add a waypoint at index 0
directions.addWaypoint([-73.8671258, 40.82234996], 0);
```

Call the {@link clear|`clear`} method to remove all the plugin's traces from the map.

```typescript
directions.clear();
```

If you need to completely disable the plugin, make sure to call the {@link destroy|`destroy`} method first.

```typescript
directions.destroy();
directions = undefined;
```