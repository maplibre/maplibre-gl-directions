export interface BearingsControlConfiguration {
  /**
   * Whether the bearings support is enabled by default for new waypoints.
   *
   * @default `false`
   */
  defaultEnabled: boolean;

  /**
   * Debounce requests by the specified amount of milliseconds.
   *
   * @default `150`
   */
  debounceTimeout: number;

  /**
   * The default angle for a waypoint when it's added.
   *
   * @default `0`
   */
  angleDefault: number;

  /**
   * Minimal allowed angle for a waypoint (affects the control's respective numeric input behavior).
   *
   * @default `0`
   */
  angleMin: number;

  /**
   * Maximal allowed angle for a waypoint (affects the control's respective numeric input behavior).
   *
   * @default `359`
   */
  angleMax: number;

  /**
   * How many degrees to add/remove to/from the bearing's angle value when the control's respective numeric input's
   * up/down button is clicked.
   *
   * @default `1`
   */
  angleStep: number;

  /**
   * Whether to allow changing the bearings' degrees. When 0 - allow to change degrees, when any other value - use that
   * value instead.
   *
   * @default `0`
   */
  fixedDegrees: number;

  /**
   * The default degree for a waypoint when it's added.
   *
   * @default `45`
   */
  degreesDefault: number;

  /**
   * Minimal allowed degree for a waypoint (affects the control's respective numeric input behavior).
   *
   * @default `15`
   */
  degreesMin: number;

  /**
   * Maximal allowed degree for a waypoint (affects the control's respective numeric input behavior).
   *
   * @default `360`
   */
  degreesMax: number;

  /**
   * How many degrees to add/remove to/from the bearing's degrees value when the control's respective numeric input's
   * up/down button is clicked.
   *
   * @default `15`
   */
  degreesStep: number;

  /**
   * Whether the waypoint-images in the control should be rotated according to the map's current bearing.
   *
   * @default `false`
   */
  respectMapBearing: boolean;

  /**
   * The size of the waypoint-images in the control (in pixels).
   *
   * @default `50`
   */
  imageSize: number;
}

export const BearingsControlDefaultConfiguration: BearingsControlConfiguration = {
  defaultEnabled: false,
  debounceTimeout: 150,
  angleDefault: 0,
  angleMin: 0,
  angleMax: 359,
  angleStep: 1,
  fixedDegrees: 0,
  degreesDefault: 45,
  degreesMin: 15,
  degreesMax: 360,
  degreesStep: 15,
  respectMapBearing: false,
  imageSize: 50,
};
