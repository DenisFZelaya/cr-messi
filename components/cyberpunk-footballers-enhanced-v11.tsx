'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sphere, Box, useTexture, MeshDistortMaterial } from '@react-three/drei'

const players = {
  ronaldo: {
    name: 'Cristiano Ronaldo',
    stats: {
      cabeza: { total: 110, club: 85, seleccion: 25 },
      pecho: { total: 10, club: 8, seleccion: 2 },
      pieDerecho: { total: 488, club: 410, seleccion: 78 },
      pieIzquierdo: { total: 148, club: 130, seleccion: 18 },
      otro: { total: 49, club: 40, seleccion: 9 },
    },
  },
  messi: {
    name: 'Lionel Messi',
    stats: {
      cabeza: { total: 24, club: 20, seleccion: 4 },
      pecho: { total: 8, club: 7, seleccion: 1 },
      pieDerecho: { total: 588, club: 520, seleccion: 68 },
      pieIzquierdo: { total: 91, club: 80, seleccion: 11 },
      otro: { total: 34, club: 30, seleccion: 4 },
    },
  },
}

type BodyPart = 'cabeza' | 'pecho' | 'pieDerecho' | 'pieIzquierdo' | 'otro'
type TeamType = 'total' | 'club' | 'seleccion'

const AnimatedSphere = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef()


  useFrame((state) => {
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1
  })

  return (
    <Sphere ref={meshRef} position={position} args={[0.1, 32, 32]}>
      <MeshDistortMaterial
        color="#06B6D4"
        emissive="#06B6D4"
        emissiveIntensity={0.5}
        distort={0.4}
        speed={2}
      />
    </Sphere>
  )
}

const AnimatedBox = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef()

  useFrame((state) => {
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2
    meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime) * 0.2
  })

  return (
    <Box ref={meshRef} position={position} args={[0.2, 0.2, 0.2]}>
      <MeshDistortMaterial
        color="#818CF8"
        emissive="#818CF8"
        emissiveIntensity={0.5}
        distort={0.4}
        speed={2}
      />
    </Box>
  )
}

const AnimatedBackground = () => {
  const { camera } = useThree()
  const groupRef = useRef()

  useFrame((state) => {
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    groupRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.1) * 0.1
    camera.position.z = 5 + Math.sin(state.clock.elapsedTime * 0.1) * 0.5
  })

  return (
    <group ref={groupRef}>
      {[...Array(30)].map((_, i) => (
        <AnimatedSphere key={`sphere-${i}`} position={[Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5]} />
      ))}
      {[...Array(15)].map((_, i) => (
        <AnimatedBox key={`box-${i}`} position={[Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5]} />
      ))}
    </group>
  )
}

const BodyFigure = ({ stats, name, isRonaldo, teamType }: { stats: typeof players.ronaldo.stats, name: string, isRonaldo: boolean, teamType: TeamType }) => {
  const [hoveredPart, setHoveredPart] = useState<BodyPart | null>(null)
  const [winningParts, setWinningParts] = useState<BodyPart[]>([])

  useEffect(() => {
    const winning = Object.keys(stats).filter(part => {
      const playerStats = stats[part as BodyPart][teamType]
      const opponentStats = isRonaldo ? players.messi.stats[part as BodyPart][teamType] : players.ronaldo.stats[part as BodyPart][teamType]
      return playerStats > opponentStats
    })
    setWinningParts(winning as BodyPart[])
  }, [stats, teamType, isRonaldo])

  const handleMouseEnter = (part: BodyPart) => setHoveredPart(part)
  const handleMouseLeave = () => setHoveredPart(null)

  const goldAnimation = {
    animate: {
      filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'],
      transition: { duration: 3, repeat: Infinity, ease: "linear" }
    }
  }

  const spanishBodyParts: { [key in BodyPart]: string } = {
    cabeza: 'Cabeza',
    pecho: 'Pecho',
    pieDerecho: 'Pie Derecho',
    pieIzquierdo: 'Pie Izquierdo',
    otro: 'Otro'
  }

  return (
    <div className="relative w-full h-96 mx-auto">
      <svg viewBox="0 0 100 150" className="w-full h-full">
        <defs>
          <linearGradient id={`bodyGradient${isRonaldo ? 'Ronaldo' : 'Messi'}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isRonaldo ? "#00FFFF" : "#FF00FF"} />
            <stop offset="100%" stopColor={isRonaldo ? "#0000FF" : "#800080"} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <pattern id="bodyPattern" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#ffffff20" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100" height="150" fill="url(#bodyPattern)" />
        {Object.entries(stats).map(([part, _]) => {
          const bodyPart = part as BodyPart
          let path = ""
          switch (bodyPart) {
            case 'cabeza':
              path = "M50 5 Q65 5 65 20 Q65 35 50 40 Q35 35 35 20 Q35 5 50 5"
              break
            case 'pecho':
              path = "M40 40 Q50 38 60 40 L65 80 Q50 85 35 80 Z"
              break
            case 'pieDerecho':
              path = "M65 80 Q60 85 60 120 Q65 125 70 120 Q70 100 65 80"
              break
            case 'pieIzquierdo':
              path = "M35 80 Q40 85 40 120 Q35 125 30 120 Q30 100 35 80"
              break
            case 'otro':
              path = "M35 45 Q25 55 20 80 Q15 82 25 85 Q30 65 38 50 M65 45 Q75 55 80 80 Q85 82 75 85 Q70 65 62 50"
              break
          }
          return (
            <motion.path
              key={bodyPart}
              d={path}
              className={`cursor-pointer ${winningParts.includes(bodyPart) ? 'fill-yellow-400' : `fill-[url(#bodyGradient${isRonaldo ? 'Ronaldo' : 'Messi'})]`}`}
              onMouseEnter={() => handleMouseEnter(bodyPart)}
              onMouseLeave={handleMouseLeave}
              whileHover={{ scale: 1.1 }}
              {...(winningParts.includes(bodyPart) ? goldAnimation : {})}
              filter="url(#glow)"
            />
          )
        })}
      </svg>
      {hoveredPart && (
        <Badge className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white">
          {spanishBodyParts[hoveredPart]}: {stats[hoveredPart][teamType]}
        </Badge>
      )}
      <h2 className="text-center text-xl font-bold text-cyan-400 mt-4">{name}</h2>
    </div>
  )
}

const ComparisonChart = ({ teamType }: { teamType: TeamType }) => {
  const spanishLabels: { [key: string]: string } = {
    cabeza: 'Cabeza',
    pecho: 'Pecho',
    pieDerecho: 'Pie Derecho',
    pieIzquierdo: 'Pie Izquierdo',
    otro: 'Otro'
  }

  const data = Object.keys(players.ronaldo.stats).map(key => ({
    name: spanishLabels[key],
    ronaldo: players.ronaldo.stats[key as BodyPart][teamType],
    messi: players.messi.stats[key as BodyPart][teamType],
  }))

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <AnimatePresence>
        {data.map((item, index) => (
          <motion.div
            key={index}
            className="w-full flex items-center justify-center my-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="w-1/2 text-right pr-2 relative">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-8 absolute right-0 top-0 rounded-l-full"
                initial={{ width: 0 }}
                animate={{ width: `${(item.ronaldo / Math.max(item.ronaldo, item.messi)) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              />
              <span className="relative z-10 text-xs font-bold mr-2">{item.ronaldo}</span>
            </div>
            <div className="w-24 text-center font-bold text-xs bg-gray-800 py-1 px-2 rounded-full z-10">
              {item.name}
            </div>
            <div className="w-1/2 pl-2 relative">
              <motion.div
                className="bg-gradient-to-l from-fuchsia-500 to-purple-500 h-8 absolute left-0 top-0 rounded-r-full"
                initial={{ width: 0 }}
                animate={{ width: `${(item.messi / Math.max(item.ronaldo, item.messi)) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              />
              <span className="relative z-10 text-xs font-bold ml-2">{item.messi}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

const TotalGoalsChart = ({ teamType }: { teamType: TeamType }) => {
  const ronaldoTotal = Object.values(players.ronaldo.stats).reduce((sum, stat) => sum + stat[teamType], 0)
  const messiTotal = Object.values(players.messi.stats).reduce((sum, stat) => sum + stat[teamType], 0)
  const maxTotal = Math.max(ronaldoTotal, messiTotal)

  return (
    <div className="w-full mt-8 p-4 bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold text-center text-cyan-400 mb-4">Total de Goles</h3>
      <div className="flex justify-between items-center">
        <div className="w-5/12 text-right">
          <span className="text-lg font-bold text-cyan-400">{ronaldoTotal}</span>
        </div>
        <div className="w-2/12 text-center">
          <span className="text-sm font-bold text-gray-400">vs</span>
        </div>
        <div className="w-5/12">
          <span className="text-lg font-bold text-fuchsia-400">{messiTotal}</span>
        </div>
      </div>
      <div className="mt-2 h-8 bg-gray-700 rounded-full overflow-hidden flex">
        <motion.div
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${(ronaldoTotal / maxTotal) * 100}%` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        <motion.div
          className="bg-gradient-to-l from-fuchsia-500 to-purple-500 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${(messiTotal / maxTotal) * 100}%` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-sm font-bold text-cyan-400">Ronaldo</span>
        <span className="text-sm font-bold text-fuchsia-400">Messi</span>
      </div>
    </div>
  )
}

export function CyberpunkFootballersEnhancedV11() {
  const [teamType, setTeamType] = useState<TeamType>('total')

  return (
    <div className="relative min-h-screen bg-gray-900 text-white p-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <AnimatedBackground />
        </Canvas>
      </div>
      <div className="relative z-10 bg-gray-900 bg-opacity-80 p-6 rounded-lg">
        <h1 className="text-4xl font-bold mb-8 text-center text-cyan-400 tracking-wider">CR7 vrs Messi</h1>
        <Tabs defaultValue="total" className="w-full mb-8" onValueChange={(value) => setTeamType(value as TeamType)}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="total" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-md transition-all">Total</TabsTrigger>
            <TabsTrigger value="club" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-md transition-all">Club</TabsTrigger>
            <TabsTrigger value="seleccion" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-md transition-all">Selección</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <BodyFigure stats={players.ronaldo.stats} name={players.ronaldo.name} isRonaldo={true} teamType={teamType} />
          <div className="space-y-8">
            <TotalGoalsChart teamType={teamType} />
            <ComparisonChart teamType={teamType} />
          </div>
          <BodyFigure stats={players.messi.stats} name={players.messi.name} isRonaldo={false} teamType={teamType} />
        </div>
      </div>
    </div>
  )
}