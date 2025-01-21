import React from 'react'

function PageTitle() {
  return (
    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10">
      <div className="relative">
        <h1 className="text-5xl font-bold font-serif tracking-[0.2em] text-yellow-400 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          BLACKJACK
        </h1>
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
        <div className="absolute -top-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
      </div>
    </div>
  )
}

export default PageTitle 