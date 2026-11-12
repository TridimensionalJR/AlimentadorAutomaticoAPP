"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import useEmblaCarousel from "embla-carousel-react"
import { FiPlus } from "react-icons/fi"

import { feederService } from "@/services/FeederService"
import type { Feeder } from "@/types/feeder"

export default function Dashboard() {
  const router = useRouter()
  const [feeders, setFeeders] = useState<Feeder[]>([])
  const [loading, setLoading] = useState(true)

  const [emblaStoriesRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  })

  useEffect(() => {
    let active = true

    const loadFeeders = async () => {
      try {
        const data = await feederService.findAll()
        if (active) setFeeders(data.filter(feeder => feeder.active))
      } catch (error) {
        console.error("Erro ao carregar alimentadores:", error)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadFeeders()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="w-full space-y-6 p-6 lg:p-0 md:p-7 max-w-4xl mx-auto">
      <div ref={emblaStoriesRef} className="w-full overflow-hidden">
        <div className="flex gap-5">
          <button
            type="button"
            onClick={() => router.push("/alimentadores/novo")}
            className="group flex shrink-0 flex-col items-center gap-2 cursor-pointer"
          >
            <div className="flex size-16 items-center justify-center rounded-full border border-dashed bg-muted/30 transition-colors group-hover:bg-muted">
              <FiPlus className="size-6" />
            </div>

            <span className="text-xs font-medium">Adicionar</span>
          </button>

          {!loading && feeders.map(feeder => (
            <button
              key={feeder.id}
              type="button"
              onClick={() => router.push(`/alimentadores/${feeder.id}`)}
              className="group flex shrink-0 flex-col items-center gap-2 cursor-pointer"
            >
              <div className="relative flex size-16 items-center justify-center rounded-full border-2 border-primary bg-background p-1">
                <div className="flex size-full items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {feeder.name.slice(0, 2).toUpperCase()}
                </div>

                <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-background bg-emerald-500" />
              </div>

              <span className="max-w-20 truncate text-xs font-medium">
                {feeder.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 text-center">
        <Image
          src="/assets/dog.webp"
          alt="Cachorro"
          width={220}
          height={220}
          priority
          className="h-auto w-full max-w-[220px] max-h-[160px] object-contain"
        />

        <h1 className="text-lg font-semibold tracking-tight">
          Dashboard em elaboração
        </h1>
      </div>

      {/*<div
        ref={emblaMetricsRef}
        className="w-full overflow-hidden md:overflow-visible"
      >
        <div className="flex gap-3 md:grid md:grid-cols-3">
          <div className="min-w-0 shrink-0 basis-[calc(50%-6px)] md:basis-auto">
            <MetricCard
              title="Dosagens hoje"
              value={8}
              icon={<FiDroplet className="size-5" />}
            />
          </div>

          <div className="min-w-0 shrink-0 basis-[calc(50%-6px)] md:basis-auto">
            <MetricCard
              title="Consumo hoje"
              value="2,4 kg"
              icon={<FiActivity className="size-5" />}
            />
          </div>

          <div className="min-w-0 shrink-0 basis-[calc(50%-6px)] md:basis-auto">
            <MetricCard
              title="Próxima dosagem"
              value="20:00"
              description="Alimentador 01"
              icon={<FiClock className="size-5" />}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="rounded-xl bg-muted/50 p-4">
          <div className="mb-3">
            <h2 className="text-base font-semibold">
              Consumo
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Últimos 7 dias
            </p>
          </div>

          <Chart
            type="area"
            data={consumptionData}
            xKey="name"
            series={[
              {
                dataKey: "consumo",
                label: "Consumo",
              },
            ]}
            height={260}
          />
        </div>
      </div>

      <Table
        data={dosingData}
        rowKey="id"
        accordion={{
          title: "Próximas dosagens",
          description: "Próximos horários programados.",
          defaultOpen: true,
        }}
        columns={[
          {
            key: "feeder",
            label: "Alimentador",
          },
          {
            key: "quantity",
            label: "Quantidade",
          },
          {
            key: "date",
            label: "Data",
          },
          {
            key: "time",
            label: "Horário",
          },
          {
            key: "status",
            label: "Status",
            render: (value) => (
              <span className="font-medium text-emerald-600">
                {String(value)}
              </span>
            ),
          },
        ]}
      />*/}
    </div>
  )
}
