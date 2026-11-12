
export interface Feeder {
    id: string;
    deviceId: string;
    name: string;
    description: string | null;
    timezone: string;
    user: string;
    active: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export interface FeederConfig {
    id: string;
    type: "INTERVAL" | "DAILY_TIME";
    intervalMinutes: number | null;
    timeOfDay: string | null;
    weekdays: string[];
    dose: number;
    lastRunAt: string | null;
    active: boolean;
    feederId: string;
    createdAt: string;
    updatedAt: string | null;
}

export interface CreateFeederRequest {
    deviceId: string;
    name: string;
    description?: string | null;
    timezone?: string;
    user?: string;
}

export interface UpdateFeederRequest {
    name: string;
    description?: string | null;
}

export interface UpdateFeederTimezoneRequest {
    timezone: string;
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
