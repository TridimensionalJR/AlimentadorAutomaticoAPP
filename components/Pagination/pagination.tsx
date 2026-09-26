"use client"

import { FiChevronLeft, FiChevronRight } from "react-icons/fi"

import { Button } from "@/components/ui/button"

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const canPrevious = page > 1
  const canNext = page < totalPages

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled || !canPrevious}
        onClick={() => onPageChange(page - 1)}
        className="size-10 rounded-md cursor-pointer"
      >
        <FiChevronLeft className="size-5" />
      </Button>

      <div className="flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-medium">
        {page}
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled || !canNext}
        onClick={() => onPageChange(page + 1)}
        className="size-10 rounded-md cursor-pointer"
      >
        <FiChevronRight className="size-5" />
      </Button>
    </div>
  )
}