import { useState } from 'react'
import { animatedSpriteUrl, spriteUrl } from '../../util/api/pokemonTGC/model/Pokemon'

interface AnimatedSpriteProps {
  pokedexNumber: number
  className?: string
}

const unavailableAnimations = new Set<number>()

const prefersReducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

export function AnimatedSprite({ pokedexNumber, className }: AnimatedSpriteProps) {
  const [failedNumber, setFailedNumber] = useState<number | undefined>(undefined)
  const isAnimated = !prefersReducedMotion() && !unavailableAnimations.has(pokedexNumber) && failedNumber != pokedexNumber

  return (
    <img
      key={isAnimated ? 'animated' : 'static'}
      className={className}
      src={isAnimated ? animatedSpriteUrl(pokedexNumber) : spriteUrl(pokedexNumber)}
      alt=''
      onError={(event) => {
        if (isAnimated) {
          unavailableAnimations.add(pokedexNumber)
          setFailedNumber(pokedexNumber)
        } else {
          event.currentTarget.hidden = true
        }
      }}
    />
  )
}
