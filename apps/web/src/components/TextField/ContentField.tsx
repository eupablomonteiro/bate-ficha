interface ContentFieldProps {
  children: React.ReactNode;
}

const ContentField = ({ children }: ContentFieldProps) => {
  return (
    <div className="relative">{children}</div>
  )
}

export default ContentField