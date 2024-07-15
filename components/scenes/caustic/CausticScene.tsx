'use client'

import {
  AccumulativeShadows,
  Caustics,
  Center,
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  RandomizedLight,
  useGLTF,
} from '@react-three/drei'
import { _roots, useFrame, useThree } from '@react-three/fiber'
import { useCanvasApi } from 'app/Canvas'
import { easing } from 'maath'
import { useTheme } from 'next-themes'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const innerMaterial = new THREE.MeshStandardMaterial({
  transparent: true,
  opacity: 1,
  color: 'black',
  roughness: 0,
  side: THREE.FrontSide,
  blending: THREE.AdditiveBlending,
  polygonOffset: true,
  polygonOffsetFactor: 1,
  envMapIntensity: 2,
})

export default function CausticScene({ perfSucks = false }) {
  const { resolvedTheme } = useTheme()

  return (
    <AsyncPreload
      mountOnLoad={
        <group position={[0, -0.5, 0]} rotation={[0, -0.75, 0]}>
          <AccumulativeShadows
            frames={100}
            alphaTest={0.75}
            opacity={0.8}
            color={resolvedTheme === 'dark' ? '#5e00d3' : 'red'}
            scale={20}
            position={[0, -0.005, 0]}
          >
            <RandomizedLight
              amount={8}
              radius={6}
              ambient={0.5}
              intensity={Math.PI}
              position={[-1.5, 2.5, -2.5]}
              bias={0.001}
            />
          </AccumulativeShadows>
          <IsLoadedWhenMounted />
        </group>
      }
    >
      {resolvedTheme === 'dark' ? (
        <color attach="background" args={['#0d0d0d']} />
      ) : (
        <color attach="background" args={['#f0f0f0']} />
      )}

      <group position={[0, -0.5, 0]} rotation={[0, -0.75, 0]}>
        <Scene />
      </group>
      <Env perfSucks={perfSucks} theme={resolvedTheme ?? 'light'} />
    </AsyncPreload>
  )
}

/*
Kit-bash auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.1.3 scene.glb --transform
Licenses: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Authors:
  matousekfoto (https://sketchfab.com/matousekfoto) (Fruit Cake Slice)
    https://sketchfab.com/3d-models/fruit-cake-slice-7b9a33386eab4dd986aa0980054ead3c
  Felix Yadomi (https://sketchfab.com/felixyadomi) (Cute milkshake)
    https://sketchfab.com/3d-models/cute-milkshake-3ba52a41b4b248df953684861d9e7a20
  Second Studio (https://sketchfab.com/kayaaku) (Dry flower)
    https://sketchfab.com/3d-models/dry-flower-ff0005d6eb4d4077bd08b8992299c45c
  CDcruz (https://sketchfab.com/cdcruz) (Ikea - Pokal Glass Cups)
    https://sketchfab.com/3d-models/ikea-pokal-glass-cups-21837e54a14346aa900e1ae719779b86
*/
function Scene(props) {
  const { nodes: _nodes, materials } = useGLTF('/static/models/glass-transformed.glb')
  const nodes = _nodes as Record<string, THREE.Mesh>

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        rotation={[0, -0.5, 0]}
        geometry={nodes.cake.geometry}
        material={materials.FruitCakeSlice_u1_v1}
      />
      <mesh castShadow geometry={nodes.straw_1.geometry} material={materials.straw_2} />
      <mesh castShadow geometry={nodes.straw_2.geometry} material={materials.straw_1} />
      <mesh
        castShadow
        position={[0, -0.005, 0]}
        geometry={nodes.straw001_1.geometry}
        material={materials.straw_2}
      />
      <mesh
        castShadow
        position={[0, -0.005, 0]}
        geometry={nodes.straw001_2.geometry}
        material={materials.straw_1}
      />
      <Center rotation={[0, -0.4, 0]} position={[-1, -0.01, -2]} top>
        <mesh
          scale={1.2}
          castShadow
          geometry={nodes.flowers.geometry}
          material={materials['draifrawer_u1_v1.001']}
        />
      </Center>
      <mesh
        castShadow
        geometry={nodes.fork.geometry}
        material={materials.ForkAndKnivesSet001_1K}
        material-color="#999"
      />

      <Caustics
        backside
        color={[1, 0.8, 0.8]}
        lightSource={[-1.2, 3, -2]}
        intensity={0.003}
        worldRadius={0.26 / 10}
        ior={0.9}
        backsideIOR={1.26}
        causticsOnly={false}
      >
        <mesh castShadow receiveShadow geometry={nodes.glass.geometry}>
          <MeshTransmissionMaterial
            backside
            backsideThickness={0.1}
            thickness={0.05}
            chromaticAberration={0.05}
            anisotropicBlur={1}
            clearcoat={1}
            clearcoatRoughness={1}
            envMapIntensity={2}
            // resolution={2048}
          />
        </mesh>
      </Caustics>

      {/** Some hacks to get some back face reflections, otherwise the glass would look fake */}
      <mesh scale={[0.95, 1, 0.95]} geometry={nodes.glass_back.geometry} material={innerMaterial} />
      <mesh geometry={nodes.glass_inner.geometry} material={innerMaterial} />
    </group>
  )
}

function Env({ perfSucks, theme }: { perfSucks: boolean; theme: string }) {
  const ref = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    // Animate the environment as well as the camera
    if (!perfSucks) {
      easing.damp3(
        ref.current.rotation as unknown as THREE.Vector3,
        [Math.PI / 2, 0, state.clock.elapsedTime / 5 + state.pointer.x],
        0.2,
        delta
      )
      easing.damp3(
        state.camera.position,
        [
          Math.sin(state.pointer.x / 4) * 9,
          1.25 + state.pointer.y,
          Math.cos(state.pointer.x / 4) * 9,
        ],
        0.5,
        delta
      )
      state.camera.lookAt(0, 0, 0)
    }
  })

  // Runtime environments can be too slow on some systems, better safe than sorry with PerfMon
  return (
    <Environment
      frames={perfSucks ? 1 : Infinity}
      files={'/static/hdri/city.jpg'}
      resolution={256}
      background
      backgroundBlurriness={0.8}
    >
      <Lightformer
        intensity={theme === 'dark' ? 0 : 4}
        rotation-x={Math.PI / 2}
        position={[0, 5, -9]}
        scale={[10, 10, 1]}
      />
      <Lightformer
        intensity={theme === 'dark' ? 0 : 4}
        rotation-x={Math.PI / 2}
        position={[0, 5, -9]}
        scale={[10, 10, 1]}
      />

      <group rotation={[Math.PI / 2, 1, 0]}>
        {[2, -2, 2, -4, 2, -5, 2, -9].map((x, i) => (
          <Lightformer
            key={i}
            intensity={1}
            rotation={[Math.PI / 4, 0, 0]}
            position={[x, 4, i * 4]}
            scale={[4, 1, 1]}
          />
        ))}
        <Lightformer
          intensity={0.5}
          rotation-y={Math.PI / 2}
          position={[-5, 1, -1]}
          scale={[50, 2, 1]}
        />
        <Lightformer
          intensity={0.5}
          rotation-y={Math.PI / 2}
          position={[-5, -1, -1]}
          scale={[50, 2, 1]}
        />
        <Lightformer
          intensity={0.5}
          rotation-y={-Math.PI / 2}
          position={[10, 1, 0]}
          scale={[50, 2, 1]}
        />
      </group>

      <group ref={ref}>
        <Lightformer
          intensity={5}
          form="ring"
          color={theme === 'dark' ? '#5e00d3' : 'red'}
          rotation-y={Math.PI / 2}
          position={[-5, 2, -1]}
          scale={[10, 10, 1]}
        />
      </group>
    </Environment>
  )
}

function AsyncPreload({
  children,
  mountOnLoad,
}: {
  children: React.ReactNode
  mountOnLoad?: React.ReactNode
}) {
  const group = useRef<THREE.Group>(null!)

  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)

  const [isLoaded, setIsLoaded] = useState(false)

  useLayoutEffect(() => {
    group.current.visible = false

    scene.traverse((child) => {
      // Init all textures
      if (child instanceof THREE.Mesh) {
        if (child.material.map) gl.initTexture(child.material.map)
        if (child.material.normalMap) gl.initTexture(child.material.normalMap)
        if (child.material.roughnessMap) gl.initTexture(child.material.roughnessMap)
        if (child.material.metalnessMap) gl.initTexture(child.material.metalnessMap)
      }
    })

    gl.compileAsync(group.current, camera, scene).then(() => {
      group.current.visible = true
      setIsLoaded(true)
    })
  }, [gl, scene, camera, children])

  return (
    <group ref={group} visible={false}>
      {children}
      {isLoaded && mountOnLoad}
    </group>
  )
}

function IsLoadedWhenMounted() {
  const setIsLoaded = useCanvasApi((state) => state.setIsLoaded)

  useEffect(() => {
    setIsLoaded(true)
  }, [setIsLoaded])

  return null
}
