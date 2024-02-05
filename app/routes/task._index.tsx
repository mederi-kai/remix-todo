import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import { Form, Link, json, redirect, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import SearchForm from "~/components/SearchForm";
import { TaskRecord, getNewTaskId } from "~/mocks/task";

interface Env {
  DB: D1Database;
}

export const meta: MetaFunction = () => {
  return [{ name: "title", content: "タスク一覧" }];
};

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const env = context.env as Env;
  let query = "SELECT * FROM tasks";
  const params: string[] = [];

  if (q) {
    // 検索クエリが指定されている場合、WHERE句で絞り込み
    query += " WHERE title LIKE ? OR description LIKE ?";
    // SQLのLIKE句で部分一致を行うためには、検索文字列の前後に%を追加
    params.push(`%${q}%`, `%${q}%`);
  }

  query += " ORDER BY createdAt DESC";

  const { results: tasks } = await env.DB.prepare(query)
    .bind(...params)
    .all<TaskRecord>();

  return json({ tasks, q });
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title");
  if (!title) {
    return json({ error: "タイトルを入力してください" }, { status: 400 });
  }
  invariant(typeof title === "string", "title must be a string");

  const env = context.env as Env;
  const newTaskId = getNewTaskId();
  await env.DB.prepare(
    "INSERT INTO tasks (id, title, description, completed, createdAt) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(newTaskId, title, "", "false", new Date().toISOString())
    .run();

  return redirect(`/task/${newTaskId}/edit`);
};

export default function Task() {
  const { q, tasks } = useLoaderData<typeof loader>();

  const tabContents = [
    { name: "未完了のタスク", tasks: tasks.filter((t) => !t.completed) },
    { name: "完了済みのタスク", tasks: tasks.filter((t) => t.completed) },
  ];

  return (
    <>
      <div>
        <div className="w-full mx-2 mb-10">
          <SearchForm q={q} />
        </div>
        <div className="flex-1">
          <div className="flex">
            {tabContents.map((tab, index) => {
              return (
                <div key={index} className="flex-1 mx-2">
                  <p>{tab.name}</p>
                  {tab.tasks.length === 0 ? (
                    <div className="my-2">
                      <i className="text-sm">見つかりませんでした</i>
                    </div>
                  ) : (
                    tab.tasks.map((task) => {
                      return (
                        <Link key={task.id} to={task.id}>
                          <div id="card">
                            {task.completed ? (
                              <div className="flex items-center">
                                <span>☑︎</span>
                                <h6 className="text-xs mx-1">完了済み</h6>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <span>□</span>
                                <h6 className="text-xs mx-1">未完了</h6>
                              </div>
                            )}

                            <h2>{task.title}</h2>
                            <h2>{task.description}</h2>
                            <p>作成日時: {task.createdAt ?? "-"}</p>
                            {task.updatedAt && (
                              <p>更新日時: {task.updatedAt}</p>
                            )}
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div id="bottom">
        <Form method="post" className="py-2">
          <input
            type="text"
            name="title"
            placeholder="新規タスクを入力"
            required
          />
          <button type="submit" className="mx-2">
            新規作成
          </button>
        </Form>
      </div>
    </>
  );
}
