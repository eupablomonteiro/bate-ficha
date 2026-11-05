import { Label } from "@/components/ui/label";

interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

const LabelField = ({ htmlFor, children }: LabelProps) => {
  return (
    <Label htmlFor={htmlFor} className="text-zinc-200 text-sm font-bold">
      {children}
    </Label>
  );
};

export default LabelField;
