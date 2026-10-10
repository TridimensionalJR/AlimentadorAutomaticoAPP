"use client"

import useEmblaCarousel from "embla-carousel-react"

import {
  FiActivity,
  FiClock,
  FiDroplet,
  FiPlus,
} from "react-icons/fi"

import Chart from "@/components/Chart/chart"
import MetricCard from "@/components/MetricCard/metricCard"
import Table from "@/components/Table/table"

const dosingData = [
  {
    id: 1,
    feeder: "Alimentador 01",
    quantity: "120 g",
    date: "29/09/2026",
    time: "20:00",
    status: "Programada",
  },
  {
    id: 2,
    feeder: "Alimentador 02",
    quantity: "80 g",
    date: "30/09/2026",
    time: "07:30",
    status: "Programada",
  },
  {
    id: 3,
    feeder: "Alimentador 01",
    quantity: "120 g",
    date: "30/09/2026",
    time: "12:00",
    status: "Programada",
  },
]

const consumptionData = [
  { name: "Seg", consumo: 620 },
  { name: "Ter", consumo: 580 },
  { name: "Qua", consumo: 710 },
  { name: "Qui", consumo: 650 },
  { name: "Sex", consumo: 760 },
  { name: "Sáb", consumo: 690 },
  { name: "Dom", consumo: 730 },
]

const feeders = [
  {
    id: "01",
    name: "Alimentador 01",
    status: "Online",
    nextDose: "20:00",
    foodLevel: 78,
  },
  {
    id: "02",
    name: "Alimentador 02",
    status: "Online",
    nextDose: "07:30",
    foodLevel: 54,
  },
  {
    id: "03",
    name: "Alimentador 03",
    status: "Online",
    nextDose: "18:30",
    foodLevel: 91,
  },
]

export default function Dashboard() {
  const [emblaStoriesRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  })

  const [emblaMetricsRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  })

  return (
    <div className="w-full space-y-6 p-6 lg:p-0 md:p-7 max-w-4xl mx-auto">
      <div
        ref={emblaStoriesRef}
        className="w-full overflow-hidden"
      >
        <div className="flex gap-5">
          <button
            type="button"
            className="group flex shrink-0 flex-col items-center gap-2"
          >
            <div className="flex size-16 items-center justify-center rounded-full border border-dashed bg-muted/30 transition-colors group-hover:bg-muted">
              <FiPlus className="size-6" />
            </div>

            <span className="text-xs font-medium">
              Adicionar
            </span>
          </button>

          {feeders.map((feeder) => (
            <button
              key={feeder.id}
              type="button"
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <div className="relative flex size-16 items-center justify-center rounded-full border-2 border-primary bg-background p-1">
                <div className="flex size-full items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  {feeder.id}
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

      <div
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
      />
    </div>
  )
}