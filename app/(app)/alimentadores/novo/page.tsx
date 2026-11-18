
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader } from "@zxing/browser";
import { z } from "zod";
import { ArrowLeft, Check, RefreshCw, Keyboard, Camera } from "lucide-react";
import Form from "@/components/Form/form";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { feederService } from "@/services/FeederService";

type FeederForm = {
    name: string;
    description: string;
};

type ScannerControls = {
    stop: () => void;
};

function isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value.trim()
    );
}

export default function NewFeeder() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const readerRef = useRef<BrowserQRCodeReader | null>(null);
    const controlsRef = useRef<ScannerControls | null>(null);
    const acceptedRef = useRef(false);
    const cancelledRef = useRef(false);
    const startingRef = useRef(false);

    const [step, setStep] = useState<"code" | "form">("code");
    const [deviceId, setDeviceId] = useState("");
    const [manualCode, setManualCode] = useState("");
    const [manualMode, setManualMode] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [scannerError, setScannerError] = useState("");

    const [values, setValues] = useState<FeederForm>({
        name: "",
        description: "",
    });

    const stopScanner = () => {
        cancelledRef.current = true;
        controlsRef.current?.stop();
        controlsRef.current = null;
        readerRef.current = null;
        startingRef.current = false;

        const video = videoRef.current;

        if (video?.srcObject instanceof MediaStream) {
            video.srcObject.getTracks().forEach((track) => track.stop());
            video.srcObject = null;
        }

        setScanning(false);
    };

    const acceptDeviceCode = (
        rawCode: string,
        controls?: ScannerControls
    ) => {
        const code = rawCode.trim();

        if (acceptedRef.current || cancelledRef.current) return;

        if (!isUuid(code)) {
            return;
        }

        acceptedRef.current = true;
        controls?.stop();
        controlsRef.current?.stop();
        controlsRef.current = null;
        readerRef.current = null;
        startingRef.current = false;

        setScanning(false);
        setScannerError("");
        setDeviceId(code.toLowerCase());
        setStep("form");

        toast.success("Dispositivo identificado.");
    };

    const handleManualCode = () => {
        const code = manualCode.trim();

        if (!code) {
            toast.error("Informe o código UUID do dispositivo.");
            return;
        }

        if (!isUuid(code)) {
            toast.error("O código UUID informado é inválido.");
            return;
        }

        acceptedRef.current = false;
        cancelledRef.current = false;
        acceptDeviceCode(code);
    };

    const startScanner = async () => {
        if (
            !videoRef.current ||
            startingRef.current ||
            acceptedRef.current
        ) {
            return;
        }

        cancelledRef.current = false;
        startingRef.current = true;
        setScanning(true);
        setScannerError("");

        try {
            const reader = new BrowserQRCodeReader();
            readerRef.current = reader;

            const controls = await reader.decodeFromVideoDevice(
                undefined,
                videoRef.current,
                (result, error, callbackControls) => {
                    if (cancelledRef.current || acceptedRef.current) return;

                    if (result) {
                        acceptDeviceCode(
                            result.getText(),
                            callbackControls
                        );
                    }
                }
            );

            if (cancelledRef.current || acceptedRef.current) {
                controls.stop();
                return;
            }

            controlsRef.current = controls;
            startingRef.current = false;
            setScanning(true);

            if (videoRef.current) {
                videoRef.current.play().catch(() => {});
            }
        } catch (error) {
            startingRef.current = false;
            setScanning(false);

            if (!cancelledRef.current) {
                console.error("[QR SCANNER] Erro:", error);

                const message =
                    error instanceof Error
                        ? error.message
                        : "Não foi possível acessar a câmera.";

                setScannerError(message);
                toast.error(message);
            }
        }
    };

    useEffect(() => {
        if (step !== "code" || manualMode) {
            return;
        }

        cancelledRef.current = false;
        acceptedRef.current = false;
        startingRef.current = false;

        const timeout = window.setTimeout(() => {
            startScanner();
        }, 300);

        return () => {
            window.clearTimeout(timeout);
            cancelledRef.current = true;
            controlsRef.current?.stop();
            controlsRef.current = null;
            readerRef.current = null;
            startingRef.current = false;

            const video = videoRef.current;

            if (video?.srcObject instanceof MediaStream) {
                video.srcObject.getTracks().forEach((track) => track.stop());
                video.srcObject = null;
            }
        };
    }, [step, manualMode]);

    const updateValue = (name: string, value: unknown) => {
        setValues((current) => ({
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

    const handleSubmit = async () => {
        if (!deviceId || !isUuid(deviceId)) {
            throw new Error("Identifique o dispositivo antes de cadastrar.");
        }

        if (!values.name.trim()) {
            throw new Error("Informe o nome do alimentador.");
        }

        setLoading(true);

        try {
            await feederService.create({
                deviceId,
                name: values.name.trim(),
                description: values.description.trim() || null,
            });

            toast.success("Alimentador cadastrado com sucesso!");
            router.push("/alimentadores");
        } catch (error) {
            console.error("Erro ao cadastrar alimentador:", error);

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
            <main className="w-full space-y-5 px-6 sm:px-6 lg:px-8">
                <section className="w-full space-y-5">
                    <h1 className="text-xl tracking-tight">
                        Identificar dispositivo
                    </h1>

                    {!manualMode ? (
                        <>
                            <div className="relative w-full overflow-hidden rounded-xl border bg-black">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="aspect-video max-h-[75vh] min-h-[350px] w-full object-cover sm:min-h-[450px] lg:min-h-[550px]"
                                />

                                {scanning && (
                                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <div className="relative aspect-square w-56 max-w-[70%]">
                                            <div className="absolute inset-0 rounded-xl border-2 border-white/80" />
                                            <div className="absolute -left-1 -top-1 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-primary" />
                                            <div className="absolute -right-1 -top-1 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-primary" />
                                            <div className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-primary" />
                                            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-primary" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-center text-sm text-muted-foreground">
                                {scanning
                                    ? "Posicione o QR Code do dispositivo dentro da área de leitura."
                                    : scannerError
                                      ? "Não foi possível iniciar o scanner."
                                      : "Inicializando câmera..."}
                            </p>

                            {scannerError && (
                                <div className="space-y-3">
                                    <p className="text-center text-sm text-destructive">
                                        {scannerError}
                                    </p>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            stopScanner();
                                            acceptedRef.current = false;
                                            cancelledRef.current = false;
                                            startingRef.current = false;
                                            setScannerError("");

                                            window.setTimeout(() => {
                                                startScanner();
                                            }, 200);
                                        }}
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Tentar novamente
                                    </Button>
                                </div>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    stopScanner();
                                    setManualMode(true);
                                    setManualCode("");
                                }}
                            >
                                <Keyboard className="mr-2 h-4 w-4" />
                                Digitar código UUID
                            </Button>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="device-uuid"
                                    className="text-sm font-medium"
                                >
                                    Código UUID do dispositivo
                                </label>

                                <input
                                    id="device-uuid"
                                    type="text"
                                    value={manualCode}
                                    onChange={(event) =>
                                        setManualCode(event.target.value)
                                    }
                                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                    maxLength={36}
                                    autoComplete="off"
                                    spellCheck={false}
                                    className="h-11 w-full rounded-md border bg-background px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>

                            <Button
                                type="button"
                                className="w-full"
                                onClick={handleManualCode}
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Confirmar código
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setManualMode(false);
                                    setManualCode("");
                                }}
                            >
                                <Camera className="mr-2 h-4 w-4" />
                                Voltar para câmera
                            </Button>
                        </div>
                    )}
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
                onClick={() => {
                    stopScanner();
                    acceptedRef.current = false;
                    setDeviceId("");
                    setStep("code");
                }}
            >
                <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                    Etapa 2 de 2 · Cadastro
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
                description="Informe o nome e a descrição do dispositivo."
                fields={fields}
                values={values as unknown as Record<string, unknown>}
                onChange={updateValue}
            />

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
