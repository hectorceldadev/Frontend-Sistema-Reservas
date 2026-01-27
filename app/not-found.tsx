import Link from "next/link"

const NotFound = () => {
  return (
    <div className="h-screen relative z-10 flex flex-col items-center justify-center text-foreground p-4 text-center">
      <h2 className="text-6xl font-title font-bold mb-4 text-primary">404</h2>
      <p className="text-xl mb-8 font-regular">Vaya, parece que te has perdido.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary text-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
      >
        Volver al Inicio
      </Link>
    </div>
  )
}

export default NotFound
