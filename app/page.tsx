export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-base-200 text-base-content">
      <div className="card w-96 bg-base-100 shadow-xl p-8 text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">
          Hello World!
        </h1>
        <p className="text-lg">
          Now using Roboto font and DaisyUI for styling.
        </p>
        <button className="btn btn-primary mt-6">Click Me!</button>
      </div>
    </main>
  )
}