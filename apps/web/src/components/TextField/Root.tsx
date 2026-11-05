interface RootProps {
  children: React.ReactNode;
}

const Root = ({ children }: RootProps) => {
  return (
    <div className="space-y-1">{children}</div>
  )
}

export default Root;