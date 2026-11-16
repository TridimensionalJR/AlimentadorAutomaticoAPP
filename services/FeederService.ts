
import { API } from "./api";
import type {
    Feeder,
    CreateFeederRequest,
    UpdateFeederRequest,
    UpdateFeederTimezoneRequest,
    DeviceConfig,
} from "@/types/feeder";

class FeederService extends API {
    findAll() {
        return this.get<Feeder[]>("/feeders");
    }

    findById(id: string) {
        return this.get<Feeder>(`/feeders/${id}`);
    }

    create(data: CreateFeederRequest) {
        return this.post<Feeder>("/feeders", data);
    }

    findDeviceConfig(deviceId: string) {
        return this.get<DeviceConfig>(`/devices/${deviceId}/config`);
    }

    update(id: string, data: UpdateFeederRequest) {
        return this.put<Feeder>(`/feeders/${id}`, data);
    }

    updateTimezone(id: string, data: UpdateFeederTimezoneRequest) {
        return this.put<Feeder>(`/feeders/${id}/timezone`, data);
    }

    activate(id: string) {
        return this.post<Feeder>(`/feeders/${id}/activate`, {});
    }

    deactivate(id: string) {
        return this.post<Feeder>(`/feeders/${id}/deactivate`, {});
    }

    remove(id: string): Promise<void> {
        return super.delete<void>(`/feeders/${id}`);
    }
}

export const feederService = new FeederService();
