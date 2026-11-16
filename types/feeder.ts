
export interface Feeder {
    id: string;
    deviceId: string;
    name: string;
    description: string | null;
    timezone: string;
    userId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface FeederConfig {
    id: string;
    type: FeederConfigType;
    intervalMinutes: number | null;
    timeOfDay: string | null;
    weekdays: Weekday[];
    dose: number;
    lastRunAt: string | null;
    isActive: boolean;
    feederId: string;
    createdAt: string;
    updatedAt: string | null;
}

export type FeederConfigType = "INTERVAL" | "DAILY_TIME";

export type Weekday =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

export interface CreateFeederRequest {
    deviceId: string;
    name: string;
    description?: string | null;
}

export interface UpdateFeederRequest {
    name: string;
    description?: string | null;
}

export interface UpdateFeederTimezoneRequest {
    timezone: string;
}

export interface CreateFeederConfigRequest {
    type: FeederConfigType;
    intervalMinutes?: number | null;
    timeOfDay?: string | null;
    weekdays?: Weekday[];
    dose: number;
}

export interface UpdateFeederConfigRequest {
    type: FeederConfigType;
    intervalMinutes?: number | null;
    timeOfDay?: string | null;
    weekdays?: Weekday[];
    dose: number;
}


export interface DeviceConfig {
    deviceId: string;
    feederId: string;
    name: string;
    timezone: string;
    isActive: boolean;
    configs: DeviceFeederConfig[];
    serverTime: string;
}

export interface DeviceFeederConfig {
    id: string;
    type: FeederConfigType;
    intervalMinutes: number | null;
    timeOfDay: string | null;
    weekdays: Weekday[];
    dose: number;
    lastRunAt: string | null;
}

export type FeederStatusRequest = Record<string, never>;
