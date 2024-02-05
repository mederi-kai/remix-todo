import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/cloudflare";
import invariant from "tiny-invariant";

interface Env {
  DB: D1Database;
}

export const action = async ({ context, params }: ActionFunctionArgs) => {
  invariant(params.taskId, "Missing taskId param");
  const env = context.env as Env;
  await env.DB.prepare("DELETE FROM tweets WHERE task_id = ?")
    .bind(params.taskId)
    .run();
  await env.DB.prepare("DELETE FROM tasks WHERE id = ?")
    .bind(params.taskId)
    .run();
  return redirect("/task");
};
