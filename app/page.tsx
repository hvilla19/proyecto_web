import AppLayout from "./components/layout/AppLayout";

export default function Home() {
  return (
    <AppLayout>
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Inicio
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Bienvenido al sistema de gestión.
        </p>
      </div>
    </AppLayout>
  );
}
