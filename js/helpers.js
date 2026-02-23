export const REPO_URL =
  "https://raw.githubusercontent.com/parabolestudio/molocobcgverticals/refs/heads/main/";

export const getVariableClass = (variable) => {
  return variable.toLowerCase().replace(/\s/g, "-");
};
