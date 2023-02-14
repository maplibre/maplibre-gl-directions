### `LoadingIndicatorControl`

The {@link LoadingIndicatorControl} adds a spinning wheel that appears whenever there's an ongoing routing requests and automatically disappears as soon as the request is finished.

The loading indicator's appearance is configurable via the {@link LoadingIndicatorControlConfiguration} object that is (optionally) passed as the second argument to the constructor.

See the respective {@link https://maplibre.org/maplibre-gl-directions/#/examples/loading-indicator-control|Demo}.

### `BearingsControl`

The {@link BearingsControl} is a built-in control for manipulating waypoints' bearings values when the respective `bearings` option is set to `true` for a given Directions instance.

The loading indicator's appearance and behavior are configurable via the {@link BearingsControlConfiguration} object that is (optionally) passed as the second argument to the constructor.

See the respective {@link https://maplibre.org/maplibre-gl-directions/#/examples/bearings-support-and-control|Demo}.

Here's the list of CSS classes available for the end user to style the component according to one's needs:

- `maplibre-gl-directions-bearings-control`
- `maplibre-gl-directions-bearings-control__list`
- `maplibre-gl-directions-bearings-control__list-item`
  - `maplibre-gl-directions-bearings-control__list-item--enabled`
  - `maplibre-gl-directions-bearings-control__list-item--disabled`
- `maplibre-gl-directions-bearings-control__number`
- `maplibre-gl-directions-bearings-control__checkbox`
- `maplibre-gl-directions-bearings-control__waypoint-image`
- `maplibre-gl-directions-bearings-control__input`
- `maplibre-gl-directions-bearings-control__text`

### `DirectionsControl`

WIP (1.x milestone).
