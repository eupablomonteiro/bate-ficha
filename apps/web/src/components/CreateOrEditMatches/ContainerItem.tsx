import React from 'react'

interface ContainerItemProps {
  children: React.ReactNode;
}

export const ContainerItem = ({ children }: ContainerItemProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">{children}</div>
  )
}
