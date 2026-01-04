"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
} from "react-day-picker"
import { useLocale } from "next-intl"
import { fr, enUS, ar } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

const dateFnsLocales: Record<string, any> = {
  fr,
  en: enUS,
  ar: ar
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const dateLocale = dateFnsLocales[locale] || enUS

  return (
    <DayPicker
      locale={dateLocale}
      dir={isRtl ? "rtl" : "ltr"}
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-slate-900 border border-slate-800 p-4 rounded-3xl shadow-2xl group/calendar [--cell-size:40px]",
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between z-10",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-10 aria-disabled:opacity-50 p-0 select-none bg-slate-950/50 border-slate-800 hover:bg-slate-800 hover:text-white rounded-2xl shadow-lg transition-all",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-10 aria-disabled:opacity-50 p-0 select-none bg-slate-950/50 border-slate-800 hover:bg-slate-800 hover:text-white rounded-2xl shadow-lg transition-all",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-10 w-full px-10 mb-4",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-black uppercase tracking-widest justify-center h-10 gap-2",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-indigo-500 border border-slate-800 bg-slate-950 shadow-inner rounded-xl transition-all",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-slate-900 inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-black uppercase tracking-widest text-sm text-indigo-400 bg-indigo-500/10 px-4 py-1.5 rounded-full",
          captionLayout === "label"
            ? ""
            : "rounded-full ps-3 pe-2 flex items-center gap-1 h-9",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex mb-4 px-1", defaultClassNames.weekdays),
        weekday: cn(
          "text-slate-600 rounded-md flex-1 font-black text-[10px] uppercase tracking-tighter text-center select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-1.5", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-10 text-slate-700 font-bold",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[10px] select-none text-slate-700 font-bold",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center group/day aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-s-2xl bg-indigo-600/30",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none bg-indigo-600/15", defaultClassNames.range_middle),
        range_end: cn("rounded-e-2xl bg-indigo-600/30", defaultClassNames.range_end),
        today: cn(
          "after:absolute after:bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:size-1.5 after:bg-indigo-500 after:rounded-full after:shadow-[0_0_8px_rgba(99,102,241,0.8)]",
          defaultClassNames.today
        ),
        outside: cn(
          "text-slate-700 aria-selected:text-slate-500",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-slate-800/40 opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          const Icon = orientation === "left"
            ? (isRtl ? ChevronRightIcon : ChevronLeftIcon)
            : (orientation === "right"
              ? (isRtl ? ChevronLeftIcon : ChevronRightIcon)
              : ChevronDownIcon);

          return <Icon className={cn("size-5", className)} {...props} />;
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "h-10 w-10 rounded-2xl font-bold text-sm transition-all relative overflow-hidden",
        "hover:bg-indigo-600 hover:text-white hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-110 z-10",
        "data-[selected-single=true]:bg-indigo-600 data-[selected-single=true]:text-white data-[selected-single=true]:shadow-xl data-[selected-single=true]:shadow-indigo-500/40 data-[selected-single=true]:scale-105",
        "data-[range-start=true]:bg-indigo-600 data-[range-start=true]:text-white data-[range-start=true]:rounded-s-2xl",
        "data-[range-end=true]:bg-indigo-600 data-[range-end=true]:text-white data-[range-end=true]:rounded-e-2xl",
        "data-[range-middle=true]:bg-indigo-600/20 data-[range-middle=true]:text-indigo-300 data-[range-middle=true]:rounded-none hover:data-[range-middle=true]:rounded-2xl",
        modifiers.today && !modifiers.selected && "text-indigo-400 font-black ring-1 ring-inset ring-indigo-500/30",
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
