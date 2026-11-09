
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { z } from "zod";
import {
  ArrowLeft,
  Camera,
  Check,
  Clock,
  Plus,
  QrCode,
  Trash2,
} from "lucide-react";

import Form from "@/components/Form/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "react-toastify";

type ConfigType = "INTERVAL" | "DAILY_TIME";

type FeederConfig = {
  id: string;
  type: ConfigType;
  intervalMinutes: string;
  timeOfDay: string;
  weekdays: string[];
  dose: string;
  isActive: boolean;
};

type FeederForm = {
  deviceId: string;
  name: string;
  description: string;
  timezone: string;
  isActive: boolean;
};

const weekdays = [
  { label: "Seg", value: "MONDAY" },
  { label: "Ter", value: "TUESDAY" },
  { label: "Qua", value: "WEDNESDAY" },
  { label: "Qui", value: "THURSDAY" },
  { label: "Sex", value: "FRIDAY" },
  { label: "Sáb", value: "SATURDAY" },
  { label: "Dom", value: "SUNDAY" },
];

const timezones = [
  { label: "Salvador / Bahia", value: "America/Bahia" },
  { label: "São Paulo / Brasília", value: "America/Sao_Paulo" },
  { label: "Manaus", value: "America/Manaus" },
  { label: "Rio Branco", value: "America/Rio_Branco" },
  { label: "Fernando de Noronha", value: "America/Noronha" },
];

const newConfig = (): FeederConfig => ({
  id: crypto.randomUUID(),
  type: "INTERVAL",
  intervalMinutes: "60",
  timeOfDay: "08:00",
  weekdays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
  dose: "1",
  isActive: true,
});

function extractDeviceId(rawValue: string): string {
  const value = rawValue.trim();

  try {
    const parsed: unknown = JSON.parse(value);

    if (typeof parsed === "string") return parsed.trim();

    if (parsed && typeof parsed === "object" && "deviceId" in parsed) {
      const deviceId = (parsed as { deviceId?: unknown }).deviceId;

      if (typeof deviceId === "string") return deviceId.trim();
    }
  } catch {
    // O QR Code também pode conter o UUID diretamente.
  }

  return value;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default function NewFeeder() {
  const router = useRouter();

  const [step, setStep] = useState<"scan" | "form">("scan");
  const [scanning, setScanning] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [configs, setConfigs] = useState<FeederConfig[]>([newConfig()]);
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState<FeederForm>({
    deviceId: "",
    name: "",
    description: "",
    timezone: "America/Bahia",
    isActive: true,
  });

  const stopScanner = useCallback(async () => {
    const scanner = (window as Window & {
      feederQrScanner?: Html5Qrcode;
    }).feederQrScanner;

    if (!scanner) return;

    try {
      if (scanner.isScanning) await scanner.stop();
      scanner.clear();
    } catch {
      // A câmera pode já estar desligada.
    }

    delete (window as Window & {
      feederQrScanner?: Html5Qrcode;
    }).feederQrScanner;

    setScanning(false);
  }, []);

  useEffect(() => {
    if (step !== "scan") return;

    let cancelled = false;

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("feeder-qr-reader");

        (window as Window & {
          feederQrScanner?: Html5Qrcode;
        }).feederQrScanner = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText) => {
            if (cancelled) return;

            const id = extractDeviceId(decodedText);

            if (!isUuid(id)) {
              toast.error("O QR Code não contém um UUID de dispositivo válido.");
              return;
            }

            cancelled = true;
            setDeviceId(id);
            setValues((current) => ({ ...current, deviceId: id }));
            setStep("form");

            try {
              if (scanner.isScanning) await scanner.stop();
              scanner.clear();
            } catch {
              // A transição de etapa não deve ser bloqueada.
            }
          },
          () => {},
        );

        if (!cancelled) setScanning(true);
      } catch {
        if (!cancelled) {
          toast.error("Não foi possível acessar a câmera. Verifique as permissões.");
        }
      }
    };

    void startScanner();

    return () => {
      cancelled = true;

      const scanner = (window as Window & {
        feederQrScanner?: Html5Qrcode;
      }).feederQrScanner;

      if (scanner?.isScanning) {
        void scanner.stop().catch(() => {});
      }
    };
  }, [step]);

  const updateValue = (name: string, value: unknown) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const updateConfig = (
    id: string,
    field: keyof FeederConfig,
    value: unknown,
  ) => {
    setConfigs((current) =>
      current.map((config) =>
        config.id === id ? { ...config, [field]: value } : config,
      ),
    );
  };

  const fields = useMemo(
    () => [
      {
        name: "name",
        label: "Nome do alimentador",
        placeholder: "Ex.: Alimentador da sala",
        required: true,
        validation: z.string().trim().min(1, "Informe o nome do alimentador."),
      },
      {
        name: "timezone",
        label: "Fuso horário",
        type: "select" as const,
        required: true,
        options: timezones,
      },
      {
        name: "description",
        label: "Descrição",
        type: "textarea" as const,
        placeholder: "Informações adicionais (opcional)",
      },
      {
        name: "isActive",
        label: "Alimentador ativo",
        type: "switch" as const,
      },
    ],
    [],
  );

  const handleSubmit = async () => {
    if (!deviceId || !isUuid(deviceId)) {
      throw new Error("Leia um QR Code válido antes de cadastrar.");
    }

    for (const config of configs) {
      const dose = Number(config.dose);

      if (!Number.isInteger(dose) || dose < 1 || dose > 100) {
        throw new Error("A dose deve ser um número inteiro entre 1 e 100.");
      }

      if (config.type === "INTERVAL") {
        const interval = Number(config.intervalMinutes);

        if (!Number.isInteger(interval) || interval < 1 || interval > 10080) {
          throw new Error("O intervalo deve ser entre 1 e 10080 minutos.");
        }
      } else {
        if (!config.timeOfDay) {
          throw new Error("Informe o horário de execução.");
        }

        if (config.weekdays.length === 0) {
          throw new Error("Selecione ao menos um dia da semana.");
        }
      }
    }

    setLoading(true);

    try {
      const payload = {
        ...values,
        deviceId,
        configs: configs.map((config) => ({
          type: config.type,
          intervalMinutes:
            config.type === "INTERVAL"
              ? Number(config.intervalMinutes)
              : null,
          timeOfDay:
            config.type === "DAILY_TIME" ? config.timeOfDay : null,
          weekdays:
            config.type === "INTERVAL"
              ? [
                  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
                  "FRIDAY", "SATURDAY", "SUNDAY",
                ]
              : config.weekdays,
          dose: Number(config.dose),
          isActive: config.isActive,
        })),
      };

      // Integre aqui a rota POST real do backend.
      console.log("Payload para cadastro:", payload);

      throw new Error("Configure a URL da API para concluir o cadastro.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "scan") {
    return (
      <main className="fixed inset-0 z-50 flex min-h-dvh flex-col bg-background">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b px-5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Voltar"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-lg font-semibold">Adicionar alimentador</h1>
            <p className="text-xs text-muted-foreground">Etapa 1 de 2 · Pareamento</p>
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center gap-6 overflow-y-auto px-5 py-8">
          <div className="max-w-sm space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <QrCode className="h-7 w-7" />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">
              Escaneie o QR Code
            </h2>

            <p className="text-sm leading-6 text-muted-foreground">
              Aponte a câmera para o código do alimentador para identificá-lo
              e vinculá-lo à sua conta.
            </p>
          </div>

          <div className="w-full max-w-md overflow-hidden rounded-2xl border bg-black p-2">
            <div id="feeder-qr-reader" className="min-h-64 w-full" />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Camera className="h-4 w-4" />
            {scanning ? "Câmera pronta para leitura" : "Inicializando câmera..."}
          </div>

          <p className="max-w-xs text-center text-xs text-muted-foreground">
            Permita o acesso à câmera quando solicitado. É necessário utilizar
            HTTPS ou localhost.
          </p>

          <Button variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-7 px-5 py-6 md:px-0">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar para leitura do QR Code"
          onClick={() => {
            setStep("scan");
          }}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Configurar alimentador
          </h1>
          <p className="text-sm text-muted-foreground">
            Etapa 2 de 2 · Dados e programação
          </p>
        </div>
      </div>

      <section className="rounded-xl border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Check className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Dispositivo identificado</p>
            <p className="break-all font-mono text-xs text-muted-foreground">
              {deviceId}
            </p>
          </div>
        </div>
      </section>

      <Form
        title="Dados do alimentador"
        description="Informe como o dispositivo será identificado e configurado."
        fields={fields}
        values={values as unknown as Record<string, unknown>}
        onChange={updateValue}
      />

      <section className="space-y-4 border-t pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Regras de alimentação</h2>
            <p className="text-sm text-muted-foreground">
              Configure intervalos ou horários específicos para cada regra.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => setConfigs((current) => [...current, newConfig()])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar regra
          </Button>
        </div>

        {configs.map((config, index) => (
          <article key={config.id} className="space-y-5 rounded-xl border p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium">Regra {index + 1}</h3>

              {configs.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remover regra ${index + 1}`}
                  onClick={() =>
                    setConfigs((current) =>
                      current.filter((item) => item.id !== config.id),
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de programação</Label>
                <Select
                  value={config.type}
                  onValueChange={(value) =>
                    updateConfig(config.id, "type", value as ConfigType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INTERVAL">Intervalo contínuo</SelectItem>
                    <SelectItem value="DAILY_TIME">Horários fixos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dose por execução (1–100)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  value={config.dose}
                  onChange={(event) =>
                    updateConfig(config.id, "dose", event.target.value)
                  }
                />
              </div>

              {config.type === "INTERVAL" ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Intervalo entre execuções (minutos)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10080}
                    step={1}
                    value={config.intervalMinutes}
                    onChange={(event) =>
                      updateConfig(config.id, "intervalMinutes", event.target.value)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    De 1 minuto até 7 dias. A regra repete continuamente.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Horário de execução</Label>
                    <Input
                      type="time"
                      value={config.timeOfDay}
                      onChange={(event) =>
                        updateConfig(config.id, "timeOfDay", event.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Dias da semana</Label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {weekdays.map((day) => {
                        const selected = config.weekdays.includes(day.value);

                        return (
                          <Button
                            key={day.value}
                            type="button"
                            size="sm"
                            variant={selected ? "default" : "outline"}
                            aria-pressed={selected}
                            onClick={() =>
                              updateConfig(
                                config.id,
                                "weekdays",
                                selected
                                  ? config.weekdays.filter((item) => item !== day.value)
                                  : [...config.weekdays, day.value],
                              )
                            }
                          >
                            {day.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <Label>Regra ativa</Label>
                <p className="text-xs text-muted-foreground">
                  Permite pausar esta programação individualmente.
                </p>
              </div>

              <Switch
                checked={config.isActive}
                onCheckedChange={(checked) =>
                  updateConfig(config.id, "isActive", checked)
                }
              />
            </div>
          </article>
        ))}
      </section>

      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/alimentadores")}
        >
          Cancelar
        </Button>

        <Button type="button" disabled={loading} onClick={async () => {
          try {
            await handleSubmit();
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Erro ao cadastrar.",
            );
          }
        }}>
          <Check className="mr-2 h-4 w-4" />
          {loading ? "Salvando..." : "Cadastrar alimentador"}
        </Button>
      </div>
    </main>
  );
}
