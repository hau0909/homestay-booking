import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Info = {
  title: string;
  description: string;
};

type Props = {
  value: Info;
  onChange: (data: Info) => void;
};

export default function ExperienceInfoStep({ value, onChange }: Props) {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Tell us about your experience
        </h2>
        <p className="text-muted-foreground text-sm">
          Give your experience a catchy title and describe what guests will do,
          what makes it unique, and what they can expect.
        </p>
      </div>

      <div className="space-y-8 p-1">
        <div className="space-y-3">
          <label className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
            Experience Title
          </label>
          <Input
            type="text"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder="e.g. Sunset Kayaking & Beach Bonfire"
            className="h-12 text-base px-4 bg-slate-50 border-slate-200 focus-visible:ring-slate-400 focus-visible:border-slate-400 transition-all shadow-sm rounded-xl"
          />
          <p className="text-[13px] text-slate-500">
            Keep it short, descriptive, and exciting. Max 60 characters.
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
            Detailed Description
          </label>
          <Textarea
            value={value.description}
            onChange={(e) =>
              onChange({ ...value, description: e.target.value })
            }
            placeholder="Share the magic of your experience... What will guests see, do, and feel? What makes your perspective special?"
            className="min-h-55 text-base p-4 bg-slate-50 border-slate-200 focus-visible:ring-slate-400 focus-visible:border-slate-400 transition-all shadow-sm rounded-xl resize-y"
          />
          <p className="text-[13px] text-slate-500">
            A great description is clear, engaging, and sets the right
            expectations. Let your personality shine through!
          </p>
        </div>
      </div>
    </div>
  );
}
