import { Outlet } from "react-router";
import { InfrastructureBackground } from "./InfrastructureBackground";

export function Root() {
  return (
    <>
      <InfrastructureBackground />
      <Outlet />
    </>
  );
}