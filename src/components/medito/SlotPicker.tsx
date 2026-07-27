import { useMemo } from "react";
import type { AvailabilitySlot } from "@/lib/types";
import { formatDay, formatTime } from "@/lib/matching";
import { cn } from "@/lib/utils";

/** Grilă simplă de sloturi, grupate pe zile. */
export function SlotPicker({
  slots,
  selectedId,
  onSelect,
}: {
  slots: AvailabilitySlot[];
  selectedId?: string;
  onSelect: (slot: AvailabilitySlot) => void;
}) {
  const days = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    slots.forEach((s) => {
      const key = s.start.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), s]);
    });
    return [...map.entries()];
  }, [slots]);

  if (!days.length) {
    return (
      <p className="text-sm text-muted-foreground">Nu există ore libere în perioada următoare.</p>
    );
  }

  return (
    <div className="space-y-4">
      {days.map(([key, daySlots]) => (
        <div key={key}>
          <p className="mb-2 text-sm font-medium capitalize">{formatDay(daySlots[0].start)}</p>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                disabled={slot.booked}
                onClick={() => onSelect(slot)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  slot.booked &&
                    "cursor-not-allowed border-dashed text-muted-foreground/60 line-through",
                  !slot.booked && "hover:border-primary hover:bg-primary-soft",
                  selectedId === slot.id &&
                    "border-primary bg-primary text-primary-foreground hover:bg-primary",
                )}
              >
                {formatTime(slot.start)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
