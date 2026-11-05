import { Input } from "../ui/input";

interface InputFieldProps {
  id: string;
  name: string;
  type: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const InputField = ({
  id,
  name,
  type,
  value,
  placeholder,
  onChange,
  className,
}: InputFieldProps) => {
  return (
    <Input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      className={`bg-zinc-800 pr-10 text-zinc-200 font-bold placeholder:text-zinc-500 placeholder:font-normal border-none ${className}`}
      onChange={onChange}
      required
    />
  );
};

export default InputField;
