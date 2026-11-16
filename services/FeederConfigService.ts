
import { API } from "./api";
import type {
    FeederConfig,
    CreateFeederConfigRequest,
    UpdateFeederConfigRequest,
} from "@/types/feeder";

class FeederConfigService extends API {
    findAll(feederId: string) {
        return this.get<FeederConfig[]>(
            `/feeders/${feederId}/configs`
        );
    }

    findById(feederId: string, id: string) {
        return this.get<FeederConfig>(
            `/feeders/${feederId}/configs/${id}`
        );
    }

    create(feederId: string, data: CreateFeederConfigRequest) {
        return this.post<FeederConfig>(
            `/feeders/${feederId}/configs`,
            data
        );
    }

    update(
        feederId: string,
        id: string,
        data: UpdateFeederConfigRequest
    ) {
        return this.put<FeederConfig>(
            `/feeders/${feederId}/configs/${id}`,
            data
        );
    }

    activate(feederId: string, id: string) {
        return this.post<FeederConfig>(
            `/feeders/${feederId}/configs/${id}/activate`,
            {}
        );
    }

    deactivate(feederId: string, id: string) {
        return this.post<FeederConfig>(
            `/feeders/${feederId}/configs/${id}/deactivate`,
            {}
        );
    }

    remove(feederId: string, id: string): Promise<void> {
        return super.delete<void>(
            `/feeders/${feederId}/configs/${id}`
        );
    }
}

export const feederConfigService = new FeederConfigService();
