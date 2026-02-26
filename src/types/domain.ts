export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type FavoriteItemType = 'parking' | 'station';

export type ParkingItem = {
  id: string;
  source: 'carpark' | 'metered';
  name: string;
  district: string;
  address: string;
  coordinates: Coordinates;
  totalSpaces?: number;
  vacancy?: number;
  lastUpdated?: string;
  rateSummary?: string;
  openingHours?: string;
  distanceKm?: number;
};

export type FillingStation = {
  id: string;
  brand: string;
  district: string;
  location: string;
  phone?: string;
  dedicatedSite?: boolean;
  coordinates: Coordinates;
  prices?: string[];
  distanceKm?: number;
};

export type TrafficIncident = {
  id: string;
  summary: string;
  timestamp?: string;
  source: 'RTHK' | 'TD';
  isAccident: boolean;
  isCongestion: boolean;
};

export type TunnelInfo = {
  id: string;
  name: string;
  nameZh?: string;
  currentPcToll?: number;
  vehicleClassCount: number;
  lastUpdated?: string;
  status: 'Normal' | 'Incident reported';
  relatedIncident?: string;
};

export type FavoriteRecord = {
  itemId: string;
  itemType: FavoriteItemType;
  name: string;
  latitude: number;
  longitude: number;
  payload?: string;
};
