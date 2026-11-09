
export interface Feeder {
  id: string;
  deviceId: string;
  name: string;
  description: string | null;
  timezone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateFeederRequest {
  deviceId: string;
  name: string;
  description?: string | null;
  timezone?: string | null;
}

export interface UpdateFeederRequest {
  name: string;
  description?: string | null;
}

export interface UpdateFeederTimezoneRequest {
  timezone: string;
}
