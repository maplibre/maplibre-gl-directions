export interface BearingsControlConfiguration {
  angleMin: number;
  angleMax: number;
  angleStep: number;
  degreesMin: number;
  degreesMax: number;
  degreesStep: number;
}

export const BearingsControlDefaultConfiguration: BearingsControlConfiguration = {
  angleMin: 0,
  angleMax: 359,
  angleStep: 1,
  degreesMin: 45,
  degreesMax: 90,
  degreesStep: 45,
};
