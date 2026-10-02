import { PointerEvent, useRef, useState, WheelEvent } from 'react'
import { createPortal } from 'react-dom'
import { useModalBehaviour } from '../../../../../util/ui/useModalBehaviour'
import { CardImage } from '../CardImage/CardImage'
import styles from './ImageZoom.module.scss'

interface ImageZoomProps {
  sources: (string | undefined)[]
  alt: string
  onClose: () => void
}

interface Point {
  x: number
  y: number
}

interface Transform {
  scale: number
  x: number
  y: number
}

type Gesture =
  | { kind: 'pan'; start: Point; startTransform: Transform; moved: boolean }
  | { kind: 'pinch'; startDistance: number; startMidpoint: Point; startTransform: Transform }

const maxScale = 5
const tapZoomScale = 2.5
const dragThreshold = 6
const doubleTapMilliseconds = 300
const wheelZoomSpeed = 0.002
const initialTransform: Transform = { scale: 1, x: 0, y: 0 }

const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y)
const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
const clampValue = (value: number, limit: number): number => Math.min(Math.max(value, -limit), limit)

export function ImageZoom({ sources, alt, onClose }: ImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  useModalBehaviour(containerRef, onClose)

  const [transform, setTransform] = useState<Transform>(initialTransform)
  const [isGesturing, setGesturing] = useState(false)
  const transformRef = useRef(transform)
  transformRef.current = transform
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<Gesture | undefined>(undefined)
  const lastTapTime = useRef(0)

  const clamp = (next: Transform): Transform => {
    const frame = frameRef.current
    const scale = Math.min(Math.max(next.scale, 1), maxScale)
    if (frame == null) {
      return { ...next, scale }
    }
    return {
      scale,
      x: clampValue(next.x, (frame.offsetWidth * (scale - 1)) / 2),
      y: clampValue(next.y, (frame.offsetHeight * (scale - 1)) / 2)
    }
  }

  const stageCenter = (): Point => {
    const rect = stageRef.current?.getBoundingClientRect()
    return rect == undefined ? { x: 0, y: 0 } : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  }

  const zoomAround = (anchor: Point, target: Point, scale: number, from: Transform): Transform => {
    const center = stageCenter()
    const imageX = (anchor.x - center.x - from.x) / from.scale
    const imageY = (anchor.y - center.y - from.y) / from.scale
    return clamp({ scale, x: target.x - center.x - imageX * scale, y: target.y - center.y - imageY * scale })
  }

  const isOnImage = (point: Point): boolean => {
    const rect = frameRef.current?.getBoundingClientRect()
    return rect != undefined && point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
  }

  const toggleZoom = (point: Point) => {
    const current = transformRef.current
    setTransform(current.scale > 1 ? initialTransform : zoomAround(point, point, tapZoomScale, current))
  }

  const handleTap = (point: Point, pointerType: string) => {
    if (transformRef.current.scale == 1 && !isOnImage(point)) {
      onClose()
      return
    }
    if (pointerType == 'mouse') {
      toggleZoom(point)
      return
    }
    const now = performance.now()
    if (now - lastTapTime.current < doubleTapMilliseconds) {
      lastTapTime.current = 0
      toggleZoom(point)
    } else {
      lastTapTime.current = now
    }
  }

  const startPan = (point: Point, moved: boolean) => {
    gesture.current = { kind: 'pan', start: point, startTransform: transformRef.current, moved }
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType == 'mouse' && event.button != 0) {
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = { x: event.clientX, y: event.clientY }
    pointers.current.set(event.pointerId, point)
    const [first, second] = Array.from(pointers.current.values())
    if (second != undefined) {
      gesture.current = {
        kind: 'pinch',
        startDistance: distance(first, second),
        startMidpoint: midpoint(first, second),
        startTransform: transformRef.current
      }
      setGesturing(true)
    } else {
      startPan(point, false)
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) {
      return
    }
    const point = { x: event.clientX, y: event.clientY }
    pointers.current.set(event.pointerId, point)
    const current = gesture.current
    if (current?.kind == 'pinch') {
      const [first, second] = Array.from(pointers.current.values())
      const scale = current.startTransform.scale * (distance(first, second) / current.startDistance)
      setTransform(zoomAround(current.startMidpoint, midpoint(first, second), scale, current.startTransform))
      return
    }
    if (current?.kind == 'pan') {
      const deltaX = point.x - current.start.x
      const deltaY = point.y - current.start.y
      if (!current.moved && Math.hypot(deltaX, deltaY) < dragThreshold) {
        return
      }
      current.moved = true
      if (current.startTransform.scale > 1) {
        setGesturing(true)
        setTransform(clamp({ ...current.startTransform, x: current.startTransform.x + deltaX, y: current.startTransform.y + deltaY }))
      }
    }
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) {
      return
    }
    const point = { x: event.clientX, y: event.clientY }
    pointers.current.delete(event.pointerId)
    const current = gesture.current
    const remaining = Array.from(pointers.current.values())[0]
    if (remaining != undefined) {
      startPan(remaining, true)
      return
    }
    gesture.current = undefined
    setGesturing(false)
    if (current?.kind == 'pan' && !current.moved && event.type == 'pointerup') {
      handleTap(point, event.pointerType)
    }
  }

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const point = { x: event.clientX, y: event.clientY }
    const current = transformRef.current
    setTransform(zoomAround(point, point, current.scale * Math.exp(-event.deltaY * wheelZoomSpeed), current))
  }

  const isZoomed = transform.scale > 1

  return createPortal(
    <div className={styles.imageZoom} ref={containerRef} role='dialog' aria-modal='true' aria-label={alt}>
      <div
        ref={stageRef}
        className={`${styles.stage} ${isZoomed ? styles.zoomedIn : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <div
          ref={frameRef}
          className={`${styles.frame} ${isGesturing ? '' : styles.animated}`}
          style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
        >
          <CardImage className={styles.image} sources={sources} alt={alt} />
        </div>
      </div>
      <button type='button' className={styles.closeButton} aria-label='Close zoom' onClick={onClose}>
        ×
      </button>
    </div>,
    document.body
  )
}
