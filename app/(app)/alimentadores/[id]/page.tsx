"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Pencil,
    Trash2,
    Save,
    X,
    Power,
    Clock,
    CalendarDays,
    RefreshCw,
} from "lucide-react";
import { z } from "zod";

import Form from "@/components/Form/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { feederService } from "@/services/FeederService";
import { feederConfigService } from "@/services/FeederConfigService";

import type {
    Feeder,
    FeederConfig,
    UpdateFeederRequest,
    CreateFeederConfigRequest,
    UpdateFeederConfigRequest,
    FeederConfigType,
    Weekday,
} from "@/types/feeder";

const WEEKDAYS: { value: Weekday; label: string }[] = [
    { value: "MONDAY", label: "Seg" },
    { value: "TUESDAY", label: "Ter" },
    { value: "WEDNESDAY", label: "Qua" },
    { value: "THURSDAY", label: "Qui" },
    { value: "FRIDAY", label: "Sex" },
    { value: "SATURDAY", label: "Sáb" },
    { value: "SUNDAY", label: "Dom" },
];

type ConfigForm = {
    type: FeederConfigType;
    intervalMinutes: number;
    timeOfDay: string;
    weekdays: Weekday[];
    dose: number;
};

const initialConfig: ConfigForm = {
    type: "INTERVAL",
    intervalMinutes: 60,
    timeOfDay: "08:00",
    weekdays: WEEKDAYS.map(day => day.value),
    dose: 1,
};

export default function ViewEditFeeder() {
    const params = useParams<{ id: string }>();
    const router = useRouter();

    const feederId = params.id;

    const [feeder, setFeeder] = useState<Feeder | null>(null);
    const [config, setConfig] = useState<FeederConfig | null>(null);

    const [editing, setEditing] = useState(false);
    const [editingConfig, setEditingConfig] = useState(false);

    const [values, setValues] = useState({
        name: "",
        description: "",
    });

    const [configForm, setConfigForm] = useState<ConfigForm>(initialConfig);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadData = useCallback(async () => {
        if (!feederId) return;

        setLoading(true);
        setError("");

        try {
            const [feederData, configData] = await Promise.all([
                feederService.findById(feederId),
                feederConfigService.findAll(feederId),
            ]);

            const currentConfig = configData[0] ?? null;

            setFeeder(feederData);
            setConfig(currentConfig);

            setValues({
                name: feederData.name,
                description: feederData.description || "",
            });

            setConfigForm(
                currentConfig
                    ? {
                        type: currentConfig.type,
                        intervalMinutes: currentConfig.intervalMinutes ?? 60,
                        timeOfDay: currentConfig.timeOfDay ?? "08:00",
                        weekdays: currentConfig.weekdays ?? [],
                        dose: currentConfig.dose,
                    }
                    : { ...initialConfig }
            );

            setEditingConfig(!currentConfig);
        } catch {
            setError("Não foi possível carregar o alimentador.");
        } finally {
            setLoading(false);
        }
    }, [feederId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const feederFields = [
        {
            name: "name",
            label: "Nome do alimentador",
            placeholder: "Ex.: Alimentador da sala",
            required: true,
            validation: z.string().trim().min(1, "Informe o nome do alimentador."),
        },
        {
            name: "description",
            label: "Descrição",
            type: "textarea" as const,
            placeholder: "Informações adicionais (opcional)",
        },
    ];

    const updateValue = (name: string, value: unknown) => {
        setValues(current => ({
            ...current,
            [name]: value,
        }));
    };

    const updateFeeder = async () => {
        if (!feeder) return;

        if (!values.name.trim()) {
            setError("Informe o nome do alimentador.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const payload: UpdateFeederRequest = {
                name: values.name.trim(),
                description: values.description.trim() || null,
            };

            const updated = await feederService.update(feederId, payload);

            setFeeder(updated);
            setEditing(false);
        } catch {
            setError("Não foi possível atualizar o alimentador.");
        } finally {
            setSaving(false);
        }
    };

    const cancelFeederEdit = () => {
        if (!feeder) return;

        setValues({
            name: feeder.name,
            description: feeder.description || "",
        });

        setEditing(false);
    };

    const deleteFeeder = async () => {
        if (!feeder) return;

        if (!window.confirm(`Deseja excluir o alimentador "${feeder.name}"?`)) {
            return;
        }

        setSaving(true);
        setError("");

        try {
            await feederService.remove(feederId);
            router.push("/alimentadores");
        } catch {
            setError("Não foi possível excluir o alimentador.");
        } finally {
            setSaving(false);
        }
    };

    const toggleFeeder = async () => {
        if (!feeder) return;

        setSaving(true);
        setError("");

        try {
            const updated = feeder.active
                ? await feederService.deactivate(feederId)
                : await feederService.activate(feederId);

            setFeeder(updated);
        } catch {
            setError("Não foi possível alterar o status do alimentador.");
        } finally {
            setSaving(false);
        }
    };

    const openConfigEdit = () => {
        setError("");

        setConfigForm(
            config
                ? {
                    type: config.type,
                    intervalMinutes: config.intervalMinutes ?? 60,
                    timeOfDay: config.timeOfDay ?? "08:00",
                    weekdays: config.weekdays ?? [],
                    dose: config.dose,
                }
                : { ...initialConfig }
        );

        setEditingConfig(true);
    };

    const cancelConfigEdit = () => {
        if (!config) return;

        setConfigForm({
            type: config.type,
            intervalMinutes: config.intervalMinutes ?? 60,
            timeOfDay: config.timeOfDay ?? "08:00",
            weekdays: config.weekdays ?? [],
            dose: config.dose,
        });

        setEditingConfig(false);
        setError("");
    };

    const saveConfig = async () => {
        if (
            configForm.type === "INTERVAL" &&
            (
                !configForm.intervalMinutes ||
                configForm.intervalMinutes < 1 ||
                configForm.intervalMinutes > 10080
            )
        ) {
            setError("Informe um intervalo entre 1 e 10080 minutos.");
            return;
        }

        if (configForm.type === "DAILY_TIME" && !configForm.timeOfDay) {
            setError("Informe o horário da alimentação.");
            return;
        }

        if (
            configForm.type === "DAILY_TIME" &&
            configForm.weekdays.length === 0
        ) {
            setError("Selecione pelo menos um dia da semana.");
            return;
        }

        if (
            !configForm.dose ||
            configForm.dose < 1 ||
            configForm.dose > 100
        ) {
            setError("A dose deve estar entre 1 e 100.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const payload: CreateFeederConfigRequest = {
                type: configForm.type,
                dose: configForm.dose,
                ...(configForm.type === "INTERVAL"
                    ? {
                        intervalMinutes: configForm.intervalMinutes,
                    }
                    : {
                        timeOfDay: configForm.timeOfDay,
                        weekdays: configForm.weekdays,
                    }),
            };

            if (config) {
                const updatePayload: UpdateFeederConfigRequest = payload;

                await feederConfigService.update(
                    feederId,
                    config.id,
                    updatePayload
                );
            } else {
                await feederConfigService.create(feederId, payload);
            }

            const updatedConfigs = await feederConfigService.findAll(feederId);
            const currentConfig = updatedConfigs[0] ?? null;

            setConfig(currentConfig);

            if (currentConfig) {
                setConfigForm({
                    type: currentConfig.type,
                    intervalMinutes: currentConfig.intervalMinutes ?? 60,
                    timeOfDay: currentConfig.timeOfDay ?? "08:00",
                    weekdays: currentConfig.weekdays ?? [],
                    dose: currentConfig.dose,
                });
            }

            setEditingConfig(!currentConfig);
        } catch {
            setError("Não foi possível salvar a configuração.");
        } finally {
            setSaving(false);
        }
    };

    const updateConfigValue = (name: string, value: unknown) => {
        setConfigForm(current => ({
            ...current,
            [name]: value,
        }));
    };

    const toggleWeekday = (day: Weekday) => {
        setConfigForm(current => ({
            ...current,
            weekdays: current.weekdays.includes(day)
                ? current.weekdays.filter(item => item !== day)
                : [...current.weekdays, day],
        }));
    };

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
                <RefreshCw className="mr-2 animate-spin" size={18} />
                Carregando alimentador...
            </div>
        );
    }

    if (!feeder) {
        return (
            <div className="rounded-xl border p-8 text-center">
                <p className="font-medium">
                    Alimentador não encontrado
                </p>
            </div>
        );
    }

    return (
        <main className="mx-auto w-full max-w-4xl space-y-7 px-5 py-6 md:px-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {feeder.name}
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Gerenciamento do alimentador
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={toggleFeeder}
                        disabled={saving}
                    >
                        <Power className="mr-2 h-4 w-4" />
                        {feeder.active ? "Desativar" : "Ativar"}
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={deleteFeeder}
                        disabled={saving}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                    </Button>
                </div>
            </div>

            {error && (
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}

                    <button
                        type="button"
                        onClick={() => setError("")}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <section className="space-y-4 rounded-xl border p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="font-semibold">
                            Dados do alimentador
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Nome e informações do dispositivo.
                        </p>
                    </div>

                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            feeder.active
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                        }`}
                    >
                        {feeder.active ? "Ativo" : "Inativo"}
                    </span>
                </div>

                {editing ? (
                    <>
                        <Form
                            title=""
                            description=""
                            fields={feederFields}
                            values={values as unknown as Record<string, unknown>}
                            onChange={updateValue}
                        />

                        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={cancelFeederEdit}
                                disabled={saving}
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="button"
                                onClick={updateFeeder}
                                disabled={saving}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? "Salvando..." : "Salvar alterações"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Nome
                                </p>

                                <p className="mt-1 text-sm font-medium">
                                    {feeder.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Dispositivo
                                </p>

                                <p className="mt-1 break-all font-mono text-sm">
                                    {feeder.deviceId}
                                </p>
                            </div>

                            <div className="sm:col-span-2">
                                <p className="text-xs text-muted-foreground">
                                    Descrição
                                </p>

                                <p className="mt-1 text-sm">
                                    {feeder.description || "Sem descrição"}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end border-t pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditing(true)}
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar dados
                            </Button>
                        </div>
                    </>
                )}
            </section>

            <section className="space-y-4 rounded-xl border p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="font-semibold">
                            Configuração de alimentação
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Configuração atual do alimentador.
                        </p>
                    </div>

                    {config && !editingConfig && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={openConfigEdit}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Button>
                    )}
                </div>

                {config && !editingConfig ? (
                    <div className="rounded-lg border p-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-muted p-2">
                                {config.type === "INTERVAL" ? (
                                    <Clock className="h-5 w-5" />
                                ) : (
                                    <CalendarDays className="h-5 w-5" />
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                    {config.type === "INTERVAL"
                                        ? "Por intervalo"
                                        : "Horário diário"}
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {config.type === "INTERVAL"
                                        ? `A cada ${config.intervalMinutes} minutos`
                                        : `${config.timeOfDay} · ${(config.weekdays ?? [])
                                            .map(day =>
                                                WEEKDAYS.find(item => item.value === day)?.label
                                            )
                                            .filter(Boolean)
                                            .join(", ")}`}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Dose: {config.dose}
                                </p>

                                <p className="mt-2 text-xs">
                                    <span
                                        className={
                                            config.active
                                                ? "text-green-600"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        {config.active ? "Ativa" : "Inativa"}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tipo de agendamento</Label>

                            <select
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                value={configForm.type}
                                onChange={event =>
                                    updateConfigValue(
                                        "type",
                                        event.target.value as FeederConfigType
                                    )
                                }
                            >
                                <option value="INTERVAL">
                                    Intervalo
                                </option>

                                <option value="DAILY_TIME">
                                    Horário fixo
                                </option>
                            </select>
                        </div>

                        {configForm.type === "INTERVAL" ? (
                            <div className="space-y-2">
                                <Label>Intervalo (minutos)</Label>

                                <Input
                                    type="number"
                                    min={1}
                                    max={10080}
                                    value={configForm.intervalMinutes}
                                    onChange={event =>
                                        updateConfigValue(
                                            "intervalMinutes",
                                            Number(event.target.value)
                                        )
                                    }
                                />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>Horário</Label>

                                    <Input
                                        type="time"
                                        value={configForm.timeOfDay}
                                        onChange={event =>
                                            updateConfigValue(
                                                "timeOfDay",
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Dias da semana</Label>

                                    <div className="flex flex-wrap gap-2">
                                        {WEEKDAYS.map(day => (
                                            <Button
                                                key={day.value}
                                                type="button"
                                                size="sm"
                                                variant={
                                                    configForm.weekdays.includes(day.value)
                                                        ? "default"
                                                        : "outline"
                                                }
                                                onClick={() => toggleWeekday(day.value)}
                                            >
                                                {day.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label>Dose</Label>

                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={configForm.dose}
                                onChange={event =>
                                    updateConfigValue(
                                        "dose",
                                        Number(event.target.value)
                                    )
                                }
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                            {config && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={cancelConfigEdit}
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                            )}

                            <Button
                                type="button"
                                onClick={saveConfig}
                                disabled={saving}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {saving
                                    ? "Salvando..."
                                    : config
                                        ? "Salvar alterações"
                                        : "Salvar configuração"}
                            </Button>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}