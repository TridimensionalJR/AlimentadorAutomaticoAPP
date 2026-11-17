
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader } from "@zxing/browser";
import { z } from "zod";

import { ArrowLeft, Check } from "lucide-react";

import Form from "@/components/Form/form";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

import { feederService } from "@/services/FeederService";

type FeederForm = {
    name: string;
    description: string;
};

function isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export default function NewFeeder() {
    const router = useRouter();

    const videoRef = useRef<HTMLVideoElement>(null);
    const readerRef = useRef<BrowserQRCodeReader | null>(null);
    const controlsRef = useRef<{ stop: () => void } | null>(null);
    const acceptedRef = useRef(false);
    const scannerCancelledRef = useRef(false);

    const [step, setStep] = useState<"code" | "form">("code");
    const [deviceId, setDeviceId] = useState("");
    const [scanning, setScanning] = useState(false);
    const [loading, setLoading] = useState(false);

    const [values, setValues] = useState<FeederForm>({
        name: "",
        description: "",
    });

    const stopScanner = () => {
        scannerCancelledRef.current = true;

        controlsRef.current?.stop();
        controlsRef.current = null;

        setScanning(false);
    };

    const acceptDeviceCode = (rawCode: string) => {
        const code = rawCode.trim();

        if (!isUuid(code) || acceptedRef.current) return;

        acceptedRef.current = true;

        controlsRef.current?.stop();
        controlsRef.current = null;

        setScanning(false);
        setDeviceId(code.toLowerCase());
        setStep("form");

        toast.success("Dispositivo identificado.");
    };

    const startScanner = async () => {
        if (!videoRef.current || scanning) return;

        scannerCancelledRef.current = false;
        acceptedRef.current = false;

        try {
            setScanning(true);

            readerRef.current = new BrowserQRCodeReader();

            const controls = await readerRef.current.decodeFromVideoDevice(
                undefined,
                videoRef.current,
                (result) => {
                    if (
                        !result ||
                        acceptedRef.current ||
                        scannerCancelledRef.current
                    ) {
                        return;
                    }

                    acceptDeviceCode(result.getText());
                }
            );

            if (scannerCancelledRef.current || acceptedRef.current) {
                controls.stop();
                return;
            }

            controlsRef.current = controls;
        } catch (error) {
            setScanning(false);

            if (!scannerCancelledRef.current) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível acessar a câmera."
                );
            }
        }
    };

    useEffect(() => {
        if (step !== "code") return;

        const timeout = window.setTimeout(() => {
            startScanner();
        }, 100);

        return () => {
            window.clearTimeout(timeout);

            scannerCancelledRef.current = true;

            controlsRef.current?.stop();
            controlsRef.current = null;
        };
    }, [step]);

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
                        Escanear dispositivo
                    </h1>

                    <div className="w-full overflow-hidden rounded-xl border bg-black">
                        <video
                            ref={videoRef}
                            className="aspect-video max-h-[75vh] min-h-[350px] w-full object-cover sm:min-h-[450px] lg:min-h-[550px]"
                            muted
                            playsInline
                        />
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
