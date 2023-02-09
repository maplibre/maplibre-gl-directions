export interface BearingsControlConfiguration {
  angleMin: number;
  angleMax: number;
  angleStep: number;
  fixedDegrees: number;
  degreesMin: number;
  degreesMax: number;
  degreesStep: number;
}

export const BearingsControlDefaultConfiguration: BearingsControlConfiguration = {
  angleMin: 0,
  angleMax: 359,
  angleStep: 1,
  fixedDegrees: 0,
  degreesMin: 15,
  degreesMax: 360,
  degreesStep: 15,
};
