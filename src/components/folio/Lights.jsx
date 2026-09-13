export function Lights() {
  return (
    <>
      <ambientLight intensity={0.58} color="#f7f3ec" />
      <hemisphereLight args={["#fff8f0", "#8a8780", 0.42]} />
      <directionalLight
        position={[3.4, 5.2, 4.2]}
        intensity={1.28}
        color="#fff7ee"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={22}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.00025}
      />
      <directionalLight position={[-5.2, 1.8, 2.4]} intensity={0.38} color="#ffe8d8" />
      <directionalLight position={[0.4, 2.6, -5]} intensity={0.28} color="#dce7ff" />
    </>
  );
}
