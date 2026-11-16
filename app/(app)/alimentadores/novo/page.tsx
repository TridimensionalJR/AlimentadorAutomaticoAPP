
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader } from "@zxing/browser";
import { z } from "zod";
import {
    ArrowLeft,
    Check,
    Plus,
    Trash2,
    QrCode,
    Camera,
    CameraOff,
} from "lucide-react";

import Form from "@/components/Form/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

import { feederService } from "@/services/FeederService";
import { feederConfigService } from "@/services/FeederConfigService";

import type {
    CreateFeederConfigRequest,
    FeederConfigType,
    Weekday,
} from "@/types/feeder";

type FeederForm = {
    name: string;
    description: string;
};

type ConfigForm = CreateFeederConfigRequest;

const weekdays: { label: string; value: Weekday }[] = [
    { label: "Seg", value: "MONDAY" },
    { label: "Ter", value: "TUESDAY" },
    { label: "Qua", value: "WEDNESDAY" },
    { label: "Qui", value: "THURSDAY" },
    { label: "Sex", value: "FRIDAY" },
    { label: "Sáb", value: "SATURDAY" },
    { label: "Dom", value: "SUNDAY" },
];

function isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export default function NewFeeder() {
    const router = useRouter();

    const videoRef = useRef<HTMLVideoElement>(null);
    const readerRef = useRef<BrowserQRCodeReader | null>(null);
    const controlsRef = useRef<{ stop: () => void } | null>(null);

    const [step, setStep] = useState<"code" | "form">("code");
    const [deviceId, setDeviceId] = useState("");
    const [manualCode, setManualCode] = useState("");
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);

    const [values, setValues] = useState<FeederForm>({
        name: "",
        description: "",
    });

    const [configs, setConfigs] = useState<ConfigForm[]>([]);

    const [config, setConfig] = useState<ConfigForm>({
        type: "INTERVAL",
        intervalMinutes: 60,
        timeOfDay: null,
        weekdays: [],
        dose: 1,
    });

    const stopScanner = () => {
        controlsRef.current?.stop();
        controlsRef.current = null;
        setScanning(false);
    };

    useEffect(() => {
        return () => {
            controlsRef.current?.stop();
        };
    }, []);

    const acceptDeviceCode = (rawCode: string) => {
        const code = rawCode.trim();

        if (!isUuid(code)) {
            toast.error("QR Code inválido. O código deve conter somente um UUID.");
            return;
        }

        stopScanner();

        setDeviceId(code.toLowerCase());
        setStep("form");

        toast.success("Dispositivo identificado com sucesso.");
    };

    const startScanner = async () => {
        if (!videoRef.current || scanning) return;

        try {
            setScanning(true);

            readerRef.current = new BrowserQRCodeReader();

            const controls = await readerRef.current.decodeFromVideoDevice(
                undefined,
                videoRef.current,
                (result) => {
                    if (!result) return;

                    const code = result.getText().trim();

                    if (!isUuid(code)) {
                        toast.error("O QR Code lido não contém um UUID válido.");
                        return;
                    }

                    acceptDeviceCode(code);
                }
            );

            controlsRef.current = controls;
        } catch (error) {
            setScanning(false);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Não foi possível acessar a câmera."
            );
        }
    };

    const updateValue = (name: string, value: unknown) => {
        setValues(current => ({
            ...current,
            [name]: value,
        }));
    };

    const fields = [
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

    const updateConfig = (name: string, value: unknown) => {
        setConfig(current => ({
            ...current,
            [name]: value,
        }));
    };

    const addConfig = () => {
        if (
            config.type === "INTERVAL" &&
            (!config.intervalMinutes ||
                config.intervalMinutes < 1 ||
                config.intervalMinutes > 10080)
        ) {
            return toast.error("Informe um intervalo entre 1 e 10080 minutos.");
        }

        if (config.type === "DAILY_TIME" && !config.timeOfDay) {
            return toast.error("Informe o horário da alimentação.");
        }

        if (config.type === "DAILY_TIME" && !config.weekdays?.length) {
            return toast.error("Selecione pelo menos um dia da semana.");
        }

        if (!config.dose || config.dose < 1 || config.dose > 100) {
            return toast.error("A dose deve estar entre 1 e 100.");
        }

        setConfigs(current => [
            ...current,
            {
                ...config,
                intervalMinutes:
                    config.type === "INTERVAL" ? config.intervalMinutes : null,
                timeOfDay:
                    config.type === "DAILY_TIME" ? config.timeOfDay : null,
                weekdays:
                    config.type === "DAILY_TIME" ? config.weekdays : [],
            },
        ]);

        setConfig(current => ({
            ...current,
            timeOfDay: null,
            weekdays: [],
        }));
    };

    const handleSubmit = async () => {
        if (!deviceId || !isUuid(deviceId)) {
            throw new Error("Identifique o dispositivo antes de cadastrar.");
        }

        if (!values.name.trim()) {
            throw new Error("Informe o nome do alimentador.");
        }

        setLoading(true);

        try {
            const feeder = await feederService.create({
                deviceId,
                name: values.name.trim(),
                description: values.description.trim() || null,
            });

            if (configs.length) {
                await Promise.all(
                    configs.map(item =>
                        feederConfigService.create(feeder.id, item)
                    )
                );
            }

            toast.success("Alimentador cadastrado com sucesso!");
            router.push("/alimentadores");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Não foi possível cadastrar o alimentador."
            );
        } finally {
            setLoading(false);
        }
    };

    if (step === "code") {
        return (
            <main className="mx-auto w-full max-w-4xl space-y-7 px-5 py-6 md:px-0">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Voltar"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <section className="space-y-6">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                            Etapa 1 de 2 · Identificação
                        </p>

                        <h1 className="text-2xl font-semibold tracking-tight">
                            Adicionar alimentador
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Escaneie o QR Code presente no dispositivo para
                            identificá-lo.
                        </p>
                    </div>

                    <div className="max-w-xl space-y-4 rounded-xl border p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                            <QrCode className="h-5 w-5" />

                            <div>
                                <p className="text-sm font-medium">
                                    Identificação do dispositivo
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    O QR Code deve conter exclusivamente um UUID.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="overflow-hidden rounded-lg border bg-black">
                                <video
                                    ref={videoRef}
                                    className="aspect-video w-full object-cover"
                                    muted
                                    playsInline
                                />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {!scanning ? (
                                    <Button
                                        type="button"
                                        onClick={startScanner}
                                        className="w-full"
                                    >
                                        <Camera className="mr-2 h-4 w-4" />
                                        Ativar câmera e escanear
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={stopScanner}
                                        className="w-full"
                                    >
                                        <CameraOff className="mr-2 h-4 w-4" />
                                        Parar câmera
                                    </Button>
                                )}
                            </div>

                            <p className="text-center text-xs text-muted-foreground">
                                Posicione o QR Code dentro da área da câmera.
                            </p>
                        </div>

                        <div className="relative flex items-center gap-3">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-xs text-muted-foreground">
                                OU INFORME MANUALMENTE
                            </span>
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="deviceCode">
                                Código do alimentador
                            </Label>

                            <Input
                                id="deviceCode"
                                placeholder="550e8400-e29b-41d4-a716-446655440000"
                                value={manualCode}
                                onChange={e => setManualCode(e.target.value)}
                                disabled={scanning}
                                autoComplete="off"
                                spellCheck={false}
                                className="font-mono"
                            />
                        </div>

                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => acceptDeviceCode(manualCode)}
                            disabled={!manualCode.trim() || scanning}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Validar código
                        </Button>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-4xl space-y-7 px-5 py-6 md:px-0">
            <Button
                variant="ghost"
                size="icon"
                aria-label="Voltar para identificação"
                onClick={() => setStep("code")}
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                    Etapa 2 de 2 · Configuração
                </p>

                <h1 className="text-2xl font-semibold tracking-tight">
                    Novo alimentador
                </h1>
            </div>

            <section className="space-y-1 rounded-xl border p-4">
                <p className="text-sm font-medium">
                    Dispositivo identificado
                </p>

                <p className="break-all font-mono text-xs text-muted-foreground">
                    {deviceId}
                </p>
            </section>

            <Form
                title="Dados do alimentador"
                description="Informe o nome e as informações do dispositivo."
                fields={fields}
                values={values as unknown as Record<string, unknown>}
                onChange={updateValue}
            />

            <section className="space-y-4 rounded-xl border p-4">
                <div>
                    <h2 className="font-semibold">
                        Configurações de alimentação
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Defina os horários ou intervalos de alimentação.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Tipo de agendamento</Label>

                        <select
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            value={config.type}
                            onChange={e =>
                                updateConfig(
                                    "type",
                                    e.target.value as FeederConfigType
                                )
                            }
                        >
                            <option value="INTERVAL">Intervalo</option>
                            <option value="DAILY_TIME">Horário fixo</option>
                        </select>
                    </div>

                    {config.type === "INTERVAL" ? (
                        <div className="space-y-2">
                            <Label>Intervalo (minutos)</Label>

                            <Input
                                type="number"
                                min={1}
                                max={10080}
                                value={config.intervalMinutes ?? ""}
                                onChange={e =>
                                    updateConfig(
                                        "intervalMinutes",
                                        Number(e.target.value)
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
                                    value={config.timeOfDay ?? ""}
                                    onChange={e =>
                                        updateConfig("timeOfDay", e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label>Dias da semana</Label>

                                <div className="flex flex-wrap gap-2">
                                    {weekdays.map(day => (
                                        <Button
                                            key={day.value}
                                            type="button"
                                            size="sm"
                                            variant={
                                                config.weekdays?.includes(day.value)
                                                    ? "default"
                                                    : "outline"
                                            }
                                            onClick={() =>
                                                updateConfig(
                                                    "weekdays",
                                                    config.weekdays?.includes(day.value)
                                                        ? config.weekdays.filter(
                                                              d => d !== day.value
                                                          )
                                                        : [
                                                              ...(config.weekdays ?? []),
                                                              day.value,
                                                          ]
                                                )
                                            }
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
                            value={config.dose}
                            onChange={e =>
                                updateConfig("dose", Number(e.target.value))
                            }
                        />
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    onClick={addConfig}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar configuração
                </Button>

                {configs.length > 0 && (
                    <div className="space-y-2">
                        {configs.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                            >
                                <div>
                                    <p className="font-medium">
                                        {item.type === "INTERVAL"
                                            ? `A cada ${item.intervalMinutes} minutos`
                                            : `${item.timeOfDay} · ${item.weekdays
                                                  ?.map(
                                                      d =>
                                                          weekdays.find(
                                                              w => w.value === d
                                                          )?.label
                                                  )
                                                  .join(", ")}`}
                                    </p>

                                    <p className="text-muted-foreground">
                                        Dose: {item.dose}
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                        setConfigs(current =>
                                            current.filter((_, i) => i !== index)
                                        )
                                    }
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/alimentadores")}
                    disabled={loading}
                >
                    Cancelar
                </Button>

                <Button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                >
                    <Check className="mr-2 h-4 w-4" />
                    {loading ? "Salvando..." : "Cadastrar alimentador"}
                </Button>
            </div>
        </main>
    );
}
