export interface ServerPresetFilters {
    id?: number;
    name?: string;
    cpu?: number;
}

export interface ServerPresetValues {
    name: string;
    description: string;

    cpu: number;
    memory: number;
    disk: number;

    nest_id?: number | null;
    egg_id?: number | null;
}
