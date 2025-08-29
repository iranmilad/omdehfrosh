import React from 'react'

function HoverBox({children,active}) {
  return (
    <div className={`p-2 border border-solid hover:border-gray-300 `}>
        {children}
    </div>
  )
}

export default HoverBox