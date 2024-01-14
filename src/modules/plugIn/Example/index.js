import { formatText, textColors } from "../../../client";
export const name = "Example";
export const Description = "Example";
export const command = (answer) => {
  console.log(formatText(answer, textColors.Pink));
};
export const exec = (clients, data) => {
  // console.log(clients, data);
};
