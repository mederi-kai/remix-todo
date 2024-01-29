import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import invariant from "tiny-invariant";
import { deleteTask } from "~/mocks/task";

export const action = async ({ params }: ActionFunctionArgs) => {
  invariant(params.taskId, "Missing taskId param");
  await deleteTask(params.taskId);
  return redirect("/task");
};
