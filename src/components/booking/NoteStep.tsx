import { Textarea } from "@/components/ui/textarea";

export default function NoteStep({
  note,
  setNote,
}: {
  note: string;
  setNote: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-2xl font-semibold">Note for host</p>
        <p className="text-sm text-slate-500">
          Optional — share any special requests or details with the host
        </p>
      </div>

      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. We’ll arrive around 9PM, please let us know if that works."
        className="min-h-30 rounded-xl focus-visible:ring-2 focus-visible:ring-black"
      />

      <p className="text-xs text-slate-500">
        This note will be sent to the host after you confirm the booking.
      </p>
    </div>
  );
}
