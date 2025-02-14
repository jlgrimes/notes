export interface LocationReference {
  name: string;
  address?: string;
  placeId?: string; // Google Places ID for accurate location linking
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AnswerWithLocations {
  answer: string;
  locations: LocationReference[];
}
