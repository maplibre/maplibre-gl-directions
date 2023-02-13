export interface BearingsControlConfiguration {
  defaultEnabled: boolean;
  angleMin: number;
  angleMax: number;
  angleStep: number;
  fixedDegrees: number;
  degreesMin: number;
  degreesMax: number;
  degreesStep: number;
  respectMapBearing: boolean;
  imageSize: number;
}

export const BearingsControlDefaultConfiguration: BearingsControlConfiguration = {
  defaultEnabled: false,
  angleMin: 0,
  angleMax: 359,
  angleStep: 1,
  fixedDegrees: 0,
  degreesMin: 15,
  degreesMax: 360,
  degreesStep: 15,
  respectMapBearing: false,
  imageSize: 50,
};
