export default function DemoCard() {
  return (
    <div className="m-8 rounded-xl border p-6 shadow">
      <h2 className="text-xl font-semibold">Hello Tailwind</h2>
      <p className="mt-2 text-slate-600">If this looks styled, Tailwind works.</p>
      <button className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
        Click me
      </button>
    </div>
  );
}