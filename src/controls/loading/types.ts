export interface LoadingControlConfiguration {
  /**
   * Fill-color for the loader. Any valid CSS-value.
   *
   * @default "#6d26d7"
   */
  fill: string;

  /**
   * The size of the loader. Any valid CSS-value.
   *
   * @default "24px"
   */
  size: string;

  /**
   * Class-string passed as-is to the `class=""` attribute of the loader SVG.
   *
   * @default ""
   */
  class: string;
}

export const LoadingControlDefaultConfiguration: LoadingControlConfiguration = {
  fill: "#6d26d7",
  size: "24px",
  class: "",
};
