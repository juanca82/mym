import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Barra de navegación persistente */}
      <Navigation />

      {/* Contenido de la página */}
      <main className="flex-grow p-4 pt-20"> {/* Se ajusta el padding-top para que no se solape con la barra de navegación */}
        <Outlet />
      </main>
    </div>
  );
}