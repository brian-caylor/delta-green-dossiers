import { createContext } from "react";

// Split from DiceRollerProvider so the provider component can live in a
// .jsx file (fast-refresh friendly) and the context definition stays in
// a .js file with no React-component exports.
export const DiceRollerContext = createContext(null);
